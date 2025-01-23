import requests

def fetch_nearby_schools(user_location):
    # Define your API URL and access key
    API_URL = 'https://serperapi.com/schools'
    params = {
        'location': user_location,
        'accessKey': '8e754310-f0b7-4d91-8115-cba1206a9c85'  # Replace with your actual API key
    }
    
    response = requests.get(API_URL, params=params)
    if response.status_code == 200:
        return response.json().get('schools', [])
    else:
        return []  