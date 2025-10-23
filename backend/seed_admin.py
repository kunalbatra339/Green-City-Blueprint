from pymongo import MongoClient
import hashlib
import os

# --- Connection Setup ---
client = MongoClient('mongodb+srv://kbatra339:kunal8ballpool@cluster0.wgcc4j6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client['green_city_db']
users_collection = db['users']

# --- Admin Credentials from your plan ---
ADMIN_USERNAME = "admin@123"
ADMIN_PASSWORD = "admin445671"

# --- Hashing Function ---
def hash_password(password):
    # Generate a random salt
    salt = os.urandom(16)
    # Hash the password with the salt using SHA-256
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    # Store the salt and hash together
    return salt + pwd_hash

# --- Seeding Logic ---
# Check if the admin user already exists
if users_collection.find_one({'username': ADMIN_USERNAME}):
    print(f"Admin user '{ADMIN_USERNAME}' already exists. Skipping.")
else:
    # Hash the admin password
    hashed_password = hash_password(ADMIN_PASSWORD)
    
    # Insert the admin user with the 'admin' role
    users_collection.insert_one({
        'username': ADMIN_USERNAME, 
        'password': hashed_password,
        'role': 'admin' # The special admin role
    })
    print(f"Admin user '{ADMIN_USERNAME}' created successfully.")