"""End-to-end final verification of the route fix."""
import json, math, networkx as nx

def geo_dist(lat1, lng1, lat2, lng2):
    return math.sqrt((lat2-lat1)**2 + (lng2-lng1)**2)

with open('backend/data/district_graph.json') as f:
    adj = json.load(f)
with open('backend/data/district_centroids.json') as f:
    centroids = json.load(f)

G = nx.DiGraph()
for node, nbrs in adj.items():
    for e in nbrs:
        G.add_edge(node, e['target'], weight=e['weight'])

display_to_node = {}
for nid, info in centroids.items():
    disp = info.get('display_name', nid).upper().strip()
    if disp not in display_to_node:
        display_to_node[disp] = nid
    if nid == disp:
        display_to_node[disp] = nid

def resolve(s):
    s = s.upper().strip()
    return s if s in G else display_to_node.get(s)

source_node = resolve('DAMAN')
dest_node = resolve('DELHI')
print(f"source_node={source_node}, dest_node={dest_node}")

dest_lat = centroids[dest_node]['lat']
dest_lng = centroids[dest_node]['lng']
BIAS = 5.0

qG = nx.DiGraph()
for u, v, data in G.edges(data=True):
    cu = centroids.get(u)
    cv = centroids.get(v)
    if cu and cv:
        d_after = geo_dist(cv['lat'], cv['lng'], dest_lat, dest_lng)
        d_before = geo_dist(cu['lat'], cu['lng'], dest_lat, dest_lng)
        bw = max(0.0, d_after - d_before)
        qG.add_edge(u, v, weight=data['weight'] + bw * BIAS)
    else:
        qG.add_edge(u, v, weight=data['weight'])

path = nx.shortest_path(qG, source=source_node, target=dest_node, weight='weight')
print(f"\nFinal path DAMAN -> DELHI ({len(path)} hops):")
for nid in path:
    c = centroids.get(nid, {})
    disp = c.get('display_name', nid)
    lat = c.get('lat', 0)
    lng = c.get('lng', 0)
    print(f"  {disp:<25}  lat={lat:.1f}  lng={lng:.1f}")

# Also test Mumbai -> Delhi
source2 = resolve('MUMBAI')
dest2 = resolve('DELHI')
if source2 and dest2:
    path2 = nx.shortest_path(qG, source=source2, target=dest2, weight='weight')
    print(f"\nMUMBAI -> DELHI ({len(path2)} hops):")
    for nid in path2:
        c = centroids.get(nid, {})
        disp = c.get('display_name', nid)
        print(f"  {disp}")
