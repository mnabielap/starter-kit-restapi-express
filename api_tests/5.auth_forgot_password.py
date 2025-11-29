import time
import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
import utils

payload = {
    "email": "admin@example.com"
}

print(f"--- Requesting Password Reset for {payload['email']} ---")

utils.send_and_print(
    url=f"{utils.BASE_URL}/auth/forgot-password",
    method="POST",
    body=payload,
    output_file=f"{os.path.splitext(os.path.basename(__file__))[0]}.json",
)