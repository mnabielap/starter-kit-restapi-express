import time
import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
import utils

refresh_token = utils.load_config("refresh_token")

if not refresh_token:
    print("Error: No refresh token found.")
else:
    print("--- Logging Out ---")
    
    payload = {
        "refreshToken": refresh_token
    }

    utils.send_and_print(
        url=f"{utils.BASE_URL}/auth/logout",
        method="POST",
        body=payload,
        output_file=f"{os.path.splitext(os.path.basename(__file__))[0]}.json",
    )