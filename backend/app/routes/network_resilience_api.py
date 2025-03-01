import uvicorn
from fastapi import FastAPI, HTTPException, Query, APIRouter, Depends
from pydantic import BaseModel, validator
import numpy as np
import networkx as nx
import logging
from scipy.spatial.distance import cosine
from sklearn.neural_network import MLPRegressor
from sklearn.exceptions import NotFittedError
from typing import List, Dict
from . import oauth2
from datetime import datetime

# =============================================================================
# Setup Logging
# =============================================================================
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

# =============================================================================
# Hyperparameters & Global Configuration
# =============================================================================
DIM = 10000             # Dimensionality for hypervectors
SIMILARITY_THRESH = 0.7  # Default threshold for anomaly detection - increased for better sensitivity

CONFIG = {
    "SIMILARITY_THRESH": SIMILARITY_THRESH,
    "DIM": DIM
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
        self.route_history = []
        self.qos_weights = {
            'latency': 0.4,
            'bandwidth': 0.3,
            'packet_loss': 0.2,
            'jitter': 0.1
        }
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
        Build enhanced network graph with more nodes and QoS metrics
        """
        self.G = nx.Graph()
        # Add more nodes for better network representation
        for i in range(1, 12):  # Increased to 11 nodes
            self.G.add_node(i)
        
        # Enhanced edges with QoS metrics
        edges = [
            (1, 2, {'base_cost': 5, 'congestion': 0.2, 'latency': 20, 'bandwidth': 1000, 'packet_loss': 0.1, 'jitter': 2}),
            (1, 3, {'base_cost': 3, 'congestion': 0.1, 'latency': 15, 'bandwidth': 800, 'packet_loss': 0.2, 'jitter': 3}),
            (2, 4, {'base_cost': 2, 'congestion': 0.5, 'latency': 25, 'bandwidth': 600, 'packet_loss': 0.3, 'jitter': 4}),
            (3, 4, {'base_cost': 4, 'congestion': 0.3, 'latency': 30, 'bandwidth': 750, 'packet_loss': 0.15, 'jitter': 3}),
            (4, 5, {'base_cost': 6, 'congestion': 0.2, 'latency': 18, 'bandwidth': 900, 'packet_loss': 0.1, 'jitter': 2}),
            (5, 6, {'base_cost': 1, 'congestion': 0.7, 'latency': 35, 'bandwidth': 500, 'packet_loss': 0.4, 'jitter': 5}),
            (3, 6, {'base_cost': 8, 'congestion': 0.1, 'latency': 22, 'bandwidth': 850, 'packet_loss': 0.2, 'jitter': 3}),
            (6, 7, {'base_cost': 3, 'congestion': 0.4, 'latency': 28, 'bandwidth': 700, 'packet_loss': 0.25, 'jitter': 4}),
            (4, 7, {'base_cost': 7, 'congestion': 0.3, 'latency': 24, 'bandwidth': 800, 'packet_loss': 0.15, 'jitter': 3}),
            # New edges for enhanced connectivity
            (7, 8, {'base_cost': 4, 'congestion': 0.2, 'latency': 20, 'bandwidth': 900, 'packet_loss': 0.1, 'jitter': 2}),
            (8, 9, {'base_cost': 5, 'congestion': 0.3, 'latency': 25, 'bandwidth': 750, 'packet_loss': 0.2, 'jitter': 3}),
            (9, 10, {'base_cost': 3, 'congestion': 0.4, 'latency': 30, 'bandwidth': 600, 'packet_loss': 0.3, 'jitter': 4}),
            (10, 11, {'base_cost': 6, 'congestion': 0.1, 'latency': 15, 'bandwidth': 1000, 'packet_loss': 0.1, 'jitter': 2}),
            (8, 11, {'base_cost': 7, 'congestion': 0.2, 'latency': 22, 'bandwidth': 850, 'packet_loss': 0.15, 'jitter': 3}),
        ]
        
        for u, v, data in edges:
            self.G.add_edge(u, v, **data)
            self.adjust_edge_cost(u, v)
        
        logging.info("Enhanced network graph built successfully with QoS metrics.")

    def adjust_edge_cost(self, u, v):
        """
        Adjust edge cost based on QoS metrics and congestion
        """
        edge_data = self.G[u][v]
        
        # Calculate QoS score
        qos_score = (
            self.qos_weights['latency'] * (1 / edge_data['latency']) +
            self.qos_weights['bandwidth'] * (edge_data['bandwidth'] / 1000) +
            self.qos_weights['packet_loss'] * (1 - edge_data['packet_loss']) +
            self.qos_weights['jitter'] * (1 / edge_data['jitter'])
        )
        
        # Get congestion penalty
        congestion = edge_data['congestion']
        learned_penalty = self.penalty_model.predict([[congestion]])[0]
        fixed_penalty = 3 if congestion > 0.5 else 0
        
        # Calculate final cost
        edge_data['final_cost'] = (
            edge_data['base_cost'] * 
            (1 + learned_penalty + fixed_penalty) * 
            (1 / qos_score)
        )

    def adjust_costs(self):
        """
        Adjust all edge costs in the network
        """
        if self.G is None:
            raise ValueError("Graph not built. Run build_network_graph() first.")
        
        for u, v in self.G.edges():
            self.adjust_edge_cost(u, v)
        
        logging.info("Edge costs adjusted using QoS metrics and neuro-symbolic integration.")

    def compute_optimal_path(self, source: int, target: int, algorithm: str = 'dijkstra', k: int = 3):
        """
        Compute optimal path using specified algorithm
        """
        if self.G is None:
            raise ValueError("Graph not built. Run build_network_graph() first.")
        
        self.adjust_costs()
        
        try:
            paths = []
            costs = []
            
            if algorithm == 'dijkstra':
                path = nx.dijkstra_path(self.G, source, target, weight='final_cost')
                cost = nx.dijkstra_path_length(self.G, source, target, weight='final_cost')
                paths.append(path)
                costs.append(cost)
            
            elif algorithm == 'astar':
                path = nx.astar_path(self.G, source, target, weight='final_cost')
                cost = sum(self.G[path[i]][path[i+1]]['final_cost'] for i in range(len(path)-1))
                paths.append(path)
                costs.append(cost)
            
            elif algorithm == 'k_shortest':
                # Get k shortest paths using Yen's algorithm
                paths = list(nx.shortest_simple_paths(self.G, source, target, weight='final_cost'))[:k]
                costs = [sum(self.G[path[i]][path[i+1]]['final_cost'] for i in range(len(path)-1)) for path in paths]
            
            # Store in route history
            timestamp = datetime.now()
            history_entry = {
                'timestamp': timestamp,
                'source': source,
                'target': target,
                'algorithm': algorithm,
                'paths': paths,
                'costs': costs
            }
            self.route_history.append(history_entry)
            
            # Return enhanced routing results
            return {
                'paths': paths,
                'costs': costs,
                'algorithm': algorithm,
                'qos_metrics': self._get_path_qos_metrics(paths[0]),  # QoS metrics for the best path
                'visualization_data': self._get_visualization_data(paths[0])
            }
            
        except Exception as e:
            logging.error(f"Error computing optimal path: {e}")
            raise

    def _get_path_qos_metrics(self, path):
        """
        Calculate aggregate QoS metrics for a path
        """
        total_latency = 0
        min_bandwidth = float('inf')
        total_packet_loss = 0
        total_jitter = 0
        
        for i in range(len(path)-1):
            edge = self.G[path[i]][path[i+1]]
            total_latency += edge['latency']
            min_bandwidth = min(min_bandwidth, edge['bandwidth'])
            total_packet_loss = 1 - ((1 - total_packet_loss) * (1 - edge['packet_loss']))
            total_jitter += edge['jitter']
        
        return {
            'end_to_end_latency': total_latency,
            'available_bandwidth': min_bandwidth,
            'packet_loss_probability': total_packet_loss,
            'total_jitter': total_jitter
        }

    def _get_visualization_data(self, path):
        """
        Prepare data for path visualization
        """
        nodes = []
        edges = []
        
        # Add all nodes
        for node in self.G.nodes():
            nodes.append({
                'id': node,
                'in_path': node in path
            })
        
        # Add all edges
        for u, v, data in self.G.edges(data=True):
            edges.append({
                'source': u,
                'target': v,
                'metrics': {
                    'latency': data['latency'],
                    'bandwidth': data['bandwidth'],
                    'packet_loss': data['packet_loss'],
                    'jitter': data['jitter'],
                    'congestion': data['congestion']
                },
                'in_path': (u in path and v in path and 
                           path[path.index(u) if u in path else 0:].index(v) == 1)
            })
        
        return {
            'nodes': nodes,
            'edges': edges
        }

    def get_route_history(self):
        """
        Get the routing history
        """
        return self.route_history

    def update_edge_congestion(self, u: int, v: int, new_congestion: float):
        """
        Update congestion value for an edge
        """
        if self.G is None or not self.G.has_edge(u, v):
            raise ValueError(f"Edge ({u}, {v}) not found in graph")
        
        if not 0 <= new_congestion <= 1:
            raise ValueError("Congestion value must be between 0 and 1")
        
        self.G[u][v]['congestion'] = new_congestion
        self.adjust_edge_cost(u, v)
        logging.info(f"Updated congestion for edge ({u}, {v}) to {new_congestion}")

# =============================================================================
# Pydantic Models for Request Validation
# =============================================================================
class TelemetryData(BaseModel):
    data: List[float]

    class Config:
        json_schema_extra = {
            "example": {
                "data": [0.1, 0.2, 0.3, 0.4, 0.5]
            }
        }

    @validator('data')
    def validate_data(cls, v):
        if not v:
            raise ValueError('Data array cannot be empty')
        if len(v) < 2:
            raise ValueError('Need at least 2 data points for analysis')
        if not all(isinstance(x, (int, float)) for x in v):
            raise ValueError('All values must be numbers')
        return v

class ConfigData(BaseModel):
    SIMILARITY_THRESH: float

class HealthResponse(BaseModel):
    status: str
    SIMILARITY_THRESH: float
    uptime: str

class ManualMetricsInput(BaseModel):
    latency: float
    bandwidth: float
    packet_loss: float
    jitter: float

    class Config:
        json_schema_extra = {
            "example": {
                "latency": 50.0,
                "bandwidth": 100.0,
                "packet_loss": 0.5,
                "jitter": 5.0
            }
        }

    @validator('latency')
    def validate_latency(cls, v):
        if v < 0 or v > 1000:
            raise ValueError('Latency must be between 0 and 1000 ms')
        return v

    @validator('bandwidth')
    def validate_bandwidth(cls, v):
        if v < 0:
            raise ValueError('Bandwidth must be non-negative')
        return v

    @validator('packet_loss')
    def validate_packet_loss(cls, v):
        if v < 0 or v > 100:
            raise ValueError('Packet loss must be between 0 and 100 percent')
        return v

    @validator('jitter')
    def validate_jitter(cls, v):
        if v < 0 or v > 100:
            raise ValueError('Jitter must be between 0 and 100 ms')
        return v

class RoutingRequest(BaseModel):
    source: int
    target: int
    algorithm: str = 'dijkstra'  # default to dijkstra
    k_paths: int = 3  # for k-shortest paths algorithm

    class Config:
        json_schema_extra = {
            "example": {
                "source": 1,
                "target": 11,
                "algorithm": "dijkstra",
                "k_paths": 3
            }
        }

    @validator('algorithm')
    def validate_algorithm(cls, v):
        valid_algorithms = ['dijkstra', 'astar', 'k_shortest']
        if v not in valid_algorithms:
            raise ValueError(f'Algorithm must be one of {valid_algorithms}')
        return v

    @validator('k_paths')
    def validate_k_paths(cls, v):
        if v < 1 or v > 10:
            raise ValueError('k_paths must be between 1 and 10')
        return v

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

router = APIRouter(
    prefix="/api/resilience",
    tags=["Network Resilience"]
)

# --- Endpoint: Predictive Maintenance ---
@router.post("/predictive-maintenance")
async def predictive_maintenance(telemetry: TelemetryData):
    """
    Perform predictive maintenance analysis on telemetry data.
    
    Args:
        telemetry (TelemetryData): Object containing array of float values
        
    Returns:
        dict: Results containing anomaly detection and similarity scores
    """
    try:
        # Validate data range
        if not all(-1000 <= x <= 1000 for x in telemetry.data):
            raise HTTPException(
                status_code=400,
                detail="Data values must be between -1000 and 1000"
            )

        # Apply moving average filter to smooth the data
        telemetry_array = np.array(telemetry.data)
        smoothed_data = moving_average_filter(telemetry_array)
        
        # Build prototype and detect anomalies
        pm.build_prototype(smoothed_data)
        results = []
        
        for val in smoothed_data:
            similarity, anomaly = pm.detect(float(val))
            results.append({
                "value": float(val),
                "similarity": float(similarity),
                "anomaly": bool(anomaly),
                "threshold": float(CONFIG["SIMILARITY_THRESH"])
            })
        
        return {
            "results": results,
            "total_anomalies": sum(1 for r in results if r["anomaly"]),
            "average_similarity": float(np.mean([r["similarity"] for r in results])),
            "data_points_analyzed": len(results)
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logging.error(f"Predictive maintenance error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# --- Endpoint: Routing ---
@router.post("/routing")
async def routing(
    request: RoutingRequest,
    current_user: dict = Depends(oauth2.get_current_user)
):
    """
    Enhanced routing endpoint supporting multiple algorithms and QoS metrics
    """
    try:
        # Validate node existence
        if not (1 <= request.source <= 11 and 1 <= request.target <= 11):
            raise HTTPException(
                status_code=400,
                detail="Source and target nodes must be between 1 and 11"
            )

        # Initialize network if needed
        nsr.build_network_graph()

        # Compute optimal path with specified algorithm
        result = nsr.compute_optimal_path(
            request.source,
            request.target,
            algorithm=request.algorithm,
            k=request.k_paths
        )

        return {
            "routing_result": result,
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "user_id": current_user.id,
                "algorithm_used": request.algorithm
            }
        }

    except Exception as e:
        logging.error(f"Routing error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Routing error: {str(e)}"
        )

@router.get("/routing/history")
async def get_routing_history(
    current_user: dict = Depends(oauth2.get_current_user)
):
    """
    Get routing history for analysis
    """
    try:
        history = nsr.get_route_history()
        return {
            "history": history,
            "total_routes": len(history)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching routing history: {str(e)}"
        )

@router.post("/routing/update-congestion")
async def update_congestion(
    u: int,
    v: int,
    congestion: float,
    current_user: dict = Depends(oauth2.get_current_user)
):
    """
    Update congestion values for network edges
    """
    try:
        nsr.update_edge_congestion(u, v, congestion)
        return {"message": f"Successfully updated congestion for edge ({u}, {v})"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating congestion: {str(e)}"
        )

# --- Endpoint: Health Check ---
@router.get("/health-check")
async def health_check():
    """Get system health status"""
    try:
        return {
            "status": "Healthy",
            "SIMILARITY_THRESH": CONFIG["SIMILARITY_THRESH"],
            "uptime": "99.9%"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Endpoint: Get/Update Configuration ---
@router.get("/config")
async def get_config():
    """Get current system configuration"""
    try:
        return CONFIG
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/config")
async def update_config(new_config: ConfigData):
    """Update system configuration"""
    try:
        CONFIG["SIMILARITY_THRESH"] = new_config.SIMILARITY_THRESH
        pm.similarity_thresh = new_config.SIMILARITY_THRESH
        return {"message": "Configuration updated successfully", "config": CONFIG}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Endpoint: Retrain Penalty Model ---
@router.post("/retrain-penalty")
async def retrain_penalty(current_user: dict = Depends(oauth2.get_current_user)):
    """
    Retrains the penalty model used for adjusting routing costs.
    """
    try:
        nsr._train_penalty_model()
        return {"message": "Penalty model retrained successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Endpoint: Add Manual Metrics ---
@router.post("/manual-metrics")
async def add_manual_metrics(metrics: ManualMetricsInput, current_user: dict = Depends(oauth2.get_current_user)):
    """
    Add manual network metrics.
    
    Args:
        metrics (ManualMetricsInput): Object containing network metrics values
        
    Returns:
        dict: Confirmation of metrics addition
    """
    try:
        return {
            "status": "success",
            "message": "Manual metrics added successfully",
            "metrics": {
                "latency": metrics.latency,
                "bandwidth": metrics.bandwidth,
                "packet_loss": metrics.packet_loss,
                "jitter": metrics.jitter,
                "timestamp": datetime.now().isoformat()
            }
        }
    except Exception as e:
        logging.error(f"Error adding manual metrics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
