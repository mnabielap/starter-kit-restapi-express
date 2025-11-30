import time
import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
import utils

access_token = utils.load_config("access_token")

if not access_token:
    print("Error: No access token found.")
else:
    print("--- Getting All Users ---")

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # Query params example: ?limit=10&page=1
    utils.send_and_print(
        url=f"{utils.BASE_URL}/users?limit=10&page=1",
        method="GET",
        headers=headers,
        output_file=f"{os.path.splitext(os.path.basename(__file__))[0]}.json",
    )