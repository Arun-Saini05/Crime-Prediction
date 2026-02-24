"""Check the actual graph connectivity from DAMAN northward through Gujarat."""
import json

with open('backend/data/district_graph.json') as f:
    adj = json.load(f)
with open('backend/data/district_centroids.json') as f:
    centroids = json.load(f)

def show_neighbors(dist, depth=2, visited=None):
    if visited is None:
        visited = set()
    if depth < 0 or dist in visited:
        return
    visited.add(dist)
    c = centroids.get(dist, {})
    neighbors = adj.get(dist, [])
    # Show sorted by lng (westmost first)
    neighbors_sorted = sorted(neighbors, key=lambda e: centroids.get(e['target'], {}).get('lng', 99))
    print(f"{'  ' * (2-depth)}{dist} (lat={c.get('lat',0):.1f}, lng={c.get('lng',0):.1f}) -> {len(neighbors)} neighbors:")
    for e in neighbors_sorted[:8]:
        nc = centroids.get(e['target'], {})
        print(f"{'  ' * (2-depth+1)}{e['target']:<25} cat={e['category']:<8} w={e['weight']:.3f} lat={nc.get('lat',0):.1f} lng={nc.get('lng',0):.1f}")

print("=== DAMAN connectivity ===")
show_neighbors('DAMAN', depth=0)

print("\n=== VALSAD connectivity ===")
show_neighbors('VALSAD', depth=0)

print("\n=== SURAT connectivity ===")
show_neighbors('SURAT', depth=0)

print("\n=== Is SURAT reachable from VALSAD? ===")
valsad_targets = [e['target'] for e in adj.get('VALSAD', [])]
print(f"VALSAD neighbors: {valsad_targets}")

print("\n=== Western Gujarat chain check ===")
for d in ['VALSAD','SURAT','BHARUCH','VADODARA','ANAND','GANDHINAGAR','MEHSANA','PATAN','BANASKANTHA']:
    c = centroids.get(d, {})
    neighbors = [e['target'] for e in adj.get(d, [])]
    print(f"  {d:<15} lat={c.get('lat',0):.1f} lng={c.get('lng',0):.1f} -> {neighbors}")
