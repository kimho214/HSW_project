#!/usr/bin/env bash
# exit on error
set -o errexit

echo "--- Starting build script ---"

echo "--- Upgrading pip ---"
pip install --upgrade pip

echo "--- Installing packages from requirements.txt ---"
pip install --no-cache-dir -r requirements.txt

echo "--- Initializing database ---"
python init_db.py

echo "--- Build script finished successfully ---"
