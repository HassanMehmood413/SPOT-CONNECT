import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaWifi, FaExclamationTriangle, FaMapMarkerAlt, FaNewspaper, FaServer, FaGlobe, FaBolt } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const NetworkStatus = () => {
  const [networkIssues, setNetworkIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [networkStats, setNetworkStats] = useState({
    totalIssues: 0,
    activeOutages: 0,
    resolvedToday: 0
  });

  // Get user's location
  const getUserLocation = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Get location name using reverse geocoding
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            
            resolve({
              latitude,
              longitude,
              city: response.data.address.city || response.data.address.town || response.data.address.village,
              region: response.data.address.state,
              country: response.data.address.country
            });
          } catch (error) {
            reject(error);
          }
        },
        (error) => reject(error)
      );
    });
  };

  // Fetch network status data
  const fetchNetworkStatus = async (location) => {
    try {
      // Use Serper API with proper endpoint and API key
      const response = await axios.post('https://google.serper.dev/search', {
        q: `internet outage network problems ${location.city} ${location.region} today`,
        num: 10
      }, {
        headers: {
          'X-API-KEY': '',
          'Content-Type': 'application/json'
        }
      });

      console.log('Serper API response:', response.data); // Debug log

      // Process and filter relevant results
      const relevantResults = response.data.organic
        .filter(result => {
          const isRelevant = result.title.toLowerCase().includes('network') ||
                           result.title.toLowerCase().includes('internet') ||
                           result.title.toLowerCase().includes('outage') ||
                           result.snippet.toLowerCase().includes('network') ||
                           result.snippet.toLowerCase().includes('internet') ||
                           result.snippet.toLowerCase().includes('outage');
          return isRelevant;
        })
        .map(result => ({
          title: result.title,
          description: result.snippet,
          link: result.link,
          date: result.date || 'Recent',
          severity: determineSeverity(result.snippet)
        }));

      // Add fallback if no results found
      if (relevantResults.length === 0) {
        relevantResults.push({
          title: `Network Status for ${location.city}`,
          description: `No major network issues reported in ${location.city} area currently.`,
          date: new Date().toLocaleDateString(),
          severity: 'low',
          link: '#'
        });
      }

      // Update network stats
      setNetworkStats({
        totalIssues: relevantResults.length,
        activeOutages: relevantResults.filter(r => r.severity === 'high').length,
        resolvedToday: relevantResults.filter(r => r.date?.includes('today') && r.snippet?.toLowerCase().includes('resolved')).length
      });

      return relevantResults;
    } catch (error) {
      console.error('Serper API Error:', error.response?.data || error.message);
      // Fallback to basic status if Serper API fails
      return [{
        title: `Network Status Update for ${location.city}`,
        description: `Unable to fetch detailed network status. Please check with your local ISP for any reported issues.`,
        date: new Date().toLocaleDateString(),
        severity: 'medium',
        link: '#'
      }];
    }
  };

  // Determine issue severity based on content
  const determineSeverity = (content) => {
    const lowercaseContent = content.toLowerCase();
    if (lowercaseContent.includes('outage') || lowercaseContent.includes('major')) {
      return 'high';
    }
    if (lowercaseContent.includes('intermittent') || lowercaseContent.includes('slow')) {
      return 'medium';
    }
    return 'low';
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        const location = await getUserLocation();
        setUserLocation(location);
        setLocationName(`${location.city}, ${location.region}`);
        
        const issues = await fetchNetworkStatus(location);
        setNetworkIssues(issues);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        toast.error('Failed to load network status');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <FaExclamationTriangle className="text-red-500 text-xl" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaWifi className="text-white text-2xl" />
            <h2 className="text-white text-xl font-semibold">Network Status</h2>
          </div>
          <div className="flex items-center space-x-2 text-blue-100">
            <FaMapMarkerAlt />
            <span>{locationName || 'Unknown Location'}</span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-2">
            <FaGlobe className="text-blue-500" />
            <span className="text-gray-600">Total Issues</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-2">{networkStats.totalIssues}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-2">
            <FaBolt className="text-yellow-500" />
            <span className="text-gray-600">Active Outages</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-2">{networkStats.activeOutages}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-2">
            <FaServer className="text-green-500" />
            <span className="text-gray-600">Resolved Today</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-2">{networkStats.resolvedToday}</p>
        </div>
      </div>

      {/* Issues List */}
      <div className="p-6">
        {networkIssues.length === 0 ? (
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4"
            >
              <FaWifi className="text-green-500 text-2xl" />
            </motion.div>
            <p className="text-gray-600">No reported network issues in your area</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <FaNewspaper />
              <span>Recent Network Issues in Your Area</span>
            </div>
            
            <div className="space-y-4">
              {networkIssues.map((issue, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                    issue.severity === 'high' 
                      ? 'border-red-200 bg-red-50' 
                      : issue.severity === 'medium'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <h3 className="font-semibold text-gray-800 mb-2">{issue.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{issue.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{issue.date}</span>
                    <a
                      href={issue.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Read More
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NetworkStatus; 