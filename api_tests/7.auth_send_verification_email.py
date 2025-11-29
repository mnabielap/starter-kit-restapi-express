import time
import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
import utils

access_token = utils.load_config("access_token")

if not access_token:
    print("Error: No access token found. Run login first.")
else:
    print("--- Sending Verification Email ---")
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    utils.send_and_print(
        url=f"{utils.BASE_URL}/auth/send-verification-email",
        method="POST",
        headers=headers,
        output_file=f"{os.path.splitext(os.path.basename(__file__))[0]}.json",
    )