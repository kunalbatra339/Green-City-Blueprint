import React from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet'; 
import './MapContainer.css';

// --- ICONS (Unchanged) ---
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
const greenIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
  className: 'leaflet-green-icon' 
});
const defaultIcon = new L.Icon.Default();

// --- Map Click Handler (Unchanged) ---
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

  const getLayerProps = (point) => {
    let icon = defaultIcon;
    let content = <strong>Data Not Available</strong>;

    if (activeLayer === 'AQI') {
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
      // FIX: Use the REAL traffic_density for icon logic
      icon = point.traffic_density > 0.75 ? trafficIcon : defaultIcon; 
      content = (
        <>
          <strong>Traffic Density: {point.traffic_density}</strong><br />
          {/* You can still use a simple description based on the real value */}
          Current Flow: {point.traffic_density > 0.75 ? 'High Congestion 🔴' : 'Moderate Flow 🟢'}
        </>
      );
    } else if (activeLayer === 'Green Cover') {
      // FIX: Use the REAL green_cover_index for icon logic
      icon = point.green_cover_index > 0.5 ? greenCoverIcon : defaultIcon; 
      content = (
        <>
          <strong>Green Cover Index: {point.green_cover_index}</strong><br />
          Density: {point.green_cover_index > 0.5 ? 'High Density 🌳' : 'Low Density 🍂'}
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
              icon={icon}
              eventHandlers={{
                click: () => {
                  onMarkerClick(point.location_id);
                },
              }}
            >
              <Popup>
                <strong>{point.name}</strong><br />
                {content}
              </Popup>
            </Marker>
          );
        })}
      </LeafletMap>
    </div>
  );
}

export default MapContainer;