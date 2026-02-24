"""Compare plain Dijkstra vs biased Dijkstra on new WCI-proportional graph."""
import json, math, networkx as nx

def geo_dist(lat1, lng1, lat2, lng2):
    return math.sqrt((lat2-lat1)**2 + (lng2-lng1)**2)

with open('backend/data/district_graph.json') as f:
    adj = json.load(f)
with open('backend/data/district_centroids.json') as f:
    centroids = json.load(f)

G = nx.DiGraph()
for node, neighbors in adj.items():
    for e in neighbors:
        G.add_edge(node, e['target'], weight=e['weight'], distance=e['distance'])

source, dest = 'DAMAN', 'DELHI'

# 1. Plain Dijkstra (no bias)
path_dijk = nx.shortest_path(G, source=source, target=dest, weight='weight')
total_w = sum(G[path_dijk[i]][path_dijk[i+1]]['weight'] for i in range(len(path_dijk)-1))
print(f"Plain Dijkstra: {len(path_dijk)} hops, total weight={total_w:.4f}")
for n in path_dijk:
    c = centroids.get(n, {})
    print(f"  {n:<25} lat={c.get('lat',0):.1f} lng={c.get('lng',0):.1f}")

# 2. What's the weight of the western Gujarat corridor path?
western = ['DAMAN','VALSAD','NAVSARI','SURAT','BHARUCH','VADODARA',
           'ANAND','AHMEDABAD','GANDHINAGAR','MEHSANA','BANASKANTHA',
           'JALORE','PALI','AJMER','TONK','SAWAI MADHOPUR','DAUSA','ALWAR','REWARI','DELHI']
# Check which steps exist in graph
print(f"\nWestern corridor path weight check:")
western_cost = 0
for i in range(len(western)-1):
    u, v = western[i], western[i+1]
    if G.has_edge(u, v):
        w = G[u][v]['weight']
        western_cost += w
        print(f"  {u} -> {v}: w={w:.4f}")
    else:
        print(f"  {u} -> {v}: EDGE NOT IN GRAPH")
print(f"Total western corridor cost: {western_cost:.4f}")
print(f"Plain Dijkstra cost:         {total_w:.4f}")
print(f"Ratio: {western_cost/total_w:.2f}x more expensive")
