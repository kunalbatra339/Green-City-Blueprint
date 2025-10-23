from pymongo import MongoClient
from datetime import datetime, timedelta
import random # Import random for more varied data

# --- Connection Setup ---
client = MongoClient('mongodb+srv://kbatra339:kunal8ballpool@cluster0.wgcc4j6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client['green_city_db']
points_collection = db['air_quality_points']
history_collection = db['air_quality_history']

# --- Expanded Sample Point Data for India ---
# Approximately 15 locations per state group, with varied synthetic data
# (Note: Lat/Lon are approximate, values are illustrative)
indian_locations_data = [
    # North India
    {"location_id": "DEL001", "name": "Connaught Place, Delhi", "latitude": 28.6330, "longitude": 77.2190, "aqi": 280, "traffic_density": 0.95, "green_cover_index": 0.10},
    {"location_id": "DEL002", "name": "Lodhi Garden, Delhi", "latitude": 28.5925, "longitude": 77.2190, "aqi": 180, "traffic_density": 0.50, "green_cover_index": 0.75},
    {"location_id": "JAI001", "name": "Hawa Mahal, Jaipur", "latitude": 26.9239, "longitude": 75.8267, "aqi": 190, "traffic_density": 0.70, "green_cover_index": 0.20},
    {"location_id": "LKO001", "name": "Hazratganj, Lucknow", "latitude": 26.8467, "longitude": 80.9462, "aqi": 210, "traffic_density": 0.80, "green_cover_index": 0.25},
    {"location_id": "CHD001", "name": "Sector 17, Chandigarh", "latitude": 30.7333, "longitude": 76.7794, "aqi": 130, "traffic_density": 0.60, "green_cover_index": 0.60},
    {"location_id": "SML001", "name": "The Ridge, Shimla", "latitude": 31.1048, "longitude": 77.1734, "aqi": 80, "traffic_density": 0.40, "green_cover_index": 0.70},
    {"location_id": "ASR001", "name": "Golden Temple, Amritsar", "latitude": 31.6200, "longitude": 74.8765, "aqi": 170, "traffic_density": 0.75, "green_cover_index": 0.15}, # Added Amritsar
    {"location_id": "JAL001", "name": "Model Town, Jalandhar", "latitude": 31.3115, "longitude": 75.5760, "aqi": 155, "traffic_density": 0.85, "green_cover_index": 0.30}, # Kept Jalandhar
    {"location_id": "JAM001", "name": "Lal Chowk, Jammu", "latitude": 32.7266, "longitude": 74.8570, "aqi": 140, "traffic_density": 0.65, "green_cover_index": 0.35},
    {"location_id": "SRI001", "name": "Dal Lake, Srinagar", "latitude": 34.0838, "longitude": 74.7973, "aqi": 90, "traffic_density": 0.30, "green_cover_index": 0.65},

    # West India
    {"location_id": "MUM001", "name": "Marine Drive, Mumbai", "latitude": 18.9432, "longitude": 72.8235, "aqi": 220, "traffic_density": 0.90, "green_cover_index": 0.15},
    {"location_id": "MUM002", "name": "Sanjay Gandhi NP, Mumbai", "latitude": 19.2160, "longitude": 72.9180, "aqi": 110, "traffic_density": 0.20, "green_cover_index": 0.85},
    {"location_id": "PNQ001", "name": "Koregaon Park, Pune", "latitude": 18.5367, "longitude": 73.8930, "aqi": 140, "traffic_density": 0.70, "green_cover_index": 0.40},
    {"location_id": "AMD001", "name": "Sabarmati Riverfront, Ahmedabad", "latitude": 23.0225, "longitude": 72.5714, "aqi": 250, "traffic_density": 0.85, "green_cover_index": 0.30},
    {"location_id": "GOI001", "name": "Calangute Beach, Goa", "latitude": 15.5484, "longitude": 73.7600, "aqi": 70, "traffic_density": 0.50, "green_cover_index": 0.50},
    {"location_id": "SUR001", "name": "Dumas Road, Surat", "latitude": 21.1702, "longitude": 72.8311, "aqi": 190, "traffic_density": 0.75, "green_cover_index": 0.25},
    {"location_id": "NAG001", "name": "Sitabuldi, Nagpur", "latitude": 21.1458, "longitude": 79.0882, "aqi": 160, "traffic_density": 0.70, "green_cover_index": 0.30},

    # East India
    {"location_id": "KOL001", "name": "Park Street, Kolkata", "latitude": 22.5516, "longitude": 88.3559, "aqi": 260, "traffic_density": 0.92, "green_cover_index": 0.12},
    {"location_id": "KOL002", "name": "Maidan, Kolkata", "latitude": 22.5500, "longitude": 88.3500, "aqi": 150, "traffic_density": 0.40, "green_cover_index": 0.80},
    {"location_id": "PAT001", "name": "Gandhi Maidan, Patna", "latitude": 25.6131, "longitude": 85.1432, "aqi": 290, "traffic_density": 0.88, "green_cover_index": 0.20},
    {"location_id": "BBI001", "name": "KIIT Square, Bhubaneswar", "latitude": 20.3541, "longitude": 85.8157, "aqi": 120, "traffic_density": 0.60, "green_cover_index": 0.55},
    {"location_id": "RAN001", "name": "Main Road, Ranchi", "latitude": 23.3441, "longitude": 85.3096, "aqi": 140, "traffic_density": 0.70, "green_cover_index": 0.45},
    {"location_id": "GUW001", "name": "Fancy Bazaar, Guwahati", "latitude": 26.1724, "longitude": 91.7404, "aqi": 160, "traffic_density": 0.85, "green_cover_index": 0.20},
    {"location_id": "IMP001", "name": "Kangla Fort, Imphal", "latitude": 24.8080, "longitude": 93.9440, "aqi": 100, "traffic_density": 0.40, "green_cover_index": 0.60},

    # South India
    {"location_id": "BLR001", "name": "MG Road, Bengaluru", "latitude": 12.9745, "longitude": 77.6087, "aqi": 150, "traffic_density": 0.90, "green_cover_index": 0.25},
    {"location_id": "BLR002", "name": "Cubbon Park, Bengaluru", "latitude": 12.9757, "longitude": 77.5929, "aqi": 90, "traffic_density": 0.30, "green_cover_index": 0.80},
    {"location_id": "CHE001", "name": "Marina Beach, Chennai", "latitude": 13.0475, "longitude": 80.2825, "aqi": 170, "traffic_density": 0.75, "green_cover_index": 0.15},
    {"location_id": "HYD001", "name": "Charminar, Hyderabad", "latitude": 17.3616, "longitude": 78.4747, "aqi": 190, "traffic_density": 0.85, "green_cover_index": 0.10},
    {"location_id": "KOC001", "name": "Fort Kochi", "latitude": 9.9650, "longitude": 76.2415, "aqi": 85, "traffic_density": 0.45, "green_cover_index": 0.50},
    {"location_id": "TRV001", "name": "Technopark, Trivandrum", "latitude": 8.5566, "longitude": 76.8837, "aqi": 75, "traffic_density": 0.50, "green_cover_index": 0.65},
    {"location_id": "VZG001", "name": "RK Beach, Visakhapatnam", "latitude": 17.7126, "longitude": 83.3245, "aqi": 130, "traffic_density": 0.60, "green_cover_index": 0.20},

    # Central India
    {"location_id": "BHO001", "name": "Upper Lake, Bhopal", "latitude": 23.2386, "longitude": 77.3610, "aqi": 110, "traffic_density": 0.40, "green_cover_index": 0.65},
    {"location_id": "IND001", "name": "Rajwada Palace, Indore", "latitude": 22.7196, "longitude": 75.8577, "aqi": 160, "traffic_density": 0.75, "green_cover_index": 0.20},
    {"location_id": "RAI001", "name": "Marine Drive, Raipur", "latitude": 21.2514, "longitude": 81.6296, "aqi": 180, "traffic_density": 0.65, "green_cover_index": 0.30},
    # Add more as needed...
]

# Extract location IDs and base AQIs for history generation
location_ids = [loc["location_id"] for loc in indian_locations_data]
base_aqi = {loc["location_id"]: loc["aqi"] for loc in indian_locations_data}
today = datetime.now()

history_data = []
for loc_id in location_ids:
    current_base_aqi = base_aqi.get(loc_id, 100) # Default to 100 if ID somehow missing
    for i in range(7): # 7 days of data
        # Add more variability to historical data
        aqi_variation = random.randint(-20, 20) + (i * random.choice([-2, 0, 3]))
        historical_aqi = max(10, current_base_aqi + aqi_variation) # Ensure AQI doesn't go below 10

        history_data.append({
            "location_id": loc_id,
            "timestamp": today - timedelta(days=i),
            "aqi": historical_aqi
        })

# --- Seeding Logic ---
print(f"Seeding {len(indian_locations_data)} locations into air_quality_points...")
points_collection.delete_many({})
points_collection.insert_many(indian_locations_data)

print(f"Seeding {len(history_data)} historical records into air_quality_history...")
history_collection.delete_many({})
history_collection.insert_many(history_data)

print("Database seeded successfully with expanded Indian locations and history!")
