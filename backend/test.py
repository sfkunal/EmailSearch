#         {
#   "web": {
#     "client_id": "589016143575-foklhddfvnir6np5pk508dg413gpiuqe.apps.googleusercontent.com",
#     "project_id": "thr1ve-beta",
#     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
#     "token_uri": "https://oauth2.googleapis.com/token",
#     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
#     "client_secret": "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",
#     "redirect_uris": ["http://localhost:3000"],
#     "javascript_origins": ["http://localhost:3000"]
#   }
# }

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request



# creds = Credentials(
#     token="eyJhbGciOiJSUzI1NiIsImtpZCI6IjczZTI1Zjk3ODkxMTljNz…A1XBtlJOnVOrPTBV7xl507zwIsZLYGxZZ3keWB-mEbSX-sxYA",
#     token_uri="https://oauth2.googleapis.com/token",
#     client_id="589016143575-foklhddfvnir6np5pk508dg413gpiuqe.apps.googleusercontent.com",
#     client_secret="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",
# )

creds = Credentials(
    # token=None,
    # refresh_token=None,
    token="ya29.a0AcM612yFQgRqXaWkigD7oI6NoKZXJapd4IwMIsrk0mYEmZt9gNRWfZxFw-fSqc4pFMXMS8DjXnvu3GbGC7ygFgubRsmGzB2DCGHvJk3FN2HL4N2vTcQpRIE4F60eWaetPlblsVKXnkw_LKhW7T9TBPxeSJBa4EePtRL6Q9jbaCgYKAa8SARESFQHGX2MiD9Z_m_PPrqum4p-4uR0dbA0175",
    refresh_token="1//06ZgadUc2Mq6jCgYIARAAGAYSNwF-L9IrUUNmwiz-rRXeKqiQemT6o7hBXt4hfKE26PzwGwZpaobsG5ZeQwO6rEr3_N0A7ARlOvM",
    token_uri="https://oauth2.googleapis.com/token",
    client_id="535223428554-dkeo6og0di4sjgpoc9v69pfqeh10mhgk.apps.googleusercontent.com",
    client_secret="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",
    # client_id=None,
)
if creds.expired:
    creds.refresh(Request())


from googleapiclient.discovery import build

service = build("gmail", "v1", credentials=creds)
# current_user = service.users().labels().get(id="me")
results = service.users(

).labels(

).list(
    userId="me"
    ).execute(

    )

print(results)
