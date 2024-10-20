import os.path
from pathlib import Path

from flask import url_for
import requests
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google.oauth2 import id_token
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

import base64
import re
from dataclasses import dataclass


@dataclass
class AttachmentData:
    body: str
    content_type: str


@dataclass
class EmailData:
    date: str
    from_: str
    to: str
    subject: str
    body: str
    content_type: str
    message_id: str
    attachments: list[AttachmentData]


TEMP_IMG_PATH = Path("./backend/data/images/")


def header_value(header: dict, header_name: str):
    try:
        ind = [e["name"] for e in header].index(header_name)
    except ValueError:
        return None
    else:
        return header[ind]["value"]


# (processed content, image links)
def process_html(html: str) -> tuple[str, list[str]]:
    if html is None:
        return None

    html = re.sub(r"[\r\n\t]", " ", html)
    image_urls = re.findall(r'<img.*src="(?P<url>https?://[^\s]+)".*/?>', html)
    html = re.sub(r"<style.*?>.*?</style>", " ", html)
    html = re.sub(r"<.*?>", r" ", html)
    html = html.replace("      ", " ")

    image_urls = [image_url for image_url in image_urls if image_url.split(
        ".")[-1].lower() in ["png", "jpg", "gif", "tif", "bmp", "tiff"]]

    return html, image_urls


def preprocess_emails(txt: str) -> str:
    txt = re.sub(r"<?http(?s:.*?) >?", r"", txt)
    txt = re.sub(r"&#?....;", r"", txt)
    return txt
    # html = re.sub(r"http(?s:.*?)$", r"", html)


def decode_body(body: dict):
    if body.get("data", None) is not None:
        value = base64.urlsafe_b64decode(body["data"]).decode("utf-8")
        value = re.sub(r"[\r\n]", " ", value)
        return value


def decode_and_save_attachments(body: dict, filename: str) -> str:
    uri = TEMP_IMG_PATH / filename
    if body.get("data", None) is not None:
        img = base64.urlsafe_b64decode(body["data"])
        with open(uri, "wb") as fobj:
            fobj.write(img)
    return str(uri)


def download_images(urls: list[str]) -> list[str]:
    result = []
    for url in urls:
        try:
            img_data = requests.get(url).content
            local_path = TEMP_IMG_PATH / Path(url).parts[-1]
            with open(local_path, "wb") as fobj:
                fobj.write(img_data)
            result.append(str(local_path))
        except:
            pass
    return result


class GmailAPI:
    # If modifying these scopes, delete the file token.json.
    SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

    def __init__(self):
        self.auth_state = None
        self.creds = None
        self.service = None

    def login(self) -> str:
        # print("LOGIN?")
        auth_url = ""

        # The file token.json stores the user's access and refresh tokens, and is
        # created automatically when the authorization flow completes for the first
        # time.
        if os.path.exists("token.json"):
            self.creds = Credentials.from_authorized_user_file(
                "token.json", self.SCOPES)
            self.instantiate()

        # If there are no (valid) credentials available, let the user log in.
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                self.creds.refresh(Request())
                self.instantiate()
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    "credentials.json", GmailAPI.SCOPES
                )
                flow.redirect_uri = url_for('callback', _external=True)
                auth_url, self.auth_state = flow.authorization_url(
                    access_type='offline',
                    prompt='select_account'
                )
                print(self.auth_state)

        return auth_url

    def login_callback(self, auth_resp):
        flow = InstalledAppFlow.from_client_secrets_file(
            "credentials.json", scopes=GmailAPI.SCOPES, state=self.auth_state)
        flow.redirect_uri = url_for('callback', _external=True)

        flow.fetch_token(authorization_response=auth_resp)
        self.creds = flow.credentials

        self.instantiate()

    def instantiate(self):
        try:
            # Call the Gmail API
            with open("token.json", "w") as token:
                token.write(self.creds.to_json())
            self.service = build("gmail", "v1", credentials=self.creds)

        except HttpError as error:
            print(f"Error in loading Gmail API service: {error}")

    def get_email(self):
        if self.creds and self.creds.valid:
            try:
                profile = self.service.users().getProfile(userId='me').execute()
                email_address = profile.get('emailAddress')
                return email_address
            except HttpError as error:
                print(f"An error occurred: {error}")
                return None
        else:
            print("No valid credentials found.")
            return None

    def get_emails(self, count=100) -> tuple[list[EmailData], list[str]]:
        current_user = self.service.users().messages().list(
            userId="me", maxResults=count).execute()
        messages = current_user.get("messages", [])
        image_uris = []

        data = []
        for message in messages:
            image_uris.append([])

            payload = self.service.users().messages().get(
                userId="me", id=message["id"], format="full").execute()["payload"]
            headers = payload["headers"]
            body = payload["body"]
            print(headers)
            data.append(
                EmailData(
                    date=header_value(headers, "Date"),
                    from_=header_value(headers, "From"),
                    to=header_value(headers, "Delivered-To"),
                    subject=header_value(headers, "Subject"),
                    body=decode_body(body),
                    content_type=header_value(headers, "Content-Type"),
                    message_id=header_value(headers, "Message-ID"),
                    attachments=[],
                )
            )
            # print(">>>>>>", headers)

            parts = payload.get("parts", None)
            if parts is not None:
                for part in parts:
                    headers = part["headers"]
                    # print("!!!!!!!!", part["body"]) #header_value(headers, "Content-Type"))
                    if part["filename"] and header_value(headers, "Content-Type").startswith("image"):
                        # print(headers)
                        attachment_id = part["body"]["attachmentId"]
                        attachment_ref = self.service.users().messages().attachments().get(
                            userId="me", messageId=data[-1].message_id, id=attachment_id).execute()

                        uri = decode_and_save_attachments(
                            attachment_ref, part["filename"])
                        image_uris[-1].append(uri)

                    body = part["body"]
                    data[-1].attachments.append(
                        AttachmentData(
                            body=decode_body(body),
                            content_type=header_value(headers, "Content-Type"),
                        )
                    )

        for i, email in enumerate(data):
            img_urls = []
            if "text/html" in email.content_type:
                email.body, attachment_img_urls = process_html(email.body)
                img_urls += attachment_img_urls
                # print("========", image_urls)
            if email.body is not None: email.body = preprocess_emails(email.body)

            
            print("###### ATTACHMENTS:", len(email.attachments))
            for attachment in email.attachments:
                if "text/html" in attachment.content_type:
                    attachment.body, attachment_img_urls = process_html(
                        attachment.body)
                    img_urls += attachment_img_urls
                    # print("<<<<<<<", image_urls)
                if attachment.body is not None: attachment.body = preprocess_emails(attachment.body)
            
            image_uris[i] += download_images(img_urls)

        print(image_uris)
        with open("data.txt", "wb") as fobj:
            fobj.write(str(data).encode())
        return data, image_uris


def debug_generate_token_json():
    flow = InstalledAppFlow.from_client_secrets_file(
        "credentials.json", GmailAPI.SCOPES
    )
    creds = flow.run_local_server(port=0)

    if creds:
        # Save the credentials for the next run
        with open("token.json", "w") as token:
            token.write(creds.to_json())


if __name__ == "__main__":
    # debug_generate_token_json()

    gmail = GmailAPI()
    gmail.login()
    emails, image_urls = gmail.get_emails(count=50)
    for mail, image_urls in zip(emails, image_urls):
        print(image_urls)
        print()
