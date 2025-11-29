import time
import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
import utils

access_token = utils.load_config("access_token")
target_id = utils.load_config("target_user_id")

if not access_token or not target_id:
    print("Error: Missing token or target_user_id.")
else:
    print(f"--- Deleting User ID: {target_id} ---")

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    utils.send_and_print(
        url=f"{utils.BASE_URL}/users/{target_id}",
        method="DELETE",
        headers=headers,
        output_file=f"{os.path.splitext(os.path.basename(__file__))[0]}.json",
    )