import requests
SOTOON_BASE_URL = "https://api.intelligence.sotoon.ir/inference/v1"
try:
    resp = requests.get(f"{SOTOON_BASE_URL}/models", timeout=5)
    print(f"Status: {resp.status_code}")
    print(f"Body: {resp.text[:200]}")
except Exception as e:
    print(f"Error: {e}")
