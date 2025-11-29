import time
import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
import utils

access_token = utils.load_config("access_token")

if not access_token:
    print("Error: No access token found.")
else:
    print("--- Creating New User (by Admin) ---")

    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    payload = {
        "name": "Target User",
        "email": "target@example.com",
        "password": "password123",
        "role": "user"
    }

    response = utils.send_and_print(
        url=f"{utils.BASE_URL}/users",
        method="POST",
        headers=headers,
        body=payload,
        output_file=f"{os.path.splitext(os.path.basename(__file__))[0]}.json",
    )

    if response.status_code == 201:
        data = response.json()
        # Save this new user's ID to manipulate it in other scripts
        utils.save_config("target_user_id", data["id"])
        print(f"\n[SUCCESS] Created User ID: {data['id']}")
    else:
        print("\n[FAILED] Could not create user.")