# --- Base Imports (from your working file) ---
from flask import Flask, jsonify, request 
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime, timedelta, timezone
from math import radians, sin, cos, sqrt, atan2

# --- NEW Imports for Custom Auth ---
import jwt
from functools import wraps
import hashlib
import os

# --- NEW Imports for ML ---
import joblib
import numpy as np

# --- App & DB Setup ---
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
CORS(app, 
    supports_credentials=True,
    origins=[
        "https://green-city-blueprint.vercel.app",
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://127.0.0.1:5173"
    ],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"]
)
MONGO_URI = os.environ.get('MONGO_URI') 
client = MongoClient(MONGO_URI)
db = client['green_city_db']
points_collection = db['air_quality_points']
history_collection = db['air_quality_history'] 
feedback_collection = db['user_feedback']
users_collection = db['users']

# --- Load the AI Model 🤖 ---
print("Loading AI simulation model...")
ml_model = joblib.load('aqi_simulation_model.joblib')
print("AI Model loaded successfully.")


# --- Custom Hashing & Auth Decorator ---
def hash_password(password):
    salt = os.urandom(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt + pwd_hash

def check_password(stored_password_hash, provided_password):
    salt = stored_password_hash[:16]
    stored_hash = stored_password_hash[16:]
    pwd_hash = hashlib.pbkdf2_hmac('sha256', provided_password.encode('utf-8'), salt, 100000)
    return pwd_hash == stored_hash

def token_required(required_role=None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = None
            if 'Authorization' in request.headers:
                token = request.headers['Authorization'].split(" ")[1]
            if not token:
                return jsonify({'message': 'Token is missing!'}), 401
            try:
                data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
                current_user = users_collection.find_one({'_id': ObjectId(data['sub'])})
                if not current_user:
                    return jsonify({'message': 'User not found!'}), 401
                if required_role and current_user.get('role') != required_role:
                    return jsonify({'message': 'Insufficient permissions!'}), 403
            except:
                return jsonify({'message': 'Token is invalid!'}), 401
            return f(current_user, *args, **kwargs)
        return decorated_function
    return decorator

# --- Auth Routes ---
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username, password, role = data.get('username'), data.get('password'), data.get('role')
    if not all([username, password, role]):
        return jsonify({'message': 'Username, password, and role are required'}), 400
    if role not in ['teacher', 'civilian']:
        return jsonify({'message': 'Invalid role. Must be teacher or civilian.'}), 400
    if users_collection.find_one({'username': username}):
        return jsonify({'message': 'Username already exists'}), 409
    hashed_password = hash_password(password)
    users_collection.insert_one({'username': username, 'password': hashed_password, 'role': role})
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username, password = data.get('username'), data.get('password')
    user = users_collection.find_one({'username': username})
    if user and check_password(user['password'], password):
        token = jwt.encode({
            'sub': str(user['_id']),
            'role': user.get('role'),
            'iat': datetime.now(timezone.utc),
            'exp': datetime.now(timezone.utc) + timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({'token': token})
    return jsonify({'message': 'Invalid username or password'}), 401


# --- Helper Functions (Unchanged) ---
def serialize_doc(doc):
    for key, value in doc.items():
        if isinstance(value, ObjectId): doc[key] = str(value)
        if isinstance(value, datetime): doc[key] = value.isoformat()
    return doc

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    lat1_rad, lon1_rad = radians(lat1), radians(lon1)
    lat2_rad, lon2_rad = radians(lat2), radians(lon2)
    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad
    a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    distance = R * c
    return distance


# --- API Routes ---
@app.route('/api/data/points', methods=['GET'])
def get_points_data():
    try:
        data = list(points_collection.find({}))
        serialized_data = [serialize_doc(doc) for doc in data]
        return jsonify(serialized_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/data/air_quality/<location_id>', methods=['GET'])
def get_historical_data(location_id):
    try:
        data = list(history_collection.find({"location_id": location_id}).sort("timestamp", 1))
        serialized_data = [serialize_doc(doc) for doc in data]
        if not data: 
            return jsonify({"error": "No data found for this location"}), 404
        return jsonify(serialized_data), 200
    except Exception as e: 
        return jsonify({"error": str(e)}), 500

# --- UPDATED Simulation Endpoint ---
@app.route('/api/simulate/park', methods=['POST'])
def simulate_park():
    try:
        data = request.get_json()
        click_lat = data.get('latitude')
        click_lon = data.get('longitude')
        
        if not click_lat or not click_lon:
            return jsonify({"error": "Missing coordinates"}), 400
        
        # This is our "sanity check" radius.
        impact_radius_km = 5.0

        all_points = list(points_collection.find({}))
        simulated_data = []

        for point in all_points:
            dist = haversine(click_lat, click_lon, point['latitude'], point['longitude'])
            
            original_aqi = point.get('aqi')
            point['original_aqi'] = original_aqi
            point['simulated'] = False
            
            # --- THIS IS THE ONLY CHANGE ---
            # Only use the model if the point is within the reasonable impact radius
            if dist <= impact_radius_km:
                green_cover = point.get('green_cover_index', 0.3) # Use default if not present
                
                # Prepare the input for the model in the correct format
                input_features = np.array([[original_aqi, dist, green_cover]])
                
                # Use the loaded model to predict the new AQI
                predicted_aqi = ml_model.predict(input_features)
                
                # Update the point with the model's prediction
                point['aqi'] = int(predicted_aqi[0])
                point['simulated'] = True
            else:
                # If outside the radius, the AQI does not change at all
                point['aqi'] = original_aqi
                point['simulated'] = False
            
            simulated_data.append(serialize_doc(point))
        
        return jsonify(simulated_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Other Routes (Unchanged) ---
@app.route('/api/feedback/submit', methods=['POST'])
def submit_feedback():
    try:
        data = request.get_json()
        issue_type, description, latitude, longitude = data.get('issueType'), data.get('description'), data.get('latitude'), data.get('longitude')
        if not all([issue_type, description, latitude, longitude]): 
            return jsonify({"error": "Missing required fields"}), 400
        feedback_doc = {
            "issue_type": issue_type,
            "description": description,
            "location": {"type": "Point", "coordinates": [longitude, latitude]},
            "status": "pending",
            "submitted_at": datetime.now()
        }
        result = feedback_collection.insert_one(feedback_doc)
        return jsonify({"message": "Feedback submitted successfully!", "id": str(result.inserted_id)}), 201
    except Exception as e: 
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/reports', methods=['GET'])
@token_required()
def get_admin_reports(current_user):
    try:
        reports = list(feedback_collection.find({}).sort("submitted_at", -1))
        serialized_reports = [serialize_doc(doc) for doc in reports]
        return jsonify(serialized_reports), 200
    except Exception as e: 
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/reports/<report_id>/resolve', methods=['PUT'])
@token_required(required_role='admin')
def resolve_report(current_user, report_id):
    try:
        result = feedback_collection.update_one({'_id': ObjectId(report_id)}, {'$set': {'status': 'resolved'}})
        if result.matched_count == 0:
            return jsonify({'message': 'Report not found'}), 404
        return jsonify({'message': 'Report status updated to resolved'}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/test', methods=['GET'])
def test_route():
    count = points_collection.count_documents({})
    return jsonify({
        "message": "Hello from the Flask backend!",
        "db_connection_status": "success",
        "documents_in_collection": count
    })

@app.route("/_health")
def health():
    return {"status": "ok"}, 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
