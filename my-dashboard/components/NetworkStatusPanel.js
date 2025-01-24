import { motion } from 'framer-motion';
import { FaWifi, FaExclamationTriangle, FaCheckCircle, FaHistory } from 'react-icons/fa';

const NetworkStatusPanel = ({ networkStatus }) => {
  const { isOnline, connectionType, networkIssues, lastChecked } = networkStatus;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <FaWifi className="mr-2" />
        Network Status
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Connection Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            {isOnline ? (
              <FaCheckCircle className="text-green-500 mr-2" />
            ) : (
              <FaExclamationTriangle className="text-red-500 mr-2" />
            )}
            <h3 className="font-semibold">Connection Status</h3>
          </div>
          <p className={`text-lg ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </p>
          {connectionType && (
            <p className="text-gray-600 text-sm mt-1">
              Connection Type: {connectionType}
            </p>
          )}
        </div>

        {/* Network Issues */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <FaExclamationTriangle className="text-yellow-500 mr-2" />
            <h3 className="font-semibold">Recent Issues</h3>
          </div>
          <div className="max-h-40 overflow-y-auto">
            {networkIssues.length > 0 ? (
              <ul className="space-y-2">
                {networkIssues.map((issue, index) => (
                  <li key={index} className="text-sm">
                    <span className="font-medium">{issue.title}</span>
                    <p className="text-gray-600">{issue.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No recent issues reported</p>
            )}
          </div>
        </div>

        {/* Last Updated */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <FaHistory className="text-blue-500 mr-2" />
            <h3 className="font-semibold">Last Updated</h3>
          </div>
          <p className="text-gray-600">
            {new Date(lastChecked).toLocaleString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default NetworkStatusPanel; 