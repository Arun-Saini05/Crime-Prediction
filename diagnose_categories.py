"""
Diagnose the real issues:
1. Category distribution in final data
2. What categories the Rajasthan/Gujarat corridor actually has
3. Why Dijkstra can't find a direct route
"""
import json

with open('backend/data/crime_data_v2.geojson') as f:
    geo = json.load(f)

lookup = {}
for feat in geo['features']:
    p = feat['properties']
    name = p.get('district_std') or p.get('district')
    if name:
        lookup[name.upper().strip()] = p

# Category distribution
cats = {}
for name, p in lookup.items():
    c = p.get('Hotspot_Category', 'No Data')
    cats[c] = cats.get(c,0) + 1
print("Category distribution:", cats)
print(f"Total with data: {sum(cats.values())}")

# Check Rajasthan direct corridor districts
corridor = ['VALSAD','SURAT','BHARUCH','VADODARA','ANAND','GANDHINAGAR',
            'PATAN','BANASKANTHA','JALORE','PALI','AJMER','TONK',
            'SAWAI MADHOPUR','DAUSA','ALWAR','REWARI','GURUGRAM','DELHI',
            # Alternative through Dhar/Ratlam
            'NASHIK','DHULE','NANDURBAR','DHAR','BARWANI','RATLAM','MANDSAUR',
            'JHALAWAR','KOTA','BUNDI']
print("\nKey corridor districts:")
for d in corridor:
    p = lookup.get(d, {})
    cat = p.get('Hotspot_Category', 'NOT FOUND')
    wci = p.get('WCI', 0)
    print(f"  {d:<25} [{cat}] WCI={wci:.1f}")
