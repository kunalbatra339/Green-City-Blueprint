import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import ChartComponent from '../ChartComponent/ChartComponent';

function Dashboard({ selectedLocationId, isSimMode, onSimModeChange, activeLayer, onLayerChange }) { 
  
  const handleToggle = () => {
    onSimModeChange(!isSimMode);
  };

  const layers = ['AQI', 'Traffic', 'Green Cover'];

  return (
    <aside className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Project: Green City Planner</p>
      </div>
      
      {/* --- Data Layers Selector --- */}
      <div className="tool-section">
        <h3>Data Layers 🌎</h3>
        <p>View environmental data on the map.</p>
        <div className="layer-selector">
          {layers.map(layer => (
            <button
              key={layer}
              className={`layer-button ${activeLayer === layer ? 'active' : ''}`}
              onClick={() => onLayerChange(layer)}
            >
              {layer}
            </button>
          ))}
        </div>
      </div>

      {/* --- Simulation Tool --- */}
      <div className="tool-section">
        <h3>Smart Planning Tool</h3>
        <p>Toggle ON to enter simulation mode. Click anywhere on the map to place a new park and see its impact.</p>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={isSimMode} 
            onChange={handleToggle} 
          />
          <span className="slider"></span>
        </label>
        <span className={`sim-mode-status ${isSimMode ? 'on' : ''}`}>
          Simulation Mode: <strong>{isSimMode ? 'ON' : 'OFF'}</strong>
        </span>
      </div>

      {/* --- Citizen Feedback Section --- */}
      <div className="tool-section">
        <h3>Citizen Feedback</h3>
        <p>See a problem? Go to our reporting page to submit an issue.</p>
        <Link to="/report" className="report-button">
          Go to Report Page
        </Link>
      </div>

      {/* --- NEW: Admin Area Section --- */}
      <div className="tool-section">
        <h3>Admin Area ⚙️</h3>
        <p>View submitted reports and system status.</p>
        <Link to="/admin" className="admin-button">
          Go to Admin Dashboard
        </Link>
      </div>

      {/* --- Chart Component --- */}
      <ChartComponent locationId={selectedLocationId} />
    </aside>
  );
}

export default Dashboard;