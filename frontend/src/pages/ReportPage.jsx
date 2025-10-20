import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import './ReportPage.css'; // We'll create this

// --- Red Icon for this map ---
const redIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
  className: 'leaflet-red-icon'
});

// --- Click Handler for this map ---
function ReportMapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// --- The New Page Component ---
function ReportPage() {
  const [formState, setFormState] = useState({
    issueType: '',
    description: '',
    latitude: null,
    longitude: null,
  });
  const [markerPosition, setMarkerPosition] = useState(null);
  const navigate = useNavigate(); // Hook to redirect after submit

  const handleMapClick = (lat, lng) => {
    setMarkerPosition([lat, lng]);
    setFormState(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/feedback/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formState),
    })
    .then(res => res.json())
    .then(data => {
      alert('Feedback submitted successfully!');
      navigate('/'); // Redirect back to the home page
    })
    .catch(error => {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback.');
    });
  };

  return (
    <div className="report-page">
      <header className="report-header">
        <h1>Report an Issue</h1>
        <Link to="/" className="back-button">&larr; Back to Main Map</Link>
      </header>

      <div className="report-content">
        {/* --- Form --- */}
        <form className="report-form-container" onSubmit={handleSubmit}>
          <h3>Submit a Report</h3>
          <p>Click on the map to set the location of the issue.</p>
          
          <label htmlFor="issueType">Issue Type:</label>
          <select id="issueType" name="issueType" value={formState.issueType} onChange={handleChange} required>
            <option value="">Select an issue...</option>
            <option value="waste-management">Waste Management</option>
            <option value="damaged-infra">Damaged Infrastructure</option>
            <option value="pollution">Pollution Report</option>
            <option value="other">Other</option>
          </select>

          <label htmlFor="description">Description:</label>
          <textarea id="description" name="description" rows="6" placeholder="Describe the issue here..." value={formState.description} onChange={handleChange} required></textarea>

          <label>Location:</label>
          <input type="text" value={formState.latitude ? `${formState.latitude.toFixed(4)}, ${formState.longitude.toFixed(4)}` : "Click on the map..."} readOnly disabled />
            
          <button type="submit" disabled={!formState.latitude}>
            Submit Report
          </button>
        </form>

        {/* --- Map --- */}
        <div className="report-map-container">
          <LeafletMap center={[31.3260, 75.5762]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ReportMapClickHandler onMapClick={handleMapClick} />
            {markerPosition && (
              <Marker position={markerPosition} icon={redIcon}>
                <Popup>Issue Location</Popup>
              </Marker>
            )}
          </LeafletMap>
        </div>
      </div>
    </div>
  );
}

export default ReportPage;