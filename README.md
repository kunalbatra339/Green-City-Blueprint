🏙️ Green City Blueprint 🌳

Welcome to Green City Blueprint! This is a full-stack web application designed for Smart Urban Planning, leveraging data to help build greener, more sustainable cities. The platform visualizes environmental data, simulates the impact of new green projects using a predictive AI model, and allows for citizen engagement through a feedback portal.

This project was built for the OneEarth International Hackathon 2025.

✨ Core Features

🗺️ Interactive Data Map: Visualize multiple layers of city data, including Air Quality (AQI), Traffic Density, and Green Cover.

🤖 AI-Powered Simulation: A "Smart Planning Tool" that uses a Scikit-learn model to predict the environmental impact of adding a new park in real-time.

📊 Dynamic Charts: View 7-day historical trends for any data point with a single click to identify patterns.

🗣️ Citizen Feedback Portal: A dedicated page for users to report geolocated issues like pollution or damaged infrastructure directly to the system.

🔐 Role-Based Admin Dashboard: A secure dashboard for administrators to view all submitted reports, with special permissions to manage and resolve them.

🔑 Custom Authentication: A secure, custom-built login and registration system with three distinct user roles (Admin, Teacher, Civilian).

🛠️ Tech Stack

Frontend: ⚛️ React (with Vite)

Backend: 🐍 Flask (Python)

Database: 🍃 MongoDB

Mapping: 🗺️ Leaflet & React-Leaflet

AI/ML: 🧠 Scikit-learn, Pandas, NumPy

🚀 Getting Started: How to Run This Project

This guide provides a step-by-step walkthrough to get the entire application running on your local machine.

✅ Prerequisites

Before you begin, make sure you have the following software installed and running:

Node.js: v18.0 or higher.

Python: v3.10 or higher.

MongoDB Community Server: The database must be installed and running in the background on your computer.

MongoDB Compass (Recommended): This graphical tool is highly recommended for easily viewing the data you create. You can download it for free from the MongoDB website.

A Note on the MongoDB Connection String

Our Python code is configured to connect to a standard, local MongoDB instance. The connection string used in the code is:

mongodb://localhost:27017/


If your local MongoDB is running on the default port (27017), you do not need to make any changes to the code.

⚙️ Step 1: Backend Setup (Flask Server)

First, let's get the brain of our application running.

Navigate to the Backend Directory:
Open your terminal and change into the backend folder.

cd backend


Create and Activate a Virtual Environment:
This creates an isolated space for our Python packages.

On macOS/Linux:

python3 -m venv venv
source venv/bin/activate


On Windows:

python -m venv venv
.\venv\Scripts\activate


Your terminal prompt will now start with (venv).

Install Python Dependencies:
This command reads requirements.txt and installs all necessary libraries.

pip install -r requirements.txt


Create Your Secret Key:
Authentication requires a secret key.

Create a new file named .env inside the backend folder.

Generate a strong key by opening a Python shell (python) and running:

import secrets
secrets.token_hex(32)


Copy the long string it outputs.

In your .env file, paste the key like this (with no quotes):

SECRET_KEY=your_generated_key_here


Set Up the Database & AI Model:
Run these scripts one by one to populate your database with sample data, create the admin user, and train the AI model.

python seed_admin.py
python seed_database.py
python train_model.py


Run the Backend Server:
Finally, start the server!

python app.py


The server will be running on ${import.meta.env.VITE_API_BASE_URL}. Keep this terminal open.

⚛️ Step 2: Frontend Setup (React App)

Now, let's set up the user interface. Open a new, separate terminal window for these commands.

Navigate to the Frontend Directory:
From the project's root folder, run:

cd frontend


Install Node Dependencies:
This command reads package.json to install all necessary libraries into a node_modules folder.

npm install


Run the Frontend Development Server:

npm run dev


Your React application will now be running. The terminal will provide a local URL to open in your browser, usually http://localhost:5173.

Congratulations! 🎉 The Green City Blueprint application is now fully running on your machine.

📖 How to Use the Application

Explore Data: Use the "Data Layers" buttons on the dashboard to switch between AQI, Traffic, and Green Cover visualizations.

Simulate a Project: Toggle "Simulation Mode" ON. Click anywhere on the map to see the AI-predicted impact of a new park. Click the toggle OFF to reset.

Report an Issue: Click the "Go to Report Page" button. On the new page, click the map to place a pin, fill out the form, and submit it.

Access the Admin Dashboard:

Navigate to the /login page by clicking the "Go to Admin Dashboard" button.

Log in with the hardcoded admin credentials:

Username: admin@123

Password: admin445671

On the dashboard, you can view all submitted reports. As an admin, you can click on a "pending" report to mark it as "resolved".
