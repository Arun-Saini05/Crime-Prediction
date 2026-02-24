"""Test multiple BIAS values to find the best one for DAMAN->DELHI route."""
import json, math, networkx as nx

def geo_dist(lat1, lng1, lat2, lng2):
    return math.sqrt((lat2-lat1)**2 + (lng2-lng1)**2)

with open('backend/data/district_graph.json') as f:
    adj_data = json.load(f)
with open('backend/data/district_centroids.json') as f:
    centroids = json.load(f)
with open('backend/data/crime_data_v2.geojson') as f:
    geo = json.load(f)

lookup = {}
for feat in geo['features']:
    p = feat['properties']
    name = p.get('district_std') or p.get('district')
    if name:
        lookup[name.upper().strip()] = p

G = nx.DiGraph()
for node, neighbors in adj_data.items():
    G.add_node(node)
    for edge in neighbors:
        G.add_edge(node, edge['target'], weight=edge['weight'], distance=edge['distance'])

source, destination = 'DAMAN', 'DELHI'
dest_lat = centroids[destination]['lat']
dest_lng = centroids[destination]['lng']

for BIAS in [5, 8, 10, 15, 20]:
    query_graph = nx.DiGraph()
    for u, v, data in G.edges(data=True):
        cu = centroids.get(u)
        cv = centroids.get(v)
        if cu and cv:
            d_after  = geo_dist(cv['lat'], cv['lng'], dest_lat, dest_lng)
            d_before = geo_dist(cu['lat'], cu['lng'], dest_lat, dest_lng)
            backward = max(0.0, d_after - d_before)
            modified = data['weight'] + backward * BIAS
        else:
            modified = data['weight']
        query_graph.add_edge(u, v, weight=modified)
    
    path = nx.shortest_path(query_graph, source=source, target=destination, weight='weight')
    cats = [lookup.get(n, {}).get('Hotspot_Category', '?')[0] for n in path]
    print(f"BIAS={BIAS:>2}: {len(path)} hops | categories: {' '.join(cats)}")
    print(f"        {' -> '.join(path)}")
    print()
