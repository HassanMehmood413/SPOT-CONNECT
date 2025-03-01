import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaServer, FaChartLine, FaCog, FaRoute, FaSync } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Layout from '../components/Layout';
import {
  getPredictiveMaintenance,
  getOptimalRoute,
  getRoutingHistory,
  updateConfig,
  retrainPenaltyModel,
  addManualMetrics,
  getSystemHealth,
  getConfig
} from '../services/networkService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const metricPresets = {
  optimal: {
    label: 'Optimal',
    values: {
      latency: '10',
      bandwidth: '1000',
      packet_loss: '0',
      jitter: '1'
    }
  },
  degraded: {
    label: 'Degraded',
    values: {
      latency: '100',
      bandwidth: '500',
      packet_loss: '2',
      jitter: '5'
    }
  },
  poor: {
    label: 'Poor',
    values: {
      latency: '200',
      bandwidth: '100',
      packet_loss: '5',
      jitter: '10'
    }
  },
  custom: {
    label: 'Custom',
    values: {
      latency: '',
      bandwidth: '',
      packet_loss: '',
      jitter: ''
    }
  }
};

export default function NetworkDashboard() {
  const [telemetryData, setTelemetryData] = useState({
    latency: [],
    bandwidth: [],
    packetLoss: [],
    jitter: [],
    timestamp: []
  });
  const [loading, setLoading] = useState({
    maintenance: false,
    routing: false,
    config: false,
    metrics: false
  });
  const [maintenanceResults, setMaintenanceResults] = useState(null);
  const [anomalyDetection, setAnomalyDetection] = useState([]);
  const [faultPrediction, setFaultPrediction] = useState(0);
  const [networkTopology, setNetworkTopology] = useState(null);
  const [routingResults, setRoutingResults] = useState(null);
  const [routingHistory, setRoutingHistory] = useState([]);
  const [config, setConfig] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [manualMetrics, setManualMetrics] = useState({
    latency: '',
    bandwidth: '',
    packet_loss: '',
    jitter: ''
  });
  const [isManualInputOpen, setIsManualInputOpen] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [activeMonitoring, setActiveMonitoring] = useState(false);
  const [monitoringInterval, setMonitoringInterval] = useState(5);
  const [batchEntries, setBatchEntries] = useState([]);
  const [manualMetricsHistory, setManualMetricsHistory] = useState([]);
  const [csvError, setCsvError] = useState(null);
  const [routingConfig, setRoutingConfig] = useState({
    source: 1,
    target: 2,
    algorithm: 'dijkstra',
    k_paths: 3
  });
  const [selectedPreset, setSelectedPreset] = useState('custom');
  const fileInputRef = useRef(null);
  const monitoringIntervalRef = useRef(null);
  const router = useRouter();

  // Fetch configuration on mount
  const fetchConfig = async () => {
    try {
      setLoading(prev => ({ ...prev, config: true }));
      const configData = await getConfig();
      setConfig(configData);
    } catch (error) {
      toast.error('Failed to load configuration');
    } finally {
      setLoading(prev => ({ ...prev, config: false }));
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const healthData = await getSystemHealth();
      setSystemHealth(healthData);
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      toast.error('Failed to load system health status');
    }
  };

  // Fetch initial data and set up periodic health checks
  useEffect(() => {
    fetchConfig();
    fetchSystemHealth();

    // Set up periodic health check every 30 seconds
    const healthCheckInterval = setInterval(fetchSystemHealth, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(healthCheckInterval);
  }, []);

  // Initialize telemetry data with some default values
  useEffect(() => {
    // Generate some initial data points
    const initialData = {
      latency: [45, 48, 52, 47, 45],
      bandwidth: [100, 98, 95, 99, 100],
      packetLoss: [0.5, 0.6, 0.4, 0.5, 0.5],
      jitter: [2, 2.5, 2.1, 2.3, 2],
      timestamp: []
    };

    // Generate timestamps for the last 5 minutes
    const now = new Date();
    for (let i = 4; i >= 0; i--) {
      const time = new Date(now - i * 60000);
      initialData.timestamp.push(time.toLocaleTimeString());
    }

    setTelemetryData(initialData);

    // Set up periodic updates
    const interval = setInterval(() => {
      setTelemetryData(prev => {
        const newTimestamp = new Date().toLocaleTimeString();
        
        // Generate new random values within reasonable ranges
        const newLatency = Math.max(40, Math.min(60, prev.latency[prev.latency.length - 1] + (Math.random() - 0.5) * 10));
        const newBandwidth = Math.max(90, Math.min(110, prev.bandwidth[prev.bandwidth.length - 1] + (Math.random() - 0.5) * 5));
        const newPacketLoss = Math.max(0, Math.min(1, prev.packetLoss[prev.packetLoss.length - 1] + (Math.random() - 0.5) * 0.2));
        const newJitter = Math.max(1, Math.min(3, prev.jitter[prev.jitter.length - 1] + (Math.random() - 0.5) * 0.5));

        // Keep only the last 30 data points
        return {
          latency: [...prev.latency.slice(-29), newLatency],
          bandwidth: [...prev.bandwidth.slice(-29), newBandwidth],
          packetLoss: [...prev.packetLoss.slice(-29), newPacketLoss],
          jitter: [...prev.jitter.slice(-29), newJitter],
          timestamp: [...prev.timestamp.slice(-29), newTimestamp]
        };
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRetrainModel = async () => {
    try {
      await retrainPenaltyModel();
      toast.success('Penalty model retrained successfully');
    } catch (error) {
      toast.error('Failed to retrain penalty model');
    }
  };

  const handlePredictiveMaintenance = async () => {
    try {
      setLoading(prev => ({ ...prev, maintenance: true }));
      
      // Prepare telemetry data for analysis - combine all metrics into a single array
      const combinedData = [
        ...telemetryData.latency,
        ...telemetryData.bandwidth,
        ...telemetryData.packetLoss.map(val => val * 100), // Convert to percentage
        ...telemetryData.jitter
      ];

      const telemetryForAnalysis = {
        data: combinedData
      };
      
      const results = await getPredictiveMaintenance(telemetryForAnalysis);
      setMaintenanceResults(results);
      
      // Update anomaly detection state
      const anomalies = results.results.filter(r => r.anomaly);
      setAnomalyDetection(anomalies);
      
      // Calculate fault prediction probability
      const avgSimilarity = results.average_similarity;
      setFaultPrediction(1 - avgSimilarity);
      
      toast.success(`Analysis complete. Found ${results.total_anomalies} anomalies.`);
    } catch (error) {
      console.error('Predictive maintenance error:', error);
      toast.error('Failed to perform predictive maintenance analysis');
    } finally {
      setLoading(prev => ({ ...prev, maintenance: false }));
    }
  };

  const handleRoutingConfigChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;
    
    if (['source', 'target', 'k_paths'].includes(name)) {
      parsedValue = parseInt(value) || 1; // Default to 1 if parsing fails
      // Ensure values stay within valid range
      if (name !== 'k_paths') {
        parsedValue = Math.max(1, Math.min(11, parsedValue));
      } else {
        parsedValue = Math.max(1, Math.min(10, parsedValue));
      }
    }

    setRoutingConfig(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const handleOptimalRoute = async () => {
    try {
      setLoading(prev => ({ ...prev, routing: true }));
      
      const { source, target, algorithm, k_paths } = routingConfig;
      
      // Validate inputs
      if (!Number.isInteger(source) || source < 1 || source > 11 ||
          !Number.isInteger(target) || target < 1 || target > 11) {
        throw new Error('Source and target must be integers between 1 and 11');
      }
      
      if (source === target) {
        throw new Error('Source and target nodes must be different');
      }
      
      console.log('Calculating optimal route...', { source, target, algorithm, k_paths });
      const results = await getOptimalRoute(source, target, algorithm, k_paths);
      
      if (!results || !results.paths || !results.costs) {
        throw new Error('Invalid routing results received from server');
      }
      
      console.log('Route calculated successfully:', results);
      setRoutingResults(results);
      setNetworkTopology(results.visualization_data);
      toast.success('Optimal route calculated successfully');

      // Fetch updated routing history
      const history = await getRoutingHistory();
      setRoutingHistory(history.history || []);
    } catch (error) {
      console.error('Routing error:', error);
      toast.error(error.message || 'Failed to calculate optimal route');
    } finally {
      setLoading(prev => ({ ...prev, routing: false }));
    }
  };

  const handleConfigUpdate = async () => {
    try {
      setLoading(prev => ({ ...prev, config: true }));
      const newConfig = {
        SIMILARITY_THRESH: config.SIMILARITY_THRESH
      };
      await updateConfig(newConfig);
      toast.success('Configuration updated successfully');
      await fetchConfig();
    } catch (error) {
      toast.error('Failed to update configuration');
    } finally {
      setLoading(prev => ({ ...prev, config: false }));
    }
  };

  const handleManualMetricsChange = (e) => {
    const { name, value } = e.target;
    
    // Convert to number and validate
    const numValue = parseFloat(value);
    
    // Validate based on metric type
    let isValid = true;
    if (!isNaN(numValue)) {
      switch (name) {
        case 'latency':
          isValid = numValue >= 0 && numValue <= 1000;
          break;
        case 'bandwidth':
          isValid = numValue >= 0 && numValue <= 1000;
          break;
        case 'packet_loss':
          isValid = numValue >= 0 && numValue <= 100;
          break;
        case 'jitter':
          isValid = numValue >= 0 && numValue <= 100;
          break;
      }
    }

    if (value === '' || (isValid && !isNaN(numValue))) {
      setManualMetrics(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset);
    if (preset !== 'custom') {
      setManualMetrics(metricPresets[preset].values);
    }
  };

  const handleAddBatchEntry = () => {
    setBatchEntries([...batchEntries, { ...manualMetrics }]);
    setManualMetrics({
      latency: '',
      bandwidth: '',
      packet_loss: '',
      jitter: ''
    });
  };

  const handleBatchSubmit = async () => {
    setLoading(true);
    try {
      for (const entry of batchEntries) {
        await addManualMetrics(entry);
        setTelemetryData(prevData => ({
          latency: [...prevData.latency, parseFloat(entry.latency)],
          bandwidth: [...prevData.bandwidth, parseFloat(entry.bandwidth)],
          packetLoss: [...prevData.packetLoss, parseFloat(entry.packet_loss)],
          jitter: [...prevData.jitter, parseFloat(entry.jitter)],
          timestamp: [...prevData.timestamp, new Date().toLocaleTimeString()]
        }));
      }
      toast.success('Batch metrics added successfully');
      setBatchEntries([]);
    } catch (error) {
      toast.error('Failed to add batch metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleManualMetricsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Check for authentication
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      await addManualMetrics(manualMetrics);
      toast.success('Manual metrics added successfully');

      // Update telemetry data
      setTelemetryData(prevData => {
        const now = new Date().toLocaleTimeString();
        return {
          latency: [...prevData.latency, parseFloat(manualMetrics.latency)],
          bandwidth: [...prevData.bandwidth, parseFloat(manualMetrics.bandwidth)],
          packetLoss: [...prevData.packetLoss, parseFloat(manualMetrics.packet_loss)],
          jitter: [...prevData.jitter, parseFloat(manualMetrics.jitter)],
          timestamp: [...prevData.timestamp, now]
        };
      });

      // Update history
      setManualMetricsHistory(prev => [
        { ...manualMetrics, timestamp: new Date().toISOString() },
        ...prev.slice(0, 4)
      ]);

      // Reset form if not in continuous mode
      if (!isContinuousMode) {
        setManualMetrics({
          latency: '',
          bandwidth: '',
          packet_loss: '',
          jitter: ''
        });
      }
    } catch (error) {
      console.error('Error adding manual metrics:', error);
      if (error.message.includes('Could not validate user credentials')) {
        toast.error('Session expired. Please login again.');
        router.push('/login');
    } else {
        toast.error(error.message || 'Failed to add manual metrics');
      }
    } finally {
      setLoading(false);
    }
  };

  const parseCSVData = (csvText) => {
    try {
      const lines = csvText.split('\n');
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      
      // Initialize data arrays
      const data = {
        latency: [],
        bandwidth: [],
        packetLoss: [],
        jitter: [],
        timestamp: []
      };

      // Validate required columns exist
      const requiredColumns = ['timestamp', 'latency', 'bandwidth', 'packet_loss', 'jitter'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col.toLowerCase()));
      
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      // Get column indices
      const indices = {
        timestamp: headers.indexOf('timestamp'),
        latency: headers.indexOf('latency'),
        bandwidth: headers.indexOf('bandwidth'),
        packetLoss: headers.indexOf('packet_loss'),
        jitter: headers.indexOf('jitter')
      };

      // Parse data rows
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const values = line.split(',').map(v => v.trim());
          
          // Parse values and add to respective arrays
          data.timestamp.push(values[indices.timestamp]);
          data.latency.push(parseFloat(values[indices.latency]));
          data.bandwidth.push(parseFloat(values[indices.bandwidth]));
          data.packetLoss.push(parseFloat(values[indices.packetLoss]));
          data.jitter.push(parseFloat(values[indices.jitter]));
        }
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to parse CSV: ${error.message}`);
    }
  };

  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    setCsvError(null);

    if (file) {
      try {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const csvData = parseCSVData(e.target.result);
            
            // Update telemetry data with CSV data
            setTelemetryData(csvData);
            toast.success('CSV data loaded successfully');
            
            // Reset file input
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          } catch (error) {
            setCsvError(error.message);
            toast.error(error.message);
          }
        };

        reader.onerror = () => {
          setCsvError('Failed to read file');
          toast.error('Failed to read file');
        };

        reader.readAsText(file);
      } catch (error) {
        setCsvError(error.message);
        toast.error('Failed to process CSV file');
      }
    }
  };

  // Updated chart data configuration
  const chartData = {
    labels: telemetryData.timestamp,
          datasets: [
            {
        label: 'Latency (ms)',
        data: telemetryData.latency,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        yAxisID: 'y-latency',
        tension: 0.4,
        pointStyle: 'circle',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Bandwidth (Mbps)',
        data: telemetryData.bandwidth,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y-bandwidth',
        tension: 0.4,
        pointStyle: 'circle',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Packet Loss (%)',
        data: telemetryData.packetLoss,
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        yAxisID: 'y-packet-loss',
        tension: 0.4,
        pointStyle: 'circle',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Jitter (ms)',
        data: telemetryData.jitter,
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        yAxisID: 'y-jitter',
        tension: 0.4,
        pointStyle: 'circle',
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    animation: {
      duration: 250 // Faster animations
    },
          plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Network Telemetry Data',
        padding: {
          top: 10,
          bottom: 20
        }
      },
            tooltip: {
        mode: 'index',
        intersect: false,
              callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      'y-latency': {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Latency (ms)'
        },
        min: 0,
        max: 200,
        ticks: {
          stepSize: 20
        }
      },
      'y-bandwidth': {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Bandwidth (Mbps)'
        },
        min: 0,
        max: 150,
        grid: {
          drawOnChartArea: false,
        }
      },
      'y-packet-loss': {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Packet Loss (%)'
        },
        min: 0,
        max: 10,
        grid: {
          drawOnChartArea: false,
        }
      },
      'y-jitter': {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Jitter (ms)'
        },
        min: 0,
        max: 30,
        grid: {
          drawOnChartArea: false,
        }
      }
    }
  };

  const csvUploadSection = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">CSV Data Upload</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload CSV File
          </label>
          <p className="text-sm text-gray-500 mb-4">
            CSV must include columns: timestamp, latency, bandwidth, packet_loss, jitter
          </p>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              ref={fileInputRef}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
          {csvError && (
            <p className="mt-2 text-sm text-red-600">
              {csvError}
            </p>
          )}
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">CSV Format Example:</h3>
          <code className="text-xs text-gray-600 block">
            timestamp,latency,bandwidth,packet_loss,jitter<br />
            2024-02-20 10:00:00,45.5,100.2,0.5,2.1<br />
            2024-02-20 10:00:05,48.2,98.7,0.6,2.3
          </code>
        </div>
      </div>
    </motion.div>
  );

  const startContinuousMonitoring = () => {
    setActiveMonitoring(true);
    // Initial submission
    handleManualMetricsSubmit(new Event('submit'));
    
    // Set up interval for continuous monitoring
    monitoringIntervalRef.current = setInterval(() => {
      handleManualMetricsSubmit(new Event('submit'));
    }, monitoringInterval * 1000);
  };

  const stopContinuousMonitoring = () => {
    setActiveMonitoring(false);
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
  };

  const faultPredictionSection = (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-lg shadow p-6"
    >
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Fault Prediction</h2>
            <div className={`px-4 py-2 rounded-full ${
                (faultPrediction || 0) > 0.7 ? 'bg-red-100 text-red-800' :
                (faultPrediction || 0) > 0.3 ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
            }`}>
                {((faultPrediction || 0) * 100).toFixed(1)}% Risk
            </div>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
                className={`h-full transition-all duration-500 ${
                    (faultPrediction || 0) > 0.7 ? 'bg-red-500' :
                    (faultPrediction || 0) > 0.3 ? 'bg-yellow-500' :
                    'bg-green-500'
                }`}
                style={{ width: `${(faultPrediction || 0) * 100}%` }}
            ></div>
        </div>
    </motion.div>
  );

  const networkTopologySection = networkTopology && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Network Topology</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
          <h3 className="text-lg font-medium mb-2">Nodes</h3>
          <div className="space-y-2">
            {networkTopology.nodes.map(node => (
              <div
                key={node.id}
                className={`p-3 rounded-lg ${
                  node.in_path ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                }`}
              >
                Node {node.id}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Links</h3>
          <div className="space-y-2">
            {networkTopology.edges.map((edge, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  edge.in_path ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{edge.source} → {edge.target}</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    edge.metrics.congestion > 0.7 ? 'bg-red-100 text-red-800' :
                    edge.metrics.congestion > 0.3 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {(edge.metrics.congestion * 100).toFixed(0)}% Load
                  </span>
                </div>
                <div className="mt-2 text-sm grid grid-cols-2 gap-2">
                  <div>Latency: {edge.metrics.latency}ms</div>
                  <div>Bandwidth: {edge.metrics.bandwidth}Mbps</div>
                  <div>Loss: {(edge.metrics.packet_loss * 100).toFixed(1)}%</div>
                  <div>Jitter: {edge.metrics.jitter}ms</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Update the chart section to handle empty data
  const chartSection = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Network Telemetry</h2>
        <div className="flex space-x-4">
          <button
            onClick={handlePredictiveMaintenance}
            disabled={loading.maintenance || !telemetryData.latency.length}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading.maintenance ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <FaChartLine className="mr-2" />
                Analyze
                </>
              )}
          </button>
            </div>
            </div>

      {/* Display analysis results if available */}
      {maintenanceResults && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Analysis Results:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Anomalies Detected:</p>
              <p className="font-medium">{maintenanceResults.total_anomalies}</p>
          </div>
          <div>
              <p className="text-sm text-gray-600">Average Similarity:</p>
              <p className="font-medium">{(maintenanceResults.average_similarity * 100).toFixed(1)}%</p>
            </div>
              <div>
              <p className="text-sm text-gray-600">Fault Prediction:</p>
              <p className="font-medium">{(faultPrediction * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Data Points Analyzed:</p>
              <p className="font-medium">{maintenanceResults.data_points_analyzed}</p>
            </div>
          </div>
              </div>
            )}

      {/* Chart Section */}
      <div className="h-96">
        {telemetryData.latency.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No telemetry data available</p>
          </div>
        )}
      </div>
    </motion.div>
        );

        return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900">Network Resilience Dashboard</h1>
            <p className="mt-2 text-gray-600">Monitor and optimize network performance</p>
          </motion.div>

          {/* System Health Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">System Health</h2>
                <FaServer className="text-blue-500 text-2xl" />
              </div>
              {systemHealth ? (
          <div>
                  <p className="text-green-500 font-semibold">{systemHealth.status}</p>
                  <p className="text-gray-600 mt-2">Threshold: {systemHealth.SIMILARITY_THRESH}</p>
                </div>
              ) : (
                <p className="text-gray-500">Loading health status...</p>
              )}
            </motion.div>
            {faultPredictionSection}
          </div>

          {/* Telemetry Chart */}
          {chartSection}

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Maintenance Results */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Maintenance Analysis</h2>
                <FaCog className="text-blue-500 text-2xl" />
              </div>
              {maintenanceResults ? (
                <div className="space-y-4">
                  {maintenanceResults.results.map((result, index) => (
                    <div key={index} className="p-4 rounded-lg bg-gray-50">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Value: {result.value.toFixed(2)}</span>
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          result.anomaly ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {result.anomaly ? 'Anomaly' : 'Normal'}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-gray-600">Similarity: {(result.similarity * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Run analysis to see results</p>
              )}
            </motion.div>

            {/* Routing Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Network Routing</h2>
                <div className="flex space-x-2">
                  <select
                    name="algorithm"
                    value={routingConfig.algorithm}
                    onChange={handleRoutingConfigChange}
                    className="px-3 py-2 border rounded-lg"
                  >
                    <option value="dijkstra">Dijkstra</option>
                    <option value="astar">A* Algorithm</option>
                    <option value="k_shortest">K-Shortest Paths</option>
                  </select>
                  {routingConfig.algorithm === 'k_shortest' && (
                <input
                  type="number"
                      name="k_paths"
                      value={routingConfig.k_paths}
                      onChange={handleRoutingConfigChange}
                      min="1"
                      max="10"
                      className="w-20 px-3 py-2 border rounded-lg"
                    />
                  )}
                  <button
                    onClick={handleOptimalRoute}
                    disabled={loading.routing}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {loading.routing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <FaRoute className="mr-2" />
                        Calculate Route
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Source and Target Selection */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source Node</label>
                <input
                  type="number"
                    name="source"
                    value={routingConfig.source}
                    onChange={handleRoutingConfigChange}
                    min="1"
                    max="11"
                    step="1"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
            </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Node</label>
                  <input
                    type="number"
                    name="target"
                    value={routingConfig.target}
                    onChange={handleRoutingConfigChange}
                    min="1"
                    max="11"
                    step="1"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Routing Results */}
              {routingResults && (
                <div className="space-y-4">
                  {/* Path Information */}
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h3 className="font-medium mb-2">Optimal Paths:</h3>
                    {routingResults.paths.map((path, index) => (
                      <div key={index} className="mb-2">
                        <p className="text-blue-600">
                          Path {index + 1}: {path.join(' → ')}
                        </p>
                        <p className="text-gray-600 text-sm">
                          Cost: {routingResults.costs[index].toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* QoS Metrics */}
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h3 className="font-medium mb-2">QoS Metrics:</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">End-to-End Latency:</p>
                        <p className="font-medium">{routingResults.qos_metrics.end_to_end_latency.toFixed(2)} ms</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Available Bandwidth:</p>
                        <p className="font-medium">{routingResults.qos_metrics.available_bandwidth.toFixed(2)} Mbps</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Packet Loss Probability:</p>
                        <p className="font-medium">{(routingResults.qos_metrics.packet_loss_probability * 100).toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Jitter:</p>
                        <p className="font-medium">{routingResults.qos_metrics.total_jitter.toFixed(2)} ms</p>
                      </div>
                    </div>
                  </div>

                  {/* Network Visualization */}
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h3 className="font-medium mb-2">Network Topology:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Nodes:</h4>
                        <div className="space-y-1">
                          {routingResults.visualization_data.nodes.map(node => (
                            <div
                              key={node.id}
                              className={`px-3 py-1 rounded ${
                                node.in_path ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                              }`}
                            >
                              Node {node.id}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Edges:</h4>
                        <div className="space-y-1">
                          {routingResults.visualization_data.edges.map((edge, index) => (
                            <div
                              key={index}
                              className={`px-3 py-1 rounded ${
                                edge.in_path ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                              }`}
                            >
                              {edge.source} → {edge.target}
                              <div className="text-xs text-gray-600">
                                Congestion: {(edge.metrics.congestion * 100).toFixed(1)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
            )}

              {/* Routing History */}
              {routingHistory.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Recent Routes:</h3>
                  <div className="space-y-2">
                    {routingHistory.slice(-5).map((entry, index) => (
                      <div key={index} className="p-3 rounded-lg bg-gray-50 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {entry.source} → {entry.target}
                          </span>
                          <span className="text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
            </div>
                        <div className="text-gray-600">
                          Algorithm: {entry.algorithm}
          </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Network Topology Visualization */}
          {networkTopologySection}

          {/* Configuration Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">System Configuration</h2>
              <div className="space-x-4">
                <button
                  onClick={handleConfigUpdate}
                  disabled={loading.config}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleRetrainModel}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <FaSync className="inline mr-2" />
                  Retrain Model
                </button>
              </div>
            </div>
            {config ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Similarity Threshold
                  </label>
                  <input
                    type="number"
                    value={config.SIMILARITY_THRESH}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      SIMILARITY_THRESH: parseFloat(e.target.value)
                    }))}
                    step="0.1"
                    min="0"
                    max="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Threshold for anomaly detection (0-1)
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loading configuration...</p>
            )}
          </motion.div>

          {/* Manual Metrics Input Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Manual Metrics Input</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isContinuousMode}
                      onChange={(e) => setIsContinuousMode(e.target.checked)}
                      disabled={activeMonitoring || isBatchMode}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">Continuous</span>
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isBatchMode}
                      onChange={(e) => setIsBatchMode(e.target.checked)}
                      disabled={activeMonitoring || isContinuousMode}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">Batch</span>
                  </label>
            </div>
                <button
                  onClick={() => setIsManualInputOpen(!isManualInputOpen)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  {isManualInputOpen ? 'Hide Form' : 'Show Form'}
                </button>
              </div>
            </div>

            {isManualInputOpen && (
              <div className="space-y-6">
                {/* Presets Section */}
                <div className="flex space-x-2">
                  {Object.entries(metricPresets).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => handlePresetChange(key)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedPreset === key
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (isContinuousMode && !activeMonitoring) {
                    startContinuousMonitoring();
                  } else if (isBatchMode) {
                    handleAddBatchEntry();
                  } else {
                    handleManualMetricsSubmit(e);
                  }
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Latency Input Group */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Latency (ms)
                      </label>
                      <div className="mt-1 space-y-2">
                        <input
                          type="range"
                          name="latency"
                          value={manualMetrics.latency}
                          onChange={handleManualMetricsChange}
                          min="0"
                          max="1000"
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                <input
                  type="number"
                          name="latency"
                          value={manualMetrics.latency}
                          onChange={handleManualMetricsChange}
                          placeholder="Enter latency (0-1000)"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="0"
                          max="1000"
                          required
                        />
                      </div>
                    </div>

                    {/* Bandwidth Input Group */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Bandwidth (Mbps)
              </label>
                      <div className="mt-1 space-y-2">
                        <input
                          type="range"
                          name="bandwidth"
                          value={manualMetrics.bandwidth}
                          onChange={handleManualMetricsChange}
                          min="0"
                          max="1000"
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <input
                          type="number"
                          name="bandwidth"
                          value={manualMetrics.bandwidth}
                          onChange={handleManualMetricsChange}
                          placeholder="Enter bandwidth"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="0"
                          required
                        />
            </div>
          </div>

                    {/* Packet Loss Input Group */}
          <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Packet Loss (%)
                      </label>
                      <div className="mt-1 space-y-2">
                        <input
                          type="range"
                          name="packet_loss"
                          value={manualMetrics.packet_loss}
                          onChange={handleManualMetricsChange}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <input
                          type="number"
                          name="packet_loss"
                          value={manualMetrics.packet_loss}
                          onChange={handleManualMetricsChange}
                          placeholder="Enter packet loss (0-100)"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="0"
                          max="100"
                          step="0.1"
                          required
                        />
            </div>
          </div>

                    {/* Jitter Input Group */}
          <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Jitter (ms)
                      </label>
                      <div className="mt-1 space-y-2">
                        <input
                          type="range"
                          name="jitter"
                          value={manualMetrics.jitter}
                          onChange={handleManualMetricsChange}
                          min="0"
                          max="100"
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <input
                          type="number"
                          name="jitter"
                          value={manualMetrics.jitter}
                          onChange={handleManualMetricsChange}
                          placeholder="Enter jitter (0-100)"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="0"
                          max="100"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Batch Entries Display */}
                  {isBatchMode && batchEntries.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Batch Entries</h3>
                      <div className="space-y-2">
                        {batchEntries.map((entry, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-4 gap-4 flex-1">
                              <span>Latency: {entry.latency}ms</span>
                              <span>Bandwidth: {entry.bandwidth}Mbps</span>
                              <span>Loss: {entry.packet_loss}%</span>
                              <span>Jitter: {entry.jitter}ms</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setBatchEntries(entries => entries.filter((_, i) => i !== index))}
                              className="text-red-500 hover:text-red-600 ml-2"
                            >
                              ×
                            </button>
            </div>
                ))}
              </div>
            </div>
                  )}

                  {/* Recent History */}
                  {manualMetricsHistory.length > 0 && !isBatchMode && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Entries</h3>
                      <div className="space-y-2">
                        {manualMetricsHistory.map((entry, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded-lg text-sm">
                            <div className="grid grid-cols-4 gap-4">
                              <span>Latency: {entry.latency}ms</span>
                              <span>Bandwidth: {entry.bandwidth}Mbps</span>
                              <span>Loss: {entry.packet_loss}%</span>
                              <span>Jitter: {entry.jitter}ms</span>
          </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(entry.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Controls Section */}
                  <div className="flex items-center justify-between">
                    {/* Interval Control for Continuous Mode */}
                    {isContinuousMode && (
                      <div className="flex items-center space-x-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Update Interval (seconds)
                          </label>
                          <input
                            type="number"
                            value={monitoringInterval}
                            onChange={(e) => setMonitoringInterval(Math.max(1, parseInt(e.target.value) || 5))}
                            className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            min="1"
                            disabled={activeMonitoring}
                          />
                        </div>
                        {activeMonitoring && (
                          <div className="flex items-center">
                            <div className="animate-pulse mr-2 h-3 w-3 rounded-full bg-green-500"></div>
                            <span className="text-sm text-green-600">Monitoring Active</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4">
                      {isContinuousMode && activeMonitoring && (
            <button
                          type="button"
                          onClick={stopContinuousMonitoring}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Stop Monitoring
            </button>
                      )}
                      {isBatchMode && batchEntries.length > 0 && (
                        <button
                          type="button"
                          onClick={handleBatchSubmit}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Submit Batch ({batchEntries.length})
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={loading.metrics || (isContinuousMode && activeMonitoring)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        {loading.metrics ? 'Adding...' : 
                         isContinuousMode ? 'Start Monitoring' :
                         isBatchMode ? 'Add to Batch' : 'Add Metrics'}
                      </button>
    </div>
                  </div>
                </form>
              </div>
            )}
          </motion.div>

          {/* CSV Upload Section */}
          {csvUploadSection}
        </div>
      </div>
    </Layout>
  );
}
