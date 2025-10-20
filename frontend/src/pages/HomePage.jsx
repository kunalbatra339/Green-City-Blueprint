import React, { useState, useEffect } from 'react';
import './HomePage.css';
import MapContainer from '../components/MapContainer/MapContainer';
import Dashboard from '../components/Dashboard/Dashboard';

// UPDATED: The new single source for map point data
const API_URL = 'http://localhost:5000/api/data/points';

function HomePage() {
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [isSimMode, setIsSimMode] = useState(false);
  // RENAMED for clarity: aqiData -> pointsData
  const [pointsData, setPointsData] = useState([]);
  const [activeLayer, setActiveLayer] = useState('AQI'); 

  // This useEffect now fetches ALL data at once when the component loads.
  useEffect(() => {
    fetch(API_URL)
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
      // On toggle OFF, refetch the original, clean data
      fetch(API_URL) 
        .then(res => res.json())
        .then(data => setPointsData(data));
    }
  };
  
  const handleMapClick = (lat, lng) => {
    if (isSimMode) {
      fetch('http://localhost:5000/api/simulate/park', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      })
      .then(res => res.json())
      .then(simulatedData => {
        // The simulation returns the full data set, so we just update our state
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