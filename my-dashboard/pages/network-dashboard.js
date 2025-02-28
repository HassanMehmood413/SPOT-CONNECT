import { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import CytoscapeComponent from "react-cytoscapejs";
import styles from "../styles/Home.module.css"; // optional: add your own CSS

export default function Home() {
  // Active Section for Navigation Menu
  const [activeSection, setActiveSection] = useState("Overview");

  // Global States for Overview Panel (Health Check)
  const [healthData, setHealthData] = useState(null);
  const [uptime, setUptime] = useState("72 hours"); // dummy uptime value
  const [modelVersion, setModelVersion] = useState("v1.0"); // dummy model version
  const [avgSimilarity, setAvgSimilarity] = useState(null);
  const [anomalyRate, setAnomalyRate] = useState(null);

  // Logs for Developer Tools & Debug
  const [logs, setLogs] = useState([]);

  // Utility to add log messages
  const addLog = (msg) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  // Refresh health data on load and periodically
  const fetchHealthData = async () => {
    try {
      const res = await fetch("http://localhost:8000/health-check");
      const data = await res.json();
      setHealthData(data);
      addLog("Fetched health-check data.");
    } catch (err) {
      addLog("Error fetching health-check data.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 10000);
    return () => clearInterval(interval);
  }, []);

  // ------------------------------
  // Predictive Maintenance Section
  // ------------------------------
  const [telemetryInput, setTelemetryInput] = useState(
    "10,12,14,13,15,16,18,17,19,20"
  );
  const [pmResults, setPmResults] = useState(null);
  const [pmError, setPmError] = useState("");
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  // Function to parse telemetry input
  const parseTelemetryData = (input) => {
    try {
      return input
        .split(",")
        .map((s) => parseFloat(s.trim()))
        .filter((n) => !isNaN(n));
    } catch (error) {
      return [];
    }
  };

  const callPredictiveMaintenance = async () => {
    const telemetryArray = parseTelemetryData(telemetryInput);
    if (telemetryArray.length === 0) {
      setPmError("Please enter valid comma-separated numbers.");
      return;
    }
    setPmError("");
    try {
      const res = await fetch("http://localhost:8000/predictive-maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: telemetryArray }),
      });
      const data = await res.json();
      setPmResults(data);
      addLog("Predictive maintenance data fetched.");
      updateChart(telemetryArray, data.results);
      // Update average similarity and anomaly rate for Overview
      const similarities = data.results.map((r) => r.similarity);
      const avgSim =
        similarities.reduce((acc, cur) => acc + cur, 0) / similarities.length;
      setAvgSimilarity(avgSim.toFixed(3));
      const anomalies = data.results.filter((r) => r.anomaly).length;
      setAnomalyRate(((anomalies / data.results.length) * 100).toFixed(1));
    } catch (err) {
      addLog("Error fetching predictive maintenance data.");
      console.error(err);
    }
  };

  // Chart.js - update or create chart for telemetry data
  const updateChart = (telemetryArray, results) => {
    const ctx = chartRef.current.getContext("2d");
    // Prepare data with color for anomalies
    const dataLabels = telemetryArray.map((_, i) => `Point ${i + 1}`);
    const dataValues = results.map((r) => r.similarity);
    const pointBackground = results.map((r) =>
      r.anomaly ? "rgba(255,99,132,1)" : "rgba(75,192,192,1)"
    );

    if (chartInstance) {
      chartInstance.data.labels = dataLabels;
      chartInstance.data.datasets[0].data = dataValues;
      chartInstance.data.datasets[0].pointBackgroundColor = pointBackground;
      chartInstance.update();
    } else {
      const newChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: dataLabels,
          datasets: [
            {
              label: "Similarity Score",
              data: dataValues,
              fill: false,
              borderColor: "rgba(75,192,192,1)",
              tension: 0.1,
              pointBackgroundColor: pointBackground,
            },
          ],
        },
        options: {
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) =>
                  `Similarity: ${context.parsed.y} ${
                    results[context.dataIndex].anomaly ? "(Anomaly)" : ""
                  }`,
              },
            },
          },
        },
      });
      setChartInstance(newChart);
    }
  };

  // ------------------------------
  // Routing Section
  // ------------------------------
  const [sourceNode, setSourceNode] = useState(1);
  const [targetNode, setTargetNode] = useState(7);
  const [routingData, setRoutingData] = useState(null);
  const [cyElements, setCyElements] = useState([]);
  const [cyStyles, setCyStyles] = useState([]);
  const [cyLayout, setCyLayout] = useState({ name: "circle" });

  const callRouting = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/routing?source=${sourceNode}&target=${targetNode}`
      );
      const data = await res.json();
      setRoutingData(data);
      addLog("Routing data fetched.");
      buildCyGraph(data.path);
    } catch (err) {
      addLog("Error fetching routing data.");
      console.error(err);
    }
  };

  // Build Cytoscape elements based on a fixed network and highlight optimal path.
  const buildCyGraph = (optimalPath) => {
    // Dummy network graph structure; adjust as needed.
    const nodes = [
      { data: { id: "1", label: "1" } },
      { data: { id: "2", label: "2" } },
      { data: { id: "3", label: "3" } },
      { data: { id: "4", label: "4" } },
      { data: { id: "5", label: "5" } },
      { data: { id: "6", label: "6" } },
      { data: { id: "7", label: "7" } },
    ];
    // Pre-defined edges with dummy attributes
    const edges = [
      { data: { id: "e1-2", source: "1", target: "2", cost: 6 } },
      { data: { id: "e1-3", source: "1", target: "3", cost: 3.3 } },
      { data: { id: "e2-4", source: "2", target: "4", cost: 3 } },
      { data: { id: "e3-4", source: "3", target: "4", cost: 5.2 } },
      { data: { id: "e4-5", source: "4", target: "5", cost: 7.2 } },
      { data: { id: "e5-6", source: "5", target: "6", cost: 3.7 } },
      { data: { id: "e3-6", source: "3", target: "6", cost: 8.1 } },
      { data: { id: "e6-7", source: "6", target: "7", cost: 4.2 } },
      { data: { id: "e4-7", source: "4", target: "7", cost: 9.1 } },
    ];
    // Highlight the optimal path by updating the style of edges along the path.
    const highlightedEdges = optimalPath.reduce((acc, curr, idx, arr) => {
      if (idx < arr.length - 1) {
        acc.push(`e${arr[idx]}-${arr[idx + 1]}`);
      }
      return acc;
    }, []);
    // Update Cytoscape styles accordingly
    const style = [
      {
        selector: "node",
        style: {
          label: "data(label)",
          "background-color": "#666",
          "text-valign": "center",
          color: "#fff",
        },
      },
      {
        selector: "edge",
        style: {
          width: 2,
          "line-color": "#ccc",
          "target-arrow-color": "#ccc",
          "curve-style": "bezier",
        },
      },
      {
        selector: `edge[id *="${highlightedEdges.join('"], edge[id *="')}"]`,
        style: {
          "line-color": "red",
          width: 4,
        },
      },
    ];
    setCyStyles(style);
    setCyElements([...nodes, ...edges]);
  };

  // ------------------------------
  // Configuration Section
  // ------------------------------
  const [configData, setConfigData] = useState(null);
  const [similarityThreshInput, setSimilarityThreshInput] = useState("0.3");
  const getConfig = async () => {
    try {
      const res = await fetch("http://localhost:8000/config");
      const data = await res.json();
      setConfigData(data);
      addLog("Configuration fetched.");
    } catch (err) {
      addLog("Error fetching configuration.");
      console.error(err);
    }
  };

  const updateConfig = async () => {
    try {
      const newConfig = { SIMILARITY_THRESH: parseFloat(similarityThreshInput) };
      const res = await fetch("http://localhost:8000/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
      const data = await res.json();
      setConfigData(data.config);
      addLog("Configuration updated.");
    } catch (err) {
      addLog("Error updating configuration.");
      console.error(err);
    }
  };

  // ------------------------------
  // Model Management Section
  // ------------------------------
  const [modelStatus, setModelStatus] = useState("");
  const [modelDiagnostics, setModelDiagnostics] = useState({
    trainingLoss: "N/A",
    lastRetrain: "N/A",
  });

  const retrainPenaltyModel = async () => {
    try {
      const res = await fetch("http://localhost:8000/retrain-penalty", {
        method: "POST",
      });
      const data = await res.json();
      setModelStatus(data.status);
      // For demo purposes, update diagnostics with dummy values.
      setModelDiagnostics({
        trainingLoss: "0.025",
        lastRetrain: new Date().toLocaleString(),
      });
      addLog("Penalty model retrained.");
    } catch (err) {
      addLog("Error retraining penalty model.");
      console.error(err);
    }
  };

  // ------------------------------
  // Developer Tools & Debug Section
  // ------------------------------
  // We embed a link to the API docs (Swagger) and show our log console.

  // ------------------------------
  // Layout & Navigation
  // ------------------------------
  const renderSection = () => {
    switch (activeSection) {
      case "Overview":
        return (
          <div>
            <h2>Overview Panel</h2>
            <div className={styles.card}>
              <h3>System Status</h3>
              <p>
                <strong>Uptime:</strong> {uptime}
              </p>
              <p>
                <strong>Model Version:</strong> {modelVersion}
              </p>
              {healthData && (
                <>
                  <p>
                    <strong>Configuration:</strong>{" "}
                    {JSON.stringify(healthData, null, 2)}
                  </p>
                </>
              )}
            </div>
            <div className={styles.card}>
              <h3>Real-Time Metrics</h3>
              <p>
                <strong>Average Similarity Score:</strong>{" "}
                {avgSimilarity || "N/A"}
              </p>
              <p>
                <strong>Anomaly Rate:</strong>{" "}
                {anomalyRate ? `${anomalyRate}%` : "N/A"}
              </p>
            </div>
          </div>
        );
      case "PredictiveMaintenance":
        return (
          <div>
            <h2>Predictive Maintenance</h2>
            <div className={styles.formGroup}>
              <label>Telemetry Data (comma-separated):</label>
              <input
                type="text"
                value={telemetryInput}
                onChange={(e) => setTelemetryInput(e.target.value)}
              />
              {pmError && <p className={styles.error}>{pmError}</p>}
              <button onClick={callPredictiveMaintenance}>Submit</button>
            </div>
            {pmResults && (
              <div>
                <h3>Results</h3>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Data Point</th>
                      <th>Similarity</th>
                      <th>Anomaly</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pmResults.results.map((r, idx) => (
                      <tr key={idx}>
                        <td>{r.value}</td>
                        <td>{r.similarity.toFixed(3)}</td>
                        <td>{r.anomaly ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <canvas ref={chartRef} width="600" height="300" />
              </div>
            )}
          </div>
        );
      case "Routing":
        return (
          <div>
            <h2>Routing</h2>
            <div className={styles.formGroup}>
              <label>
                Source Node:
                <input
                  type="number"
                  value={sourceNode}
                  onChange={(e) => setSourceNode(e.target.value)}
                />
              </label>
              <label>
                Target Node:
                <input
                  type="number"
                  value={targetNode}
                  onChange={(e) => setTargetNode(e.target.value)}
                />
              </label>
              <button onClick={callRouting}>Find Optimal Route</button>
            </div>
            {routingData && (
              <div>
                <h3>Routing Summary</h3>
                <p>
                  <strong>Path:</strong> {routingData.path.join(" -> ")}
                </p>
                <p>
                  <strong>Total Cost:</strong> {routingData.total_cost}
                </p>
              </div>
            )}
            <div style={{ height: "400px", border: "1px solid #ccc" }}>
              <CytoscapeComponent
                elements={cyElements}
                style={{ width: "100%", height: "100%" }}
                stylesheet={cyStyles}
                layout={cyLayout}
              />
            </div>
          </div>
        );
      case "Configuration":
        return (
          <div>
            <h2>Configuration</h2>
            <div className={styles.formGroup}>
              <button onClick={getConfig}>Get Current Configuration</button>
              {configData && (
                <pre className={styles.code}>
                  {JSON.stringify(configData, null, 2)}
                </pre>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>
                Update Similarity Threshold:
                <input
                  type="number"
                  step="0.01"
                  value={similarityThreshInput}
                  onChange={(e) => setSimilarityThreshInput(e.target.value)}
                />
              </label>
              <button onClick={updateConfig}>Save Changes</button>
            </div>
          </div>
        );
      case "ModelManagement":
        return (
          <div>
            <h2>Model Management</h2>
            <button onClick={retrainPenaltyModel}>Retrain Penalty Model</button>
            {modelStatus && <p>Status: {modelStatus}</p>}
            <div className={styles.card}>
              <h3>Model Diagnostics</h3>
              <p>
                <strong>Training Loss:</strong> {modelDiagnostics.trainingLoss}
              </p>
              <p>
                <strong>Last Retrained:</strong>{" "}
                {modelDiagnostics.lastRetrain}
              </p>
            </div>
          </div>
        );
      case "DeveloperTools":
        return (
          <div>
            <h2>Developer Tools & Debug</h2>
            <div className={styles.card}>
              <h3>API Documentation</h3>
              <p>
                Access the full API docs at{" "}
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  http://localhost:8000/docs
                </a>
              </p>
            </div>
            <div className={styles.card}>
              <h3>Log Console</h3>
              <div className={styles.logConsole}>
                {logs.map((log, idx) => (
                  <p key={idx}>{log}</p>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return <div>Select a section from the menu.</div>;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Network Resilience Dashboard</h1>
        <nav className={styles.nav}>
          {[
            "Overview",
            "PredictiveMaintenance",
            "Routing",
            "Configuration",
            "ModelManagement",
            "DeveloperTools",
          ].map((section) => (
            <button
              key={section}
              className={
                activeSection === section ? styles.activeNav : styles.navButton
              }
              onClick={() => setActiveSection(section)}
            >
              {section === "PredictiveMaintenance"
                ? "Predictive Maintenance"
                : section === "ModelManagement"
                ? "Model Management"
                : section}
            </button>
          ))}
        </nav>
      </header>
      <main className={styles.main}>{renderSection()}</main>
    </div>
  );
}
