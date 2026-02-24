"""
Fast graph rebuilder — reads crime_data_v2.geojson, uses WCI-proportional weights.
Fixes duplicate district names (e.g. BILASPUR exists in both Chhattisgarh and
Himachal Pradesh) by using STATE_DISTRICT as the unique node key in the graph,
but keeping DISTRICT as the display name.
"""
import json
import geopandas as gpd
import numpy as np
import os
import math
import networkx as nx

DATA_DIR = 'backend/data'
GEOJSON_PATH   = os.path.join(DATA_DIR, 'crime_data_v2.geojson')
GRAPH_PATH     = os.path.join(DATA_DIR, 'district_graph.json')
CENTROIDS_PATH = os.path.join(DATA_DIR, 'district_centroids.json')

PENALTY_SCALE = 3.0  # max multiplier = 1+3 = 4x

print("Loading GeoJSON...")
gdf = gpd.read_file(GEOJSON_PATH)
gdf = gdf[gdf.geometry.is_valid].copy()

# Print available columns
print(f"Columns: {gdf.columns.tolist()}")

# Find the state column
state_col = None
for col in ['state', 'State', 'STATE', 'st_nm', 'statename']:
    if col in gdf.columns:
        state_col = col
        break
print(f"State column: {state_col}")

# Standardize district_std
gdf['district_std'] = gdf['district_std'].fillna(gdf.get('district', '')).str.upper().str.strip()
gdf = gdf[gdf['district_std'].notna() & (gdf['district_std'] != '')]

# Check for duplicate district names
dup_names = gdf['district_std'].value_counts()
dup_names = dup_names[dup_names > 1]
print(f"\nDuplicate district names ({len(dup_names)} duplicates):")
for name, count in dup_names.head(10).items():
    rows = gdf[gdf['district_std'] == name]
    if state_col:
        states = rows[state_col].tolist()
    else:
        centroids_list = [(row.geometry.centroid.y, row.geometry.centroid.x) for _, row in rows.iterrows()]
        states = [f"lat={c[0]:.1f},lng={c[1]:.1f}" for c in centroids_list]
    print(f"  {name}: {count} occurrences -> {states}")

# Create unique node ID: if duplicate exists, append state; else use district_std
if state_col:
    gdf['node_id'] = gdf.apply(
        lambda r: (r['district_std'] + '_' + str(r[state_col]).upper().strip()
                   if r['district_std'] in dup_names.index else r['district_std']),
        axis=1
    )
else:
    # No state column — use centroid to disambiguate (lat rounded to 1dp)
    gdf['node_id'] = gdf.apply(
        lambda r: (r['district_std'] + f"_{r.geometry.centroid.y:.0f}"
                   if r['district_std'] in dup_names.index else r['district_std']),
        axis=1
    )

print(f"\nUnique node IDs: {gdf['node_id'].nunique()} (vs {len(gdf)} rows)")

# WCI stats
all_wci = gdf['WCI'].dropna().values
wci_max = float(np.percentile(all_wci[all_wci > 0], 99)) if len(all_wci[all_wci > 0]) > 0 else 1.0
print(f"WCI 99th pct (ceiling): {wci_max:.4f}")

# Build spatial index on deduplicated GDF
sindex = gdf.sindex
adj_list = {}
centroids = {}

print("Building graph...")
for idx, row in gdf.iterrows():
    node = row['node_id']
    if not node:
        continue

    centroid = row.geometry.centroid
    centroids[node] = {
        'lat': centroid.y,
        'lng': centroid.x,
        'display_name': row['district_std']
    }

    possible_idx = list(sindex.intersection(row.geometry.bounds))
    possible = gdf.iloc[possible_idx]
    neighbors = possible[possible.geometry.touches(row.geometry)]

    edges = []
    for _, nrow in neighbors.iterrows():
        nnode = nrow['node_id']
        if nnode == node or not nnode:
            continue

        dist = row.geometry.centroid.distance(nrow.geometry.centroid)

        # Sanity check: if centroids are >10 degrees apart, skip (can't be real neighbours)
        c_self = (row.geometry.centroid.y, row.geometry.centroid.x)
        c_nb   = (nrow.geometry.centroid.y, nrow.geometry.centroid.x)
        geo_d  = math.sqrt((c_self[0]-c_nb[0])**2 + (c_self[1]-c_nb[1])**2)
        if geo_d > 8.0:
            print(f"  [SKIP] phantom edge: {node} ({c_self[0]:.1f},{c_self[1]:.1f}) -> {nnode} ({c_nb[0]:.1f},{c_nb[1]:.1f}) dist={geo_d:.1f}")
            continue

        risk = nrow['WCI'] if not np.isnan(nrow['WCI']) else 0.0
        cat  = nrow['Hotspot_Category'] if nrow['Hotspot_Category'] else 'No Data'

        normalised_wci     = min(risk / wci_max, 1.0) if wci_max > 0 else 0.0
        penalty_multiplier = 1.0 + normalised_wci * PENALTY_SCALE
        weight = dist * penalty_multiplier

        edges.append({
            'target':       nnode,
            'display_name': nrow['district_std'],
            'weight':       weight,
            'distance':     dist,
            'risk':         risk,
            'category':     cat
        })

    adj_list[node] = edges

print(f"Graph built: {len(adj_list)} nodes")

with open(GRAPH_PATH, 'w') as f:
    json.dump(adj_list, f, indent=2)
print(f"Saved graph -> {GRAPH_PATH}")

with open(CENTROIDS_PATH, 'w') as f:
    json.dump(centroids, f, indent=2)
print(f"Saved centroids -> {CENTROIDS_PATH}")

# ── Verification ──────────────────────────────────────────────────────────────
G = nx.DiGraph()
for node, neighbors in adj_list.items():
    for e in neighbors:
        G.add_edge(node, e['target'], weight=e['weight'])

source, dest = 'DAMAN', 'DELHI'
print(f"\nPath verification ({source} -> {dest}):")

if source in G and dest in G:
    path = nx.shortest_path(G, source=source, target=dest, weight='weight')
    total_w = sum(G[path[i]][path[i+1]]['weight'] for i in range(len(path)-1))
    print(f"  {len(path)} hops, total weight={total_w:.4f}")
    for name in path:
        c = centroids.get(name, {})
        disp = c.get('display_name', name)
        print(f"  {disp:<25} [{name}]  lat={c.get('lat',0):.1f}  lng={c.get('lng',0):.1f}")
else:
    print(f"  Source or dest not in graph! source={source in G}, dest={dest in G}")
    # Try to find the right node IDs
    matches_src = [n for n in G.nodes if 'DAMAN' in n]
    matches_dst = [n for n in G.nodes if 'DELHI' in n]
    print(f"  DAMAN matches: {matches_src}")
    print(f"  DELHI matches: {matches_dst}")
