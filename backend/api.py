import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

import base64


# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]


def header_value(header: dict, header_name: str):
    return header[[e["name"] for e in header].index(header_name)]["value"]
    


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


if __name__ == "__main__":
    gmail = GmailAPI()

    current_user = gmail.service.users().messages().list(userId="me").execute()
    messages = current_user.get("messages", [])

    headers_bodies = []
    for message in messages[1:2]:
        resp = gmail.service.users().messages().get(userId="me", id=message["id"], format="full").execute()
        # print(resp)
        headers = resp["payload"]["headers"]
        body = resp["payload"]["body"]

        print(header_value(headers, "Delivered-To"), header_value(headers, "Subject"), body)
        print()

        parts = resp["payload"].get("parts", None)
        for part in parts:
            headers = part["headers"]
            body = part["body"]
            print(header_value(headers, "Content-Type"))
            if body.get("data", None) is not None:
                print(body["size"], body["data"])
                # charset = header_value(headers, "Content-Type").split("=")[1].strip('"')
                # print(charset)
                # print(body["data"].encode(charset))
                value = base64.b64decode(body["data"] + "====")
                print(value)
            print()

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
