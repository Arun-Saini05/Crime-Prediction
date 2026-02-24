"""Verify directional-biased Dijkstra produces a geographically sensible path."""
import json
import math
import networkx as nx

def geo_dist(lat1, lng1, lat2, lng2):
    return math.sqrt((lat2 - lat1) ** 2 + (lng2 - lng1) ** 2)

# Load data
with open('backend/data/district_graph.json') as f:
    adj_data = json.load(f)
with open('backend/data/district_centroids.json') as f:
    centroids = json.load(f)

G = nx.DiGraph()
for node, neighbors in adj_data.items():
    G.add_node(node)
    for edge in neighbors:
        G.add_edge(node, edge['target'], weight=edge['weight'], distance=edge['distance'])

BACKWARD_BIAS = 5.0
source, destination = 'DAMAN', 'DELHI'

dest_lat = centroids[destination]['lat']
dest_lng = centroids[destination]['lng']

# Build query graph
query_graph = nx.DiGraph()
for u, v, data in G.edges(data=True):
    cu = centroids.get(u)
    cv = centroids.get(v)
    if cu and cv:
        d_after  = geo_dist(cv['lat'], cv['lng'], dest_lat, dest_lng)
        d_before = geo_dist(cu['lat'], cu['lng'], dest_lat, dest_lng)
        backward = max(0.0, d_after - d_before)
        modified = data['weight'] + backward * BACKWARD_BIAS
    else:
        modified = data['weight']
    query_graph.add_edge(u, v, weight=modified)

# Run Dijkstra
path = nx.shortest_path(query_graph, source=source, target=destination, weight='weight')

# Load crime data for risk labels
with open('backend/data/crime_data_v2.geojson') as f:
    geo = json.load(f)
lookup = {}
for feat in geo['features']:
    p = feat['properties']
    name = p.get('district_std') or p.get('district')
    if name:
        lookup[name.upper().strip()] = p

print(f"\n{'='*60}")
print(f"Directional-Biased Dijkstra: {source} -> {destination}")
print(f"{'='*60}")
print(f"Path length: {len(path)} hops\n")
for name in path:
    cat = lookup.get(name, {}).get('Hotspot_Category', '?')
    c = centroids.get(name, {})
    print(f"  {name:<25} [{cat:<8}]  lat={c.get('lat',0):.1f}  lng={c.get('lng',0):.1f}")

print(f"\nComparison:")
old_path = ['DAMAN','VALSAD','NASHIK','AURANGABAD','PALAMU','LATEHAR','GUMLA','JASHPUR',
            'SURGUJA','SURAJPUR','KORIYA','BILASPUR','RUPNAGAR','FATEHGARH SAHIB',
            'PATIALA','KURUKSHETRA','KARNAL','PANIPAT','SONIPAT','DELHI']
print(f"  Old path: {len(old_path)} hops (went through Chhattisgarh/Punjab detour)")
print(f"  New path: {len(path)} hops")
print(f"  Route goes through: {' → '.join(path)}")
