import time
import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
import utils

# Replace with token from logs/email
verify_token = "PUT_REAL_TOKEN_HERE_IF_TESTING_MANUALLY"

print("--- Verifying Email ---")

utils.send_and_print(
    url=f"{utils.BASE_URL}/auth/verify-email?token={verify_token}",
    method="POST",
    output_file=f"{os.path.splitext(os.path.basename(__file__))[0]}.json",
)