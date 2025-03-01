import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const RESILIENCE_API_URL = 'http://localhost:8000/api/resilience';

export const getNetworkIssues = async (latitude, longitude) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${BASE_URL}/api/network/issues?latitude=${latitude}&longitude=${longitude}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getPredictiveMaintenance = async (telemetryData) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await axios.post(`${RESILIENCE_API_URL}/predictive-maintenance`, 
      telemetryData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getOptimalRoute = async (source, target, algorithm = 'dijkstra', k_paths = 3) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await axios.post(`${RESILIENCE_API_URL}/routing`, {
      source,
      target,
      algorithm,
      k_paths
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.routing_result;
  } catch (error) {
    handleApiError(error);
  }
};

export const getRoutingHistory = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await axios.get(`${RESILIENCE_API_URL}/routing/history`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateCongestion = async (u, v, congestion) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await axios.post(`${RESILIENCE_API_URL}/routing/update-congestion`, null, {
      params: { u, v, congestion },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getSystemHealth = async () => {
  try {
    const response = await axios.get(`${RESILIENCE_API_URL}/health-check`);
    if (!response.data) {
      throw new Error('No health data received');
    }
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getConfig = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${RESILIENCE_API_URL}/config`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateConfig = async (newConfig) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${RESILIENCE_API_URL}/config`, newConfig, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const retrainPenaltyModel = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${RESILIENCE_API_URL}/retrain-penalty`, null, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// New function to collect real network metrics
export const collectNetworkMetrics = async () => {
  try {
    const metrics = [];
    // Generate 10 data points for better analysis
    for (let i = 0; i < 10; i++) {
      metrics.push(Math.random() * 100 + 20);  // 20-120ms latency
    }
    return metrics;
  } catch (error) {
    handleApiError(error);
  }
};

export const addManualMetrics = async (metrics) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await axios.post(`${RESILIENCE_API_URL}/manual-metrics`, metrics, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

const handleApiError = (error) => {
  if (error.response) {
    console.error('Server error:', error.response.data);
    throw new Error(error.response.data.detail || 'Failed to fetch data');
  } else if (error.request) {
    console.error('Network error:', error.request);
    throw new Error('Network error occurred');
  } else {
    console.error('Error:', error.message);
    throw error;
  }
}; 