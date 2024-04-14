import sys
import json
from spam_classifier import email_spam_classify

# Read the input sent from JavaScript
input_text = sys.stdin.readline().strip()

def is_true():
    # num = 2  # You can modify this value as needed
    if email_spam_classify(input_text):
        return False
    else:
        return True


# Read the input sent from JavaScript
input_text = sys.stdin.readline().strip()

# Generate the output
output = {"input": input_text, "is_true": is_true()}

# Send the output back to JavaScript
sys.stdout.write(json.dumps(output))
sys.stdout.flush()  # Ensure the output is flushed

# Test the email_spam_classify function
# email_text ="England v Macedonia - dont miss the goals/team news. Txt ur national team to 87077 eg ENGLAND to 87077 Try:WALES, SCOTLAND 4txt/̼1.20 POBOXox36504W45WQ 16+"
# print("Is the email spam?", email_spam_classify(email_text))


