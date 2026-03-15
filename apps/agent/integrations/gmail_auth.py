"""
Run once to authorize Gmail access:
  python -m integrations.gmail_auth

Requires credentials.json from Google Cloud Console
(OAuth 2.0 client ID → Desktop app → download JSON).
"""
import os
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
]
TOKEN_PATH = os.getenv("GMAIL_TOKEN_PATH", "gmail_token.json")

flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
creds = flow.run_local_server(port=0)

with open(TOKEN_PATH, "w") as f:
    f.write(creds.to_json())

print(f"Gmail token saved to {TOKEN_PATH}")
