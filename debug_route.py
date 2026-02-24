import json
import networkx as nx

with open('backend/data/district_graph.json') as f:
    adj_data = json.load(f)

G = nx.DiGraph()
for node, neighbors in adj_data.items():
    G.add_node(node)
    for edge in neighbors:
        G.add_edge(node, edge['target'], weight=edge['weight'], distance=edge['distance'], category=edge['category'])

print(f"Total nodes: {G.number_of_nodes()}")
print(f"Total edges: {G.number_of_edges()}")

# DAMAN neighbors
print("\nDAMAN neighbors:")
for u, v, d in G.edges('DAMAN', data=True):
    print(f"  -> {v} | weight={d['weight']:.3f} | dist={d['distance']:.4f} | cat={d['category']}")

# Find the actual Dijkstra path from DAMAN to DELHI
try:
    path = nx.shortest_path(G, source='DAMAN', target='DELHI', weight='weight')
    print(f"\nDijkstra path (DAMAN->DELHI): {len(path)} hops")
    for name in path:
        cat = G.nodes[name].get('category', 'N/A')
        print(f"  {name}")
except Exception as e:
    print(f"Path error: {e}")

# Now find shortest geographic path (ignore weights)
try:
    path_unweighted = nx.shortest_path(G, source='DAMAN', target='DELHI')
    print(f"\nUnweighted path (DAMAN->DELHI): {len(path_unweighted)} hops")
    for name in path_unweighted:
        cat = G.edges.get((name, path_unweighted[path_unweighted.index(name)+1] if path_unweighted.index(name)+1 < len(path_unweighted) else name), {}).get('category', 'N/A')
        print(f"  {name}")
except Exception as e:
    print(f"Unweighted path error: {e}")

# Check Gujarat/Rajasthan corridor categories
print("\nKey corridor districts (from adj_data raw):")
for dist in ['SURAT', 'BHARUCH', 'VADODARA', 'ANAND', 'GANDHINAGAR', 'MEHSANA', 'BANASKANTHA', 'DUNGARPUR', 'UDAIPUR', 'AJMER', 'ALWAR', 'GURUGRAM']:
    edges = adj_data.get(dist, [])
    cats = [e['category'] for e in edges]
    cat_summary = {c: cats.count(c) for c in set(cats)}
    print(f"  {dist}: {cat_summary}")
