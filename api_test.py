import requests

# Replace with your actual API key
API_KEY = "AIzaSyBpFtsGrpcSjE3eJ0O0JI_kbEhm963WBfQ"

# Example: Geocode "New York"
address = "New York"
url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={API_KEY}"

response = requests.get(url)
data = response.json()

if response.status_code == 200:
    if data.get("status") == "OK":
        print("✅ API Key is working!")
        print("Formatted Address:", data["results"][0]["formatted_address"])
        print("Location:", data["results"][0]["geometry"]["location"])
    else:
        print("⚠️ API Key Error:", data.get("error_message", data.get("status")))
else:
    print("❌ Request failed with status:", response.status_code)
