import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import FeedbackList from '../components/FeedbackList';
import NearbySchools from '../components/NearbySchools';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [nearbySchools, setNearbySchools] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('No token found');
          router.push('/login');
          return;
        }

        console.log('Making request with token:', token); // Debug log

        const response = await fetch('http://localhost:8000/users/dashboard', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        // Log response for debugging
        console.log('Response status:', response.status);
        
        // Handle different status codes
        if (response.status === 401) {
          console.log('Unauthorized - redirecting to login');
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        // Get response text first for debugging
        const responseText = await response.text();
        console.log('Response body:', responseText);

        // Try to parse JSON only if there's content
        let data;
        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          console.error('JSON parse error:', e);
          throw new Error('Invalid response format');
        }

        if (!response.ok) {
          throw new Error(data.detail || `Server error: ${response.status}`);
        }

        setFeedbacks(data.feedbacks || []);
        setNearbySchools(data.nearby_schools || []);
        setError(null);

      } catch (error) {
        console.error('Dashboard error:', error);
        setError(error.message);
        if (error.message.includes('401')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-red-500 text-lg">
            Error: {error}
            <button 
              onClick={() => router.push('/login')} 
              className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Return to Login
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <FeedbackList feedbacks={feedbacks} />
        <NearbySchools schools={nearbySchools} />
      </div>
    </Layout>
  );
}