from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import math
import networkx as nx
from pydantic import BaseModel

app = FastAPI(title="SafeTravels India API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

district_lookup = {}
district_centroids = {}
display_to_node = {}   # display_name -> node_id (for user input matching)
crime_data = None
district_graph = None

def geo_dist(lat1, lng1, lat2, lng2):
    """Straight-line degree distance (cheap, sufficient for weight bias)."""
    return math.sqrt((lat2 - lat1) ** 2 + (lng2 - lng1) ** 2)

def load_data():
    global crime_data, district_graph, district_lookup, district_centroids, display_to_node

    # --- GeoJSON ---
    geojson_path = os.path.join(DATA_DIR, "crime_data_v2.geojson")
    if os.path.exists(geojson_path):
        with open(geojson_path, 'r') as f:
            crime_data = json.load(f)
        valid_features = []
        for feature in crime_data['features']:
            props = feature['properties']
            d_name = props.get('district_std') or props.get('district')
            if d_name:
                district_lookup[d_name.upper().strip()] = props
                valid_features.append(feature)
        crime_data['features'] = valid_features
        print(f"Loaded crime data. Valid features: {len(valid_features)}")
    else:
        print(f"Warning: {geojson_path} not found.")

    # --- Graph ---
    graph_path = os.path.join(DATA_DIR, "district_graph.json")
    if os.path.exists(graph_path):
        with open(graph_path, 'r') as f:
            adj_data = json.load(f)
        district_graph = nx.DiGraph()
        for node, neighbors in adj_data.items():
            district_graph.add_node(node)
            for edge in neighbors:
                district_graph.add_edge(
                    node, edge['target'],
                    weight=edge['weight'],
                    distance=edge['distance'],
                    category=edge.get('category', 'No Data')
                )
        print(f"Loaded district graph: {district_graph.number_of_nodes()} nodes, {district_graph.number_of_edges()} edges.")
    else:
        print(f"Warning: {graph_path} not found.")

    # --- Centroids ---
    centroids_path = os.path.join(DATA_DIR, "district_centroids.json")
    if os.path.exists(centroids_path):
        with open(centroids_path, 'r') as f:
            district_centroids = json.load(f)

        # Build display_name -> node_id reverse mapping
        for node_id, info in district_centroids.items():
            disp = info.get('display_name', node_id).upper().strip()
            if disp not in display_to_node:
                display_to_node[disp] = node_id
            if node_id == disp:
                display_to_node[disp] = node_id
        print(f"Loaded centroids: {len(district_centroids)} districts, {len(display_to_node)} display mappings.")
    else:
        print(f"Warning: {centroids_path} not found.")

load_data()

# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"message": "Welcome to SafeTravels India API V3"}

@app.get("/api/districts")
@app.get("/api/districts_v2")
@app.get("/api/districts_v3")
def get_districts():
    if crime_data:
        return crime_data
    return {"error": "Data not loaded"}

class RouteRequest(BaseModel):
    source: str
    destination: str

@app.post("/api/safest-route")
def get_safest_route(request: RouteRequest):
    if not district_graph:
        return {"error": "Graph data not loaded"}

    source = request.source.upper().strip()
    destination = request.destination.upper().strip()

    print(f"Route request: '{source}' -> '{destination}'")

    # Resolve user input to internal node_id
    def resolve_node(user_input):
        s = user_input.upper().strip()
        if s in district_graph:
            return s
        return display_to_node.get(s)

    source_node = resolve_node(source)
    dest_node   = resolve_node(destination)

    if not source_node:
        return {"error": f"Source district '{source}' not found."}
    if not dest_node:
        return {"error": f"Destination district '{destination}' not found."}

    try:
        # Directional-Biased Dijkstra:
        # Build a query-time modified weight graph that penalises edges moving
        # AWAY from the destination (backward penalty). This is still standard
        # Dijkstra -- just run on smarter precomputed weights so the algorithm
        # does not route geographically backwards through central/east India.
        #
        #   modified_weight = base_weight + max(0, dist_after - dist_before) * BIAS
        #
        # BIAS = 5.0  ->  going 1 degree backward adds 5x extra cost.

        BACKWARD_BIAS = 5.0

        use_bias = bool(
            district_centroids
            and source_node in district_centroids
            and dest_node in district_centroids
        )

        if use_bias:
            dest_c = district_centroids[dest_node]
            dest_lat, dest_lng = dest_c['lat'], dest_c['lng']

            query_graph = nx.DiGraph()
            for u, v, data in district_graph.edges(data=True):
                base_weight = data['weight']
                cu = district_centroids.get(u)
                cv = district_centroids.get(v)

                if cu and cv:
                    d_before = geo_dist(cu['lat'], cu['lng'], dest_lat, dest_lng)
                    d_after  = geo_dist(cv['lat'], cv['lng'], dest_lat, dest_lng)
                    backward = max(0.0, d_after - d_before)
                    modified = base_weight + backward * BACKWARD_BIAS
                else:
                    modified = base_weight

                query_graph.add_edge(u, v, weight=modified)

            path_names = nx.shortest_path(query_graph, source=source_node,
                                           target=dest_node, weight='weight')
            algo_used = "Dijkstra+DirectionalBias"
        else:
            path_names = nx.shortest_path(district_graph, source=source_node,
                                           target=dest_node, weight='weight')
            algo_used = "Dijkstra"

        print(f"[{algo_used}] {len(path_names)} hops: {' -> '.join(path_names)}")

        # Enrich with crime details - use display_name for UI, node_id for lookup
        detailed_path = []
        for node_id in path_names:
            c_info = district_centroids.get(node_id, {})
            display_name = c_info.get('display_name', node_id)
            details = district_lookup.get(display_name, district_lookup.get(node_id, {}))
            detailed_path.append({
                "name": display_name,
                "risk": details.get('Hotspot_Category', 'Unknown'),
                "wci":  details.get('WCI', 0)
            })

        return {"path": detailed_path}

    except nx.NetworkXNoPath:
        return {"error": "No path found between these districts."}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
