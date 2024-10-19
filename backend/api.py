import os.path
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google.oauth2 import id_token
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

import base64
import re
from dataclasses import dataclass


# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]


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



def header_value(header: dict, header_name: str):
    try:
        ind = [e["name"] for e in header].index(header_name)
    except ValueError:
        return None
    else:
        return header[ind]["value"]
    

def process_html(html: str) -> tuple[str, list[str]]:  # (processed content, image links)
    if html is None:
        return None
    
    html = re.sub(r"[\r\n\t]", " ", html)
    image_urls = re.findall(r'<img.*src="(?P<url>https?://[^\s]+)".*/?>', html)
    html = re.sub(r"<style.*>.*</style>", " ", html)
    html = re.sub(r"<.*?>", r" ", html)
    html = html.replace("      ", " ")
    
    return html, image_urls
    

def decode_body(body: dict):
    if body.get("data", None) is not None:
        value = base64.urlsafe_b64decode(body["data"]).decode("utf-8")
        value = re.sub(r"[\r\n]", " ", value)
        return value
    

def decode_and_save_attachments(body: dict, file_path: Path):
    if body.get("data", None) is not None:
        img = base64.urlsafe_b64decode(body["data"])
        with open(file_path, "wb") as fobj:
            fobj.write(img)


class GmailAPI:
    def __init__(self):
        self.creds = None
        # The file token.json stores the user's access and refresh tokens, and is
        # created automatically when the authorization flow completes for the first
        # time.
        if os.path.exists("token.json"):
            self.creds = Credentials.from_authorized_user_file("token.json", SCOPES)
        # If there are no (valid) credentials available, let the user log in.
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                self.creds.refresh(Request())
            else:
                self.flow = InstalledAppFlow.from_client_secrets_file(
                    "credentials.json", SCOPES
                )
                self.creds = self.flow.run_local_server(port=0)
            # Save the credentials for the next run
            with open("token.json", "w") as token:
                token.write(self.creds.to_json())

        try:
            # Call the Gmail API
            self.service = build("gmail", "v1", credentials=self.creds)

        except HttpError as error:
            print(f"Error in loading Gmail API service: {error}")

    def login(self):
        self.flow = InstalledAppFlow()
        """

        
        """

    def get_emails(self, count = 100) -> tuple[list[EmailData], list[str]]:
        current_user = self.service.users().messages().list(userId="me", maxResults=count).execute()
        messages = current_user.get("messages", [])

        data = []
        for message in messages:
            payload = self.service.users().messages().get(userId="me", id=message["id"], format="full").execute()["payload"]
            headers = payload["headers"]
            body = payload["body"]
            # print(headers)
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
                        attachment_ref = self.service.users().messages().attachments().get(userId="me", messageId=data[-1].message_id, id=attachment_id).execute()
                        decode_and_save_attachments(attachment_ref, Path("./backend/data/images/") / part["filename"])

                    body = part["body"]
                    data[-1].attachments.append(
                        AttachmentData(
                            body=decode_body(body),
                            content_type=header_value(headers, "Content-Type"),
                        )
                    )

        all_image_urls = []
        for email in data:
            all_image_urls.append([])
            if "text/html" in email.content_type:
                email.body, image_urls = process_html(email.body)
                all_image_urls[-1].append(image_urls)
                # print("========", image_urls)
            for attachment in email.attachments:
                if "text/html" in attachment.content_type:
                    attachment.body, image_urls = process_html(attachment.body)
                    all_image_urls[-1].append(image_urls)
                    # print("<<<<<<<", image_urls)

        print(all_image_urls)
        return data, all_image_urls


if __name__ == "__main__":
    gmail = GmailAPI()
    emails, image_urls = gmail.get_emails(count=3)
    for mail, image_urls in zip(emails, image_urls):
        print(image_urls)
        print()

