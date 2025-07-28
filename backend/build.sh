#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Start the Gunicorn server
# -w 4 means 4 worker processes
# -b 0.0.0.0:$PORT binds to the correct host and port provided by the environment
# app:app tells Gunicorn to look for the 'app' object inside the 'app.py' file
gunicorn app:app -w 4 -b 0.0.0.0:$PORT
