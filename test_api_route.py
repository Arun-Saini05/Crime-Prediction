import requests
r = requests.post('http://localhost:8000/api/safest-route', json={'source': 'daman', 'destination': 'delhi'})
print("Status:", r.status_code)
print("Response:", r.json())
