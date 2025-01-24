import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaThumbsUp, FaComment, FaMapMarkerAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FeedbackList = ({ feedbacks = [] }) => {
  const [visibleCount, setVisibleCount] = useState(6);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Recent Feedbacks</h2>
        <p className="text-gray-500 text-center">No feedbacks available</p>
      </div>
    );
  }

  const visibleFeedbacks = isExpanded ? feedbacks : feedbacks.slice(0, visibleCount);
  const hasMore = feedbacks.length > visibleCount;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Recent Feedbacks</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {visibleFeedbacks.map((feedback, index) => (
            <motion.div
              key={`${feedback.user_id}-${feedback.feedback_type}-${index}`}
              className="bg-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <FaMapMarkerAlt className="text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">{feedback.user_location}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{feedback.feedback_type}</h3>
                <p className="text-gray-600 text-sm mb-4">{feedback.issue_description}</p>
                {feedback.issue_details && (
                  <p className="text-gray-500 text-sm mb-4 italic">
                    {feedback.issue_details}
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {feedback.reported_date ? new Date(feedback.reported_date).toLocaleDateString() : 'Date not available'}
                  </span>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      feedback.repair_contacted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {feedback.repair_contacted ? 'Resolved' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show More/Less Button */}
      {hasMore && (
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button
            onClick={toggleExpand}
            className="inline-flex items-center px-6 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            {isExpanded ? (
              <>
                Show Less <FaChevronUp className="ml-2" />
              </>
            ) : (
              <>
                Show More ({feedbacks.length - visibleCount} more) <FaChevronDown className="ml-2" />
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Feedback Count */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Showing {visibleFeedbacks.length} of {feedbacks.length} feedbacks
      </div>
    </div>
  );
};

export default FeedbackList;