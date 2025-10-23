import React from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import './MapContainer.css';

// --- ICONS (These are all correct and unchanged) ---
const trafficIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
const greenCoverIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
const greenIcon = new L.Icon({ // This is for the simulation
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
  className: 'leaflet-green-icon' // Class for the simulation color filter
});
const defaultIcon = new L.Icon.Default(); // Default blue icon


// --- Map Click Handler Component (Unchanged from your working version) ---
function MapClickHandler({ onMapClick, isSimMode }) {
  useMapEvents({
    click(e) {
      if (isSimMode) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// --- Main Map Component ---
// UPDATED: Receives pointsData prop
function MapContainer({ pointsData, onMarkerClick, onMapClick, isSimMode, activeLayer }) {
  const position = [31.3260, 75.5762];

  // This is the only function that has been changed.
  const getLayerProps = (point) => {
    let icon = defaultIcon;
    let content = <strong>Data Not Available</strong>;

    if (activeLayer === 'AQI') {
      // Logic for AQI layer (Icon changes on simulation)
      icon = point.simulated ? greenIcon : defaultIcon;
      content = (
        <>
          {point.simulated ? (
            <>
              Original AQI: <del>{point.original_aqi}</del><br />
              <strong>Simulated AQI: {point.aqi}</strong>
            </>
          ) : (
            <>
              <strong>Air Quality (AQI): {point.aqi}</strong>
            </>
          )}
        </>
      );
    } else if (activeLayer === 'Traffic') {
      // Your working ICON logic using AQI as placeholder, UNTOUCHED.
      icon = point.aqi > 150 ? trafficIcon : defaultIcon;
      // FIX: Your working CONTENT logic, now displaying the traffic_density number.
      content = (
        <>
          <strong>Traffic Density: {point.traffic_density}</strong><br />
          Current Flow: {point.aqi > 150 ? 'High Congestion 🔴' : 'Moderate Flow 🟢'}
        </>
      );
    } else if (activeLayer === 'Green Cover') {
      // Your working ICON logic using AQI as placeholder, UNTOUCHED.
      icon = point.aqi < 100 ? greenCoverIcon : defaultIcon;
      // FIX: Your working CONTENT logic, now displaying the green_cover_index number.
      content = (
        <>
          <strong>Green Cover Index: {point.green_cover_index}</strong><br />
          Density: {point.aqi < 100 ? 'High Density 🌳' : 'Low Density 🍂'}
        </>
      );
    }

    return { icon, content };
  };

  return (
    <div className={`map-container ${isSimMode ? 'sim-mode-active' : ''}`}>
      <LeafletMap center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapClickHandler onMapClick={onMapClick} isSimMode={isSimMode} />

        {/* UPDATED: Map over pointsData */}
        {pointsData.map(point => {
          const { icon, content } = getLayerProps(point);

          return (
            <Marker
              key={point.location_id}
              position={[point.latitude, point.longitude]}
              icon={icon} // Uses the icon determined above
              eventHandlers={{ // Your working event handler for charts
                click: () => {
                  onMarkerClick(point.location_id);
                },
              }}
            >
              <Popup>
                <strong>{point.name}</strong><br />
                {content} {/* Uses the content determined above */}
              </Popup>
            </Marker>
          );
        })}
      </LeafletMap>
    </div>
  );
}

export default MapContainer;
