import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FaUser, FaMapMarkerAlt, FaPhone, FaHome, FaPencilAlt, FaSave } from 'react-icons/fa';

const Profile = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    username: '',
    location: '',
    contact_number: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8000/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-red-100 rounded-lg shadow-md">
      <p className="text-red-700 font-semibold">{error}</p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto mt-8 bg-white p-8 rounded-lg shadow-lg"
    >
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">User Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            <FaUser className="inline mr-2" />
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={userData.username}
            onChange={handleChange}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded-md ${isEditing ? 'border-blue-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            <FaMapMarkerAlt className="inline mr-2" />
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={userData.location}
            onChange={handleChange}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded-md ${isEditing ? 'border-blue-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
          <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 mb-1">
            <FaPhone className="inline mr-2" />
            Contact Number
          </label>
          <input
            id="contact_number"
            name="contact_number"
            type="text"
            value={userData.contact_number}
            onChange={handleChange}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded-md ${isEditing ? 'border-blue-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            <FaHome className="inline mr-2" />
            Address
          </label>
          <textarea
            id="address"
            name="address"
            rows="3"
            value={userData.address}
            onChange={handleChange}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded-md ${isEditing ? 'border-blue-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleEditToggle}
            className={`flex items-center px-4 py-2 rounded-md ${isEditing ? 'bg-gray-200 text-gray-700' : 'bg-blue-500 text-white'} hover:bg-opacity-80 transition-colors`}
          >
            {isEditing ? (
              <>
                <FaPencilAlt className="mr-2" /> Cancel
              </>
            ) : (
              <>
                <FaPencilAlt className="mr-2" /> Edit
              </>
            )}
          </button>
          {isEditing && (
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <FaSave className="mr-2" /> Save Changes
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default Profile;