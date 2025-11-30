import time
import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
import utils

refresh_token = utils.load_config("refresh_token")

if not refresh_token:
    print("Error: No refresh token found. Run login or register first.")
else:
    print("--- Refreshing Tokens ---")
    
    payload = {
        "refreshToken": refresh_token
    }

    response = utils.send_and_print(
        url=f"{utils.BASE_URL}/auth/refresh-tokens",
        method="POST",
        body=payload,
        output_file=f"{os.path.splitext(os.path.basename(__file__))[0]}.json",
    )

    if response.status_code == 200:
        data = response.json()
        # Update tokens
        utils.save_config("access_token", data["access"]["token"])
        utils.save_config("refresh_token", data["refresh"]["token"])
        print("\n[SUCCESS] Tokens refreshed and saved.")
    else:
        print("\n[FAILED] Refresh failed.")