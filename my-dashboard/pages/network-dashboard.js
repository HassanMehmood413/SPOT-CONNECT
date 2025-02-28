import { useState } from "react";

export default function Home() {
  const [telemetryInput, setTelemetryInput] = useState("10,12,14,13,15,16,18,17,19,20");
  const [configInput, setConfigInput] = useState("0.3");
  const [maintenanceData, setMaintenanceData] = useState(null);
  const [routingData, setRoutingData] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [configData, setConfigData] = useState(null);
  const [retrainStatus, setRetrainStatus] = useState(null);
  const [telemetryError, setTelemetryError] = useState("");

  // Convert telemetry string to an array of numbers
  const parseTelemetryData = (input) => {
    try {
      return input.split(",").map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
    } catch (error) {
      return [];
    }
  };

  // Call Predictive Maintenance endpoint using dynamic telemetry data.
  const callPredictiveMaintenance = async () => {
    const telemetryArray = parseTelemetryData(telemetryInput);
    if (telemetryArray.length === 0) {
      setTelemetryError("Please enter valid comma-separated numbers.");
      return;
    }
    setTelemetryError("");
    try {
      const res = await fetch("http://localhost:3000/predictive-maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: telemetryArray }),
      });
      const data = await res.json();
      setMaintenanceData(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Call Routing endpoint with source and target parameters.
  const callRouting = async () => {
    try {
      const res = await fetch("http://localhost:3000/routing?source=1&target=7");
      const data = await res.json();
      setRoutingData(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Call Health Check endpoint.
  const callHealthCheck = async () => {
    try {
      const res = await fetch("http://localhost:3000/health-check");
      const data = await res.json();
      setHealthData(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Get current configuration.
  const getConfig = async () => {
    try {
      const res = await fetch("http://localhost:3000/config");
      const data = await res.json();
      setConfigData(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Update configuration with a new similarity threshold.
  const updateConfig = async () => {
    try {
      const newConfig = { SIMILARITY_THRESH: parseFloat(configInput) };
      const res = await fetch("http://localhost:3000/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
      const data = await res.json();
      setConfigData(data.config);
    } catch (err) {
      console.error(err);
    }
  };

  // Retrain the penalty model.
  const retrainPenalty = async () => {
    try {
      const res = await fetch("http://localhost:3000/retrain-penalty", {
        method: "POST",
      });
      const data = await res.json();
      setRetrainStatus(data.status);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Network Resilience API Dashboard</h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Predictive Maintenance</h2>
        <div>
          <label>
            Telemetry Data (comma-separated):
            <input
              type="text"
              value={telemetryInput}
              onChange={(e) => setTelemetryInput(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
            />
          </label>
          {telemetryError && (
            <p style={{ color: "red" }}>{telemetryError}</p>
          )}
        </div>
        <button onClick={callPredictiveMaintenance} style={{ marginTop: "1rem" }}>
          Call Predictive Maintenance
        </button>
        {maintenanceData && (
          <pre style={{ background: "#f0f0f0", padding: "1rem", marginTop: "1rem" }}>
            {JSON.stringify(maintenanceData, null, 2)}
          </pre>
        )}
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Routing</h2>
        <button onClick={callRouting}>Call Routing (Source:1, Target:7)</button>
        {routingData && (
          <pre style={{ background: "#f0f0f0", padding: "1rem", marginTop: "1rem" }}>
            {JSON.stringify(routingData, null, 2)}
          </pre>
        )}
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Health Check</h2>
        <button onClick={callHealthCheck}>Call Health Check</button>
        {healthData && (
          <pre style={{ background: "#f0f0f0", padding: "1rem", marginTop: "1rem" }}>
            {JSON.stringify(healthData, null, 2)}
          </pre>
        )}
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Configuration</h2>
        <div>
          <label>
            Similarity Threshold:
            <input
              type="number"
              step="0.01"
              value={configInput}
              onChange={(e) => setConfigInput(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
            />
          </label>
        </div>
        <button onClick={getConfig} style={{ marginTop: "1rem" }}>Get Config</button>
        <button onClick={updateConfig} style={{ marginTop: "1rem", marginLeft: "1rem" }}>
          Update Config
        </button>
        {configData && (
          <pre style={{ background: "#f0f0f0", padding: "1rem", marginTop: "1rem" }}>
            {JSON.stringify(configData, null, 2)}
          </pre>
        )}
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Retrain Penalty Model</h2>
        <button onClick={retrainPenalty}>Retrain Penalty Model</button>
        {retrainStatus && (
          <pre style={{ background: "#f0f0f0", padding: "1rem", marginTop: "1rem" }}>
            {JSON.stringify(retrainStatus, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}
