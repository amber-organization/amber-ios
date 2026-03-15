"""
Run once to authorize Google Calendar access:
  python -m integrations.gcal_auth

Requires credentials.json from Google Cloud Console
(OAuth 2.0 client ID → Desktop app → download JSON).
"""
import os
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]
TOKEN_PATH = os.getenv("GCAL_TOKEN_PATH", "gcal_token.json")

flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
creds = flow.run_local_server(port=0)

with open(TOKEN_PATH, "w") as f:
    f.write(creds.to_json())

print(f"Google Calendar token saved to {TOKEN_PATH}")
