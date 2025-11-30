import time
import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
import utils

# Data for the new user
payload = {
    "name": "User Example",
    "email": "user.example@example.com",
    "password": "password123",
}

print(f"--- Registering User: {payload['email']} ---")

response = utils.send_and_print(
    url=f"{utils.BASE_URL}/auth/register",
    method="POST",
    body=payload,
    output_file=f"{os.path.splitext(os.path.basename(__file__))[0]}.json",
)

if response.status_code == 201:
    data = response.json()
    # Save tokens and user info for subsequent scripts
    utils.save_config("access_token", data["tokens"]["access"]["token"])
    utils.save_config("refresh_token", data["tokens"]["refresh"]["token"])
    utils.save_config("my_user_id", data["user"]["id"])
    print("\n[SUCCESS] User registered and tokens saved to secrets.json")
else:
    print("\n[FAILED] Registration failed.")