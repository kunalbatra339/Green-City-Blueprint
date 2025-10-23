import React, { useState, useEffect } from 'react';
import './HomePage.css';
import MapContainer from '../components/MapContainer/MapContainer';
import Dashboard from '../components/Dashboard/Dashboard';

// UPDATED: The new single source for map point data
const API_BASE_URL = 'https://green-city-blueprint.onrender.com';

function HomePage() {
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [isSimMode, setIsSimMode] = useState(false);
  // RENAMED for clarity: aqiData -> pointsData
  const [pointsData, setPointsData] = useState([]);
  const [activeLayer, setActiveLayer] = useState('AQI'); 

  // This useEffect now fetches ALL data at once when the component loads.
  useEffect(() => {
    const DATA_URL = `${API_BASE_URL}/api/data/points`;
    
    fetch(DATA_URL)
      .then(response => response.json())
      .then(data => setPointsData(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []); // Runs only once

  const handleMarkerClick = (locationId) => {
    setSelectedLocationId(locationId); 
  };

 const handleSimModeChange = (newMode) => {
    setIsSimMode(newMode);
    if (!newMode) {
      // UPDATED: Use production URL
      const DATA_URL = `${API_BASE_URL}/api/data/points`;
      fetch(DATA_URL) 
        .then(res => res.json())
        .then(data => setPointsData(data));
    }
  };
  
  const handleMapClick = (lat, lng) => {
    if (isSimMode) {
      console.log("Sim Mode Clicked! Sending request..."); 
      
      // UPDATED: Use production URL
      const SIMULATION_URL = `${API_BASE_URL}/api/simulate/park`;
      
      console.log("Making request to:", SIMULATION_URL);
      
      fetch(SIMULATION_URL, { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      })
      .then(res => {
          console.log("Response Status:", res.status);
          if (!res.ok) {
              return res.text().then(text => {
                  console.error("Error response text:", text);
                  throw new Error(`HTTP error! status: ${res.status}, response: ${text}`);
              });
          }
          return res.json();
      })
      .then(simulatedData => {
          console.log("Received simulated data:", simulatedData);
          const simulatedPoints = simulatedData.filter(point => point.simulated);
          console.log(`Found ${simulatedPoints.length} simulated points`);
          setPointsData(simulatedData);
      })
      .catch(error => {
          console.error('Error during simulation:', error);
      });
    }
  };
  
  // This handler only needs to change the active layer state.
  const handleLayerChange = (layer) => {
    setActiveLayer(layer);
  };

  return (
    <main className="home-container">
      <Dashboard 
        selectedLocationId={selectedLocationId}
        isSimMode={isSimMode}
        onSimModeChange={handleSimModeChange}
        activeLayer={activeLayer}
        onLayerChange={handleLayerChange}
      />
      <MapContainer 
        // Pass the renamed state down
        pointsData={pointsData}
        onMarkerClick={handleMarkerClick}
        onMapClick={handleMapClick}
        isSimMode={isSimMode}
        activeLayer={activeLayer}
      />
    </main>
  );
}

export default HomePage;