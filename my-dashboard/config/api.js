export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  endpoints: {
    login: '/users/login',
    register: '/users',
    profile: '/users/profile',
    feedback: '/users/feedback',
    networkIssues: '/api/network/issues',
    predictiveMaintenance: '/api/resilience/predictive-maintenance',
  }
};

export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.baseUrl}${endpoint}`;
}; 