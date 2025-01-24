import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapPin, FaExclamationTriangle, FaCheckCircle, FaFilter, FaSearch, FaMapMarkedAlt, FaNetworkWired } from 'react-icons/fa';
import { getUserLocation } from '../utils/locationService';
import axios from 'axios';
import { useRouter } from 'next/router';

const VALID_FEEDBACK_TYPES = {
  network_connectivity: "Network Connectivity",
  wifi_issue: "WiFi Issue",
  slow_internet: "Slow Internet",
  no_signal: "No Signal",
  unstable_connection: "Unstable Connection",
  router_issue: "Router Issue",
  ISP_problem: "ISP Problem",
  data_limit_exceeded: "Data Limit Exceeded",
  packet_loss: "Packet Loss",
  high_latency: "High Latency",
  dns_issue: "DNS Issue",
  network_outage: "Network Outage"
};

const NearbyFeedbacks = ({ feedbacks }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyFeedbacks, setNearbyFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0
  });
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return [];
      }

      const response = await axios.get('http://localhost:8000/users/dashboard', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Extract feedbacks from the response
      if (response.data && response.data.feedbacks) {
        console.log('Fetched feedbacks:', response.data.feedbacks);
        return response.data.feedbacks;
      }

      console.error('Invalid response structure:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      }
      return [];
    }
  };

  const updateStats = (feedbacks) => {
    if (!Array.isArray(feedbacks)) {
      console.error('Invalid feedbacks data for stats:', feedbacks);
      return;
    }
    
    const validFeedbacks = feedbacks.filter(f => f !== null);
    console.log('Calculating stats for feedbacks:', validFeedbacks);

    setStats({
      total: validFeedbacks.length,
      resolved: validFeedbacks.filter(f => f.repair_contacted === true).length,
      pending: validFeedbacks.filter(f => f.repair_contacted === false).length
    });
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get user's location
        const location = await getUserLocation();
        console.log('User location:', location);
        
        if (!location || !location.city) {
          setError('Unable to determine city location');
          return;
        }

        setUserLocation(location);

        // Fetch all feedbacks
        const feedbacks = await fetchFeedbacks();
        
        if (!Array.isArray(feedbacks)) {
          console.error('Invalid feedbacks data:', feedbacks);
          setError('Invalid feedback data received');
          return;
        }

        setNearbyFeedbacks(feedbacks);
        updateStats(feedbacks); // Update stats based on nearby feedbacks

        // Filter feedbacks based on city match
        const nearby = feedbacks.filter(feedback => {
          if (!feedback || !feedback.user_location) return false;
          
          const feedbackCity = feedback.user_location.toLowerCase()
            .replace('city', '')
            .replace('tehsil', '')
            .trim();
          const userCity = location.city.toLowerCase().trim();
          
          console.log(`Comparing cities: "${feedbackCity}" with "${userCity}"`);
          return feedbackCity.includes(userCity) || userCity.includes(feedbackCity);
        });

        console.log('Nearby feedbacks:', nearby);
        setNearbyFeedbacks(nearby);

      } catch (error) {
        console.error('Initialization error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [router]);

  const getFeedbackTypeColor = (type) => {
    const colorMap = {
      network_connectivity: 'blue',
      wifi_issue: 'indigo',
      slow_internet: 'yellow',
      no_signal: 'red',
      unstable_connection: 'orange',
      router_issue: 'purple',
      ISP_problem: 'pink',
      data_limit_exceeded: 'gray',
      packet_loss: 'green',
      high_latency: 'cyan',
      dns_issue: 'teal',
      network_outage: 'rose'
    };
    return colorMap[type] || 'gray';
  };

  const filterNearbyFeedbacks = (feedbacks, userLoc) => {
    if (!userLoc || !userLoc.latitude || !userLoc.longitude) return [];

    const userLat = parseFloat(userLoc.latitude);
    const userLng = parseFloat(userLoc.longitude);

    return feedbacks.filter(feedback => {
      // Check if feedback exists and has required properties
      if (!feedback || !feedback.user_location) return false;

      // Check if feedback has coordinates
      if (feedback.latitude && feedback.longitude) {
        const feedbackLat = parseFloat(feedback.latitude);
        const feedbackLng = parseFloat(feedback.longitude);
        const distance = calculateDistance(userLat, userLng, feedbackLat, feedbackLng);
        return distance <= 10; // Within 10km radius
      }

      // Fallback to location name matching with null checks
      const feedbackLocation = feedback.user_location.toLowerCase();
      const userCity = userLoc.city ? userLoc.city.toLowerCase() : '';
      const userRegion = userLoc.region ? userLoc.region.toLowerCase() : '';

      return (
        (userCity && feedbackLocation.includes(userCity)) ||
        (userRegion && feedbackLocation.includes(userRegion))
      );
    });
  };

  const filteredFeedbacks = nearbyFeedbacks
    .filter(feedback => {
      if (filter === 'resolved') return feedback.repair_contacted;
      if (filter === 'pending') return !feedback.repair_contacted;
      if (Object.keys(VALID_FEEDBACK_TYPES).includes(filter)) {
        return feedback.feedback_type === filter;
      }
      return true;
    })
    .filter(feedback => {
      if (!feedback) return false;
      
      const description = feedback.issue_description || '';
      const location = feedback.user_location || '';
      const type = feedback.feedback_type || '';
      const searchTermLower = searchTerm.toLowerCase();

      return (
        description.toLowerCase().includes(searchTermLower) ||
        location.toLowerCase().includes(searchTermLower) ||
        (VALID_FEEDBACK_TYPES[type] || '').toLowerCase().includes(searchTermLower)
      );
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <FaMapMarkedAlt className="mx-auto text-yellow-500 text-4xl mb-4" />
        <p className="font-bold text-yellow-800 text-lg mb-2">Location Unavailable</p>
        <p className="text-yellow-700">Unable to determine your location. Please check your browser settings.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <FaExclamationTriangle className="mx-auto text-red-500 text-4xl mb-4" />
        <p className="font-bold text-red-800 text-lg mb-2">Error Loading Data</p>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Location Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Network Issues Near You</h2>
            <p className="flex items-center text-blue-100">
              <FaMapPin className="mr-2" />
              {userLocation.city}, {userLocation.region}
            </p>
          </div>
          <FaNetworkWired className="text-5xl text-blue-200 opacity-50" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Issues</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <FaNetworkWired className="text-2xl text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-800">{stats.resolved}</p>
            </div>
            <FaCheckCircle className="text-2xl text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
            </div>
            <FaExclamationTriangle className="text-2xl text-yellow-500" />
          </div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <FaFilter className="text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Issues</option>
            <option value="resolved">Resolved</option>
            <option value="pending">Pending</option>
            {Object.entries(VALID_FEEDBACK_TYPES).map(([value, label]) => (
              <option key={value} value={value}>
                {label} Issues
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Issues Grid */}
      <AnimatePresence>
        {filteredFeedbacks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12 bg-gray-50 rounded-lg"
          >
            <FaMapPin className="mx-auto text-gray-400 text-4xl mb-4" />
            <p className="text-gray-600 text-lg">No issues found in your area</p>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFeedbacks.map((feedback, index) => (
              <motion.div
                key={`${feedback.user_id}-${feedback.feedback_type}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl text-gray-800">{feedback.issue_description}</h3>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        feedback.repair_contacted 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {feedback.repair_contacted ? 'Resolved' : 'Pending'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm bg-${getFeedbackTypeColor(feedback.feedback_type)}-100 text-${getFeedbackTypeColor(feedback.feedback_type)}-800`}>
                        {VALID_FEEDBACK_TYPES[feedback.feedback_type]}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      <span className="font-semibold">Type:</span>{' '}
                      {VALID_FEEDBACK_TYPES[feedback.feedback_type] || feedback.feedback_type}
                    </p>
                    <p className="text-gray-600 flex items-center">
                      <FaMapPin className="mr-2 text-red-500" />
                      {feedback.user_location}
                    </p>
                    {feedback.issue_details && (
                      <p className="text-gray-600 border-t pt-3">{feedback.issue_details}</p>
                    )}
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {new Date().toLocaleDateString()}
                    </span>
                    {feedback.repair_contacted ? (
                      <span className="flex items-center text-green-600">
                        <FaCheckCircle className="mr-1" />
                        Repair Team Notified
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-600">
                        <FaExclamationTriangle className="mr-1" />
                        Awaiting Response
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {feedback.latitude && feedback.longitude && userLocation && (
                      <p>
                        Distance: {calculateDistance(
                          parseFloat(userLocation.latitude),
                          parseFloat(userLocation.longitude),
                          parseFloat(feedback.latitude),
                          parseFloat(feedback.longitude)
                        ).toFixed(1)} km away
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NearbyFeedbacks;