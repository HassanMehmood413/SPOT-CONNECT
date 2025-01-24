import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaMapPin, FaExclamationCircle, FaWifi, FaTools, FaLocationArrow, FaClock } from 'react-icons/fa';

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

const RESOLUTION_DAYS = {
  '1-2': '1-2 days',
  '3-5': '3-5 days',
  '5-7': '5-7 days',
  '7+': 'More than a week'
};

const FeedbackForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [formData, setFormData] = useState({
    feedback_type: '',
    issue_description: '',
    issue_details: '',
    user_location: '',
    latitude: '',
    longitude: '',
    repair_contacted: false,
    resolution_timeframe: '',
    priority_level: 'medium'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:8000/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          toast.error('Failed to fetch user data');
        }
      } catch (error) {
        toast.error('Error connecting to server');
      }
    };

    fetchUserData();
  }, [router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      if ('geolocation' in navigator) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;

        // Get location name using reverse geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await response.json();

        const locationName = [
          data.address.city || data.address.town || data.address.village,
          data.address.state,
          data.address.country
        ].filter(Boolean).join(', ');

        setFormData(prev => ({
          ...prev,
          user_location: locationName,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));

        toast.success('Location detected successfully');
      } else {
        toast.error('Geolocation is not supported by your browser');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error('Failed to detect location');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Validate required fields
      if (!formData.feedback_type || !formData.issue_description || !formData.user_location || !formData.resolution_timeframe) {
        toast.error('Please fill in all required fields');
        return;
      }

      const response = await fetch('http://localhost:8000/users/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          user_id: userData?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Feedback submitted successfully!');
        router.push('/');
      } else {
        toast.error(data.detail || 'Failed to submit feedback');
      }
    } catch (error) {
      toast.error('Error submitting feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex items-center space-x-3">
          <FaWifi className="text-3xl" />
          <h2 className="text-2xl font-bold">Report Network Issue</h2>
        </div>
        <p className="mt-2 text-blue-100">Help us improve our network by reporting any issues you encounter.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Issue Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issue Type <span className="text-red-500">*</span>
          </label>
          <select
            name="feedback_type"
            value={formData.feedback_type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Issue Type</option>
            {Object.entries(VALID_FEEDBACK_TYPES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Issue Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brief Description <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="issue_description"
            value={formData.issue_description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Frequent connection drops"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <FaMapPin className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="user_location"
                value={formData.user_location}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your location"
                required
              />
            </div>
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
            >
              {locationLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              ) : (
                <FaLocationArrow />
              )}
              <span className="hidden sm:inline">Detect Location</span>
            </button>
          </div>
          {formData.latitude && formData.longitude && (
            <p className="mt-1 text-sm text-gray-500">
              Coordinates: {formData.latitude}, {formData.longitude}
            </p>
          )}
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Detailed Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="issue_details"
            value={formData.issue_details}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Please provide more details about the issue..."
            required
          />
        </div>

        {/* Repair Contact Checkbox */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="repair_contacted"
            checked={formData.repair_contacted}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="text-sm text-gray-700">
            I have already contacted the repair team
          </label>
        </div>

        {/* Resolution Timeframe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Resolution Time <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FaClock className="absolute left-3 top-3 text-gray-400" />
            <select
              name="resolution_timeframe"
              value={formData.resolution_timeframe}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Resolution Timeframe</option>
              {Object.entries(RESOLUTION_DAYS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['low', 'medium', 'high'].map((priority) => (
              <button
                key={priority}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, priority_level: priority }))}
                className={`py-2 px-4 rounded-lg border ${
                  formData.priority_level === priority
                    ? 'bg-blue-500 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } transition-colors`}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <FaTools className="text-lg" />
              <span>Submit Feedback</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default FeedbackForm;