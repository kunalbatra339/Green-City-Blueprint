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

Follow these instructions carefully to set up and run the project on your local machine.

Prerequisites

Make sure you have the following installed on your system:

Node.js (v18 or higher)

Python (v3.10 or higher)

MongoDB Community Server (Make sure it is running in the background)

An API testing tool like Postman or Insomnia (Optional, but recommended for testing backend routes).

Step 1: Clone the Repository

First, clone the project from GitHub to your local machine:

git clone <your-repository-url>
cd green-city-blueprint # Or your project folder name


Step 2: Backend Setup (Flask) ⚙️

We'll start by setting up the Python server.

Navigate to the Backend Directory:

cd backend


Create and Activate a Virtual Environment:
This keeps your Python packages isolated and clean.

On macOS/Linux:

python3 -m venv venv
source venv/bin/activate


On Windows:

python -m venv venv
.\venv\Scripts\activate


You will see (venv) appear at the start of your terminal prompt.

Install Python Dependencies:
Use the requirements.txt file to install all the necessary packages for the backend.

pip install -r requirements.txt


Create the Secret Key (Crucial for Security):
The application needs a secret key for authentication. You must create a .env file for this.

Create a new file named .env inside the backend folder.

To generate a strong, random key, open a Python shell by typing python in your terminal and run these two lines:

import secrets
secrets.token_hex(32)


Copy the long string it outputs.

In your new .env file, paste the key like this (without any quotes):

SECRET_KEY=your_generated_key_here


Set Up the Database and Admin User:
Run the following scripts one by one. They will populate your local MongoDB with sample data and create the hardcoded admin account.

python seed_admin.py
python seed_database.py


Train the AI Model:
Run the training script. This will generate the aqi_simulation_model.joblib file that the simulation tool uses.

python train_model.py


Run the Backend Server:
You're ready to start the server!

python app.py


The server will now be running on http://localhost:5000. Keep this terminal window open.

Step 3: Frontend Setup (React) ⚛️

Now, let's set up the user interface. Open a new, separate terminal window for these commands.

Navigate to the Frontend Directory:
From the project's root folder, run:

cd frontend


Install Node Dependencies:
This command reads the package.json and package-lock.json files and downloads all the necessary libraries into a node_modules folder.

npm install


Run the Frontend Development Server:

npm run dev


Your React application will now be running. The terminal will give you a local URL to open in your browser, usually http://localhost:5173.

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
