from pymongo import MongoClient
from datetime import datetime, timedelta

# --- Connection Setup ---
client = MongoClient('mongodb://localhost:27017/')
db = client['green_city_db']
points_collection = db['air_quality_points']
history_collection = db['air_quality_history']

# --- Sample Point Data (UPDATED with Traffic and Green Cover Indexes) ---
air_quality_data = [
    {
        "location_id": "JAL001", "name": "Model Town",
        "latitude": 31.3115, "longitude": 75.5760,
        "aqi": 155,
        "traffic_density": 0.85, # Scale of 0.0 to 1.0 (85% congestion)
        "green_cover_index": 0.30 # Scale of 0.0 to 1.0 (30% cover)
    },
    {
        "location_id": "JAL002", "name": "Rama Mandi",
        "latitude": 31.2850, "longitude": 75.6100,
        "aqi": 180,
        "traffic_density": 0.95, # Very high traffic
        "green_cover_index": 0.15 # Low cover
    },
    {
        "location_id": "JAL003", "name": "Urban Estate Phase 2",
        "latitude": 31.3390, "longitude": 75.5450,
        "aqi": 120,
        "traffic_density": 0.30, # Low traffic
        "green_cover_index": 0.43 # High cover
    },
    {
        "location_id": "JAL004", "name": "Jalandhar Cantt",
        "latitude": 31.2800, "longitude": 75.5900,
        "aqi": 95,
        "traffic_density": 0.55, # Moderate traffic
        "green_cover_index": 0.55 # Moderate cover
    }
]

# --- Sample Historical Data ---
history_data = []
location_ids = ["JAL001", "JAL002", "JAL003", "JAL004"]
base_aqi = {"JAL001": 150, "JAL002": 180, "JAL003": 120, "JAL004": 90}
today = datetime.now()

for loc_id in location_ids:
    for i in range(7): # 7 days of data
        history_data.append({
            "location_id": loc_id,
            "timestamp": today - timedelta(days=i),
            "aqi": base_aqi[loc_id] + (i * 5 - 15)
        })

# --- Seeding Logic ---
print("Seeding air_quality_points...")
points_collection.delete_many({})
points_collection.insert_many(air_quality_data)

print("Seeding air_quality_history...")
history_collection.delete_many({})
history_collection.insert_many(history_data)

print("Database seeded successfully with points and history!")