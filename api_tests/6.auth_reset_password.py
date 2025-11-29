import time
import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
import utils

# IN REAL SCENARIO: You get this from the email link. 
# For testing, you might need to check your database/logs.
# We will use a dummy token here just to show the structure.
reset_token = "PUT_REAL_TOKEN_HERE_IF_TESTING_MANUALLY" 

payload = {
    "password": "newpassword123"
}

print("--- Resetting Password ---")

utils.send_and_print(
    url=f"{utils.BASE_URL}/auth/reset-password?token={reset_token}",
    method="POST",
    body=payload,
    output_file=f"{os.path.splitext(os.path.basename(__file__))[0]}.json",
)