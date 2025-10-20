import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import joblib

# --- 1. Generate Synthetic Data 🧠 ---
print("Generating synthetic training data...")

# MODIFIED: Increased the number of samples from 1000 to 3000.
num_samples = 3000
data = {
    # Feature 1: The original AQI before the park (randomly between 50 and 250)
    'original_aqi': np.random.randint(50, 250, num_samples),
    # Feature 2: Distance from the new park's center (randomly between 0.1 and 5 km)
    'distance_km': np.random.uniform(0.1, 5.0, num_samples),
    # Feature 3: The existing green cover index of the area (randomly 10% to 60%)
    'green_cover_index': np.random.uniform(0.1, 0.6, num_samples)
}
df = pd.DataFrame(data)

# This is our "secret formula" to create the target variable (the new AQI).
# A closer distance, higher original AQI, and lower existing green cover lead to a bigger reduction.
# We add some random "noise" to make it more realistic for a model to learn.
noise = np.random.normal(0, 5, num_samples) # Adds some randomness
aqi_reduction = (30 / (df['distance_km'] + 0.5)) - (df['green_cover_index'] * 10)
df['new_aqi'] = df['original_aqi'] - aqi_reduction + noise
df['new_aqi'] = df['new_aqi'].astype(int)

# Ensure new_aqi doesn't go below a realistic minimum (e.g., 10)
df['new_aqi'] = df['new_aqi'].clip(lower=10)

print("Sample of generated data:")
print(df.head())


# --- 2. Train the Machine Learning Model 🤖 ---
print("\nTraining the Linear Regression model...")

# Define our features (X) and the target we want to predict (y)
features = ['original_aqi', 'distance_km', 'green_cover_index']
target = 'new_aqi'

X = df[features]
y = df[target]

# Create and train the model
model = LinearRegression()
model.fit(X, y)

print("Model training complete.")
# Let's test it with an example:
# A location with an original AQI of 150, 1km away, with 20% green cover.
sample_prediction = model.predict([[150, 1.0, 0.20]])
print(f"Test prediction: New AQI will be around {int(sample_prediction[0])}")


# --- 3. Save the Trained Model to a File 💾 ---
print("\nSaving the model to 'aqi_simulation_model.joblib'...")
joblib.dump(model, 'aqi_simulation_model.joblib')
print("Model saved successfully!")