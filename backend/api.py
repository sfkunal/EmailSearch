import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
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


@dataclass
class EmailData:
    to: str
    subject: str
    body: str
    attachments: list[AttachmentData]



def header_value(header: dict, header_name: str):
    try:
        ind = [e["name"] for e in header].index(header_name)
    except ValueError:
        return None
    else:
        return header[ind]["value"]
    

def decode_body(body: dict):
    if body.get("data", None) is not None:
        # print(body["size"], body["data"])
        value = base64.urlsafe_b64decode(body["data"]).decode("utf-8")
        value = re.sub(r"[\r\n]", " ", value)
        return value


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

    def get_emails(self, count = 100) -> list[EmailData]:
        current_user = self.service.users().messages().list(userId="me", maxResults=count).execute()
        messages = current_user.get("messages", [])

        data = []
        for message in messages:
            payload = gmail.service.users().messages().get(userId="me", id=message["id"], format="full").execute()["payload"]
            headers = payload["headers"]
            body = payload["body"]
            data.append(
                EmailData(
                    to=header_value(headers, "Delivered-To"),
                    subject=header_value(headers, "Subject"),
                    body=decode_body(body),
                    attachments=[],
                )
            )

            parts = payload.get("parts", None)
            if parts is not None:
                for part in parts:
                    headers = part["headers"]
                    body = part["body"]
                    data[-1].attachments.append(
                        AttachmentData(
                            body=decode_body(body)
                        )
                    )
        return data


if __name__ == "__main__":
    gmail = GmailAPI()

    for mail in gmail.get_emails(count=10):
        print(mail)
        print()

    # current_user = gmail.service.users().messages().list(userId="me").execute()
    # messages = current_user.get("messages", [])

    # headers_bodies = []
    # for message in messages[2:3]:
    #     resp = gmail.service.users().messages().get(userId="me", id=message["id"], format="full").execute()
    #     # print(resp)
    #     headers = resp["payload"]["headers"]
    #     body = resp["payload"]["body"]

    #     print(header_value(headers, "Delivered-To"), header_value(headers, "Subject"))
    #     print(decode_body(body))
    #     print()

    #     parts = resp["payload"].get("parts", None)
    #     if parts is not None:
    #         for part in parts:
    #             headers = part["headers"]
    #             body = part["body"]
    #             print(header_value(headers, "Content-Type"))
    #             print(decode_body(body))
    #             print()

        # headers_bodies.append((headers, body))

        # parts = resp
        # while (parts := parts["payload"].get("parts", None)) is not None:
        #     headers = parts["payload"]["headers"]
        #     body = parts["payload"]["body"]
        #     headers_bodies.append(parts)

        # print(headers)
        # print(body)
        # print(more_parts)
        # headers_bodies.append((headers, body))
        # if more_parts is not None:
        #     headers_bodies.append(more_parts)

    # for header_body in headers_bodies:
    #     print(header_body)

    # if not labels:
    #     print("No labels found.")
    # else:
    #     print("Labels:")
    #     for label in labels:
    #         print(label["name"])
