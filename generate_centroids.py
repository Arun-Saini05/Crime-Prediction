"""
Quick script to extract district centroids from existing GeoJSON 
and save to district_centroids.json for A* / directional Dijkstra use.
Does NOT require re-running the full LSTM pipeline.
"""
import json
import geopandas as gpd
import os

DATA_DIR = 'backend/data'
geojson_path = os.path.join(DATA_DIR, 'crime_data_v2.geojson')
output_path = os.path.join(DATA_DIR, 'district_centroids.json')

print("Loading GeoJSON...")
gdf = gpd.read_file(geojson_path)

centroids = {}
for _, row in gdf.iterrows():
    name = row.get('district_std') or row.get('district')
    if name and row.geometry and not row.geometry.is_empty:
        try:
            centroid = row.geometry.centroid
            centroids[str(name).upper().strip()] = {
                'lat': centroid.y,
                'lng': centroid.x
            }
        except Exception:
            pass

with open(output_path, 'w') as f:
    json.dump(centroids, f, indent=2)

print(f"Exported {len(centroids)} district centroids to {output_path}")

# Verify a few key districts
for d in ['DAMAN', 'DELHI', 'JAIPUR', 'MUMBAI', 'ALWAR']:
    if d in centroids:
        c = centroids[d]
        print(f"  {d}: lat={c['lat']:.3f}, lng={c['lng']:.3f}")
    else:
        print(f"  {d}: NOT FOUND")
