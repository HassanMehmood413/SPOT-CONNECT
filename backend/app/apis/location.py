import requests

def fetch(user_location):
    # Define your API URL and access key
    API_URL = 'https://serperapi.com/networkconnectivityissues'
    params = {
        'location': user_location,
        'accessKey': ''  # Replace with your actual API key
    }
    
    response = requests.get(API_URL, params=params)
    if response.status_code == 200:
        return response.json().get('output', [])
    else:
        return []  