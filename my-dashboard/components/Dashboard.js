import { useState, useEffect } from 'react';
import Layout from './Layout';
import FeedbackList from './FeedbackList';
import NetworkStatus from './NetworkStatus';
import { useRouter } from 'next/router';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaChartLine, FaMapMarkedAlt, FaNetworkWired, FaBell, FaSearchLocation } from 'react-icons/fa';

const Dashboard = () => {
  const router = useRouter();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalIssues: 0,
    resolvedIssues: 0,
    nearbyIssues: 0,
    avgResponseTime: '0'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Get user location and fetch data
    const initializeDashboard = async () => {
      try {
        // Get location
        if ('geolocation' in navigator) {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        }

        // Fetch dashboard data
        const response = await axios.get('http://localhost:8000/users/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data) {
          setFeedbacks(response.data.feedbacks || []);
          setStats({
            totalIssues: response.data.feedbacks?.length || 0,
            resolvedIssues: response.data.feedbacks?.filter(f => f.resolved)?.length || 0,
            nearbyIssues: response.data.nearby_count || 0,
            avgResponseTime: response.data.avg_response_time || '24h'
          });
        }
      } catch (err) {
        console.error('Dashboard initialization error:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
        } else {
          setError('Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [router]);

  const handleViewNearbyIssues = () => {
    router.push('/nearby-issues');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section with Nearby Issues Button */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-gray-900"
              >
                Network Status Dashboard
              </motion.h1>
              <p className="mt-2 text-gray-600">Monitor network issues and feedback in real-time</p>
            </div>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewNearbyIssues}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaSearchLocation className="mr-2 h-5 w-5" />
              View Nearby Issues
            </motion.button>
          </div>

          {/* Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          >
            {[
              { title: 'Total Issues', value: stats.totalIssues, icon: FaChartLine, color: 'blue' },
              { title: 'Resolved', value: stats.resolvedIssues, icon: FaNetworkWired, color: 'green' },
              { title: 'Nearby Issues', value: stats.nearbyIssues, icon: FaMapMarkedAlt, color: 'yellow' },
              { title: 'Avg Response Time', value: stats.avgResponseTime, icon: FaBell, color: 'purple' }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 bg-${stat.color}-100`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.title}
                        </dt>
                        <dd className="text-lg font-semibold text-gray-900">
                          {stat.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {error && (
            <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Network Status Section */}
          {location && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <NetworkStatus 
                latitude={location.latitude} 
                longitude={location.longitude} 
              />
            </motion.div>
          )}

          {/* Feedback List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full"
          >
            <FeedbackList feedbacks={feedbacks} />
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard; 