#!/bin/bash

echo "Thank you for installing the application.."

echo "Setting up the virtual environment"

python3 -m venv venv
source ./venv/bin/activate

echo "Virtual env setup is done.."

echo "Installing the requirements from the requirements file"
pip install -r requirements.txt

echo "Running the application.."
uvicorn main:app --reload
