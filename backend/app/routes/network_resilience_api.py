import uvicorn
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import numpy as np
import networkx as nx
import logging
from scipy.spatial.distance import cosine
from sklearn.neural_network import MLPRegressor
from sklearn.exceptions import NotFittedError

# =============================================================================
# Setup Logging
# =============================================================================
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

# =============================================================================
# Hyperparameters & Global Configuration
# =============================================================================
DIM = 10000             # Dimensionality for hypervectors
SIMILARITY_THRESH = 0.3  # Default threshold for anomaly detection

CONFIG = {
    "SIMILARITY_THRESH": SIMILARITY_THRESH
}

# =============================================================================
# Utility Functions for Hyperdimensional Computing
# =============================================================================
def generate_random_hypervector(dim: int = DIM):
    """Generate a random bipolar hypervector (-1 or 1 elements)."""
    return np.random.choice([-1, 1], size=dim)

def moving_average_filter(data, window_size: int = 5):
    """Apply a simple moving average filter to smooth out noise."""
    if len(data) < window_size:
        return data
    return np.convolve(data, np.ones(window_size)/window_size, mode='valid')

# =============================================================================
# Predictive Maintenance Module using Hyperdimensional Computing
# =============================================================================
class PredictiveMaintenance:
    def __init__(self, dim: int = DIM, similarity_thresh: float = CONFIG["SIMILARITY_THRESH"], bin_range=(0, 40)):
        self.dim = dim
        self.similarity_thresh = similarity_thresh
        self.prototype = None
        # Precompute a fixed projection dictionary for each integer in bin_range
        self.projection_dict = {}
        for val in range(bin_range[0], bin_range[1] + 1):
            np.random.seed(val)
            self.projection_dict[val] = generate_random_hypervector(self.dim)
        logging.info("Projection dictionary built for bins {} to {}.".format(bin_range[0], bin_range[1]))

    def fixed_encode(self, data_point: float):
        """
        Encode a numeric data point using linear interpolation between the two nearest bins.
        """
        lower = int(np.floor(data_point))
        upper = int(np.ceil(data_point))
        if lower == upper:
            return self.projection_dict.get(lower, generate_random_hypervector(self.dim))
        vec_lower = self.projection_dict.get(lower)
        vec_upper = self.projection_dict.get(upper)
        if vec_lower is None:
            np.random.seed(lower)
            vec_lower = generate_random_hypervector(self.dim)
            self.projection_dict[lower] = vec_lower
        if vec_upper is None:
            np.random.seed(upper)
            vec_upper = generate_random_hypervector(self.dim)
            self.projection_dict[upper] = vec_upper
        weight_upper = data_point - lower
        weight_lower = 1 - weight_upper
        interpolated = weight_lower * vec_lower + weight_upper * vec_upper
        return np.where(interpolated >= 0, 1, -1)

    def build_prototype(self, telemetry_data):
        """
        Build a prototype hypervector (normal state) from telemetry data.
        Flow:
         - Apply moving average filter
         - Encode data points using hyperdimensional computing
         - Sum encoded vectors and binarize to build the prototype
        """
        try:
            smoothed = moving_average_filter(telemetry_data)
            logging.info("Telemetry data smoothed with moving average filter.")
            encoded_vectors = [self.fixed_encode(val) for val in smoothed]
            sum_vector = np.sum(encoded_vectors, axis=0)
            self.prototype = np.where(sum_vector >= 0, 1, -1)
            logging.info("Prototype hypervector built from telemetry data.")
        except Exception as e:
            logging.error(f"Error building prototype: {e}")
            raise

    def detect(self, data_point: float):
        """
        Detect anomalies by:
         - Encoding a new data point
         - Comparing it to the prototype via cosine similarity
         - Flagging anomalies if similarity is below the threshold
        """
        if self.prototype is None:
            raise ValueError("Prototype not initialized. Run build_prototype() first.")
        try:
            encoded = self.fixed_encode(data_point)
            similarity = 1 - cosine(encoded, self.prototype)
            is_anomaly = similarity < self.similarity_thresh
            return similarity, is_anomaly
        except Exception as e:
            logging.error(f"Error during detection: {e}")
            raise

# =============================================================================
# Neuro-Symbolic Routing Module with Dynamic Penalty Adjustment
# =============================================================================
class NeuroSymbolicRouting:
    def __init__(self):
        self.G = None
        self.penalty_model = MLPRegressor(hidden_layer_sizes=(10,), max_iter=500, random_state=42)
        self._train_penalty_model()

    def _train_penalty_model(self):
        X_train = np.linspace(0, 1, 50).reshape(-1, 1)
        y_train = np.array([np.exp(cong) - 1 for cong in X_train.flatten()])
        try:
            self.penalty_model.fit(X_train, y_train)
            logging.info("Penalty model trained successfully.")
        except Exception as e:
            logging.error(f"Error training penalty model: {e}")
            raise

    def build_network_graph(self):
        """
        Build network graph:
         - Create nodes
         - Add edges with base cost and congestion factor
        """
        self.G = nx.Graph()
        for i in range(1, 8):
            self.G.add_node(i)
        edges = [
            (1, 2, 5, 0.2),
            (1, 3, 3, 0.1),
            (2, 4, 2, 0.5),
            (3, 4, 4, 0.3),
            (4, 5, 6, 0.2),
            (5, 6, 1, 0.7),
            (3, 6, 8, 0.1),
            (6, 7, 3, 0.4),
            (4, 7, 7, 0.3)
        ]
        for u, v, cost, congestion in edges:
            adjusted_cost = cost * (1 + congestion)
            self.G.add_edge(u, v, base_cost=cost, congestion=congestion, adjusted_cost=adjusted_cost)
        logging.info("Network graph built successfully.")

    def adjust_costs(self):
        """
        Adjust edge costs:
         - Use penalty model to calculate learned penalty based on congestion
         - Apply a fixed penalty if congestion > 0.5
         - Sum these to get final cost for each edge
        """
        if self.G is None:
            raise ValueError("Graph not built. Run build_network_graph() first.")
        for u, v, data in self.G.edges(data=True):
            congestion = data['congestion']
            try:
                learned_penalty = self.penalty_model.predict(np.array([[congestion]]))[0]
            except NotFittedError:
                logging.warning("Penalty model not fitted; using 0.")
                learned_penalty = 0
            fixed_penalty = 3 if congestion > 0.5 else 0
            data['final_cost'] = data['adjusted_cost'] + learned_penalty + fixed_penalty
        logging.info("Edge costs adjusted using neuro-symbolic integration.")

    def compute_optimal_path(self, source: int, target: int):
        """
        Compute the optimal path using Dijkstra’s algorithm:
         - Based on the adjusted edge costs, determine the shortest path
         - Return the path and its total cost
        """
        if self.G is None:
            raise ValueError("Graph not built. Run build_network_graph() first.")
        self.adjust_costs()
        try:
            path = nx.dijkstra_path(self.G, source, target, weight='final_cost')
            total_cost = nx.dijkstra_path_length(self.G, source, target, weight='final_cost')
            return path, total_cost
        except Exception as e:
            logging.error(f"Error computing optimal path: {e}")
            raise

# =============================================================================
# Pydantic Models for Request Validation
# =============================================================================
class TelemetryData(BaseModel):
    data: list[float]

class ConfigData(BaseModel):
    SIMILARITY_THRESH: float

# =============================================================================
# FastAPI Setup and Endpoints
# =============================================================================
app = FastAPI(
    title="Network Resilience API",
    description="API for Predictive Maintenance and Routing",
    version="1.0"
)

# Global instances of our modules
pm = PredictiveMaintenance()
nsr = NeuroSymbolicRouting()

# --- Endpoint: Predictive Maintenance ---
@app.post("/predictive-maintenance")
async def predictive_maintenance_endpoint(telemetry: TelemetryData):
    """
    Flow:
      1. Receive telemetry data (client request)
      2. Apply moving average filter
      3. Encode data using hyperdimensional computing
      4. Build prototype hypervector (normal state)
      5. Detect anomalies by comparing new data points
      6. Calculate cosine similarity and flag anomalies
      7. Return anomaly detection results
    """
    try:
        telemetry_array = np.array(telemetry.data)
        pm.build_prototype(telemetry_array)
        results = []
        for val in telemetry.data:
            similarity, anomaly = pm.detect(val)
            results.append({
                "value": float(val),
                "similarity": float(similarity),
                "anomaly": bool(anomaly)
            })
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Endpoint: Routing ---
@app.get("/routing")
async def routing_endpoint(source: int = Query(1), target: int = Query(7)):
    """
    Flow:
      1. Build network graph
      2. Adjust edge costs with penalty model
      3. Compute optimal path using Dijkstra’s algorithm
      4. Return routing results
    """
    try:
        nsr.build_network_graph()
        path, total_cost = nsr.compute_optimal_path(source, target)
        return {"path": path, "total_cost": total_cost}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Endpoint: Health Check ---
@app.get("/health-check")
async def health_check():
    """
    Returns system health and current configuration for monitoring.
    """
    return {"status": "ok", "SIMILARITY_THRESH": pm.similarity_thresh}

# --- Endpoint: Get/Update Configuration ---
@app.get("/config")
async def get_config():
    """
    Returns the current configuration.
    """
    return CONFIG

@app.post("/config")
async def update_config(new_config: ConfigData):
    """
    Updates the configuration (e.g., SIMILARITY_THRESH) and applies changes.
    """
    try:
        CONFIG["SIMILARITY_THRESH"] = new_config.SIMILARITY_THRESH
        pm.similarity_thresh = new_config.SIMILARITY_THRESH
        return {"status": "updated", "config": CONFIG}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Endpoint: Retrain Penalty Model ---
@app.post("/retrain-penalty")
async def retrain_penalty():
    """
    Retrains the penalty model used for adjusting routing costs.
    """
    try:
        nsr._train_penalty_model()
        return {"status": "Penalty model retrained."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
