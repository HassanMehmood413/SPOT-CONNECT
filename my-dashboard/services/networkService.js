import axios from 'axios';

const API_URL = 'http://localhost:8000/api/network';

export const getNetworkIssues = async (latitude, longitude) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await axios.get(`${API_URL}/issues`, {
      params: { 
        latitude: latitude.toFixed(6), 
        longitude: longitude.toFixed(6) 
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with an error
      console.error('Server error:', error.response.data);
      throw new Error(error.response.data.detail || 'Failed to fetch network issues');
    } else if (error.request) {
      // Request was made but no response
      console.error('Network error:', error.request);
      throw new Error('Network error occurred');
    } else {
      // Something else happened
      console.error('Error:', error.message);
      throw error;
    }
  }
}; 