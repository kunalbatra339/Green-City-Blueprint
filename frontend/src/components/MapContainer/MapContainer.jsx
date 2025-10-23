import React from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import './MapContainer.css';

// --- **ICON FIX STARTS HERE** ---
// 1. Import the actual image files from the leaflet package
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// 2. Override Leaflet's default icon options BEFORE any components are defined
//    This tells Leaflet where to find the images webpack/vite has processed.
delete L.Icon.Default.prototype._getIconUrl; // Remove the old, broken path logic

L.Icon.Default.mergeOptions({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
});
// --- **ICON FIX ENDS HERE** ---


// --- Your Custom Icons (Traffic, Green Cover, Simulation) ---
// These definitions remain exactly as they were in your working code.
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
const simulationIcon = new L.Icon({
    // Use the *imported* iconUrl here as well, so the base is correct
    iconUrl: iconUrl, 
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
    className: 'leaflet-simulation-icon' // Apply the CSS filter
});
// We now rely on the globally configured L.Icon.Default for blue icons


// --- Map Click Handler (Your working version) ---
function MapClickHandler({ onMapClick, isSimMode }) {
    useMapEvents({
        click(e) {
            if (isSimMode) {
                if (e.latlng && typeof e.latlng.lat === 'number' && typeof e.latlng.lng === 'number') {
                    onMapClick(e.latlng.lat, e.latlng.lng);
                } else {
                    console.error("Invalid click event coordinates:", e.latlng);
                }
            }
        },
    });
    return null;
}

// --- Main Map Component ---
function MapContainer({ pointsData, onMarkerClick, onMapClick, isSimMode, activeLayer }) {
    const position = [20.5937, 78.9629]; // Centered on India
    const zoomLevel = 5;

    // --- Your working getLayerProps Function ---
    // This logic correctly determines content and uses placeholder icon logic
    const getLayerProps = (point) => {
        let icon = L.Icon.Default(); // Use the globally configured default
        let content = <><strong>Data Error</strong></>;

        try {
            if (activeLayer === 'AQI') {
                icon = L.Icon.Default(); // AQI points use the default blue
                content = (
                    <><strong>Air Quality (AQI): {point.aqi ?? 'N/A'}</strong></>
                );
            } else if (activeLayer === 'Traffic') {
                if (typeof point.traffic_density === 'number') {
                    // Your working icon logic based on placeholder aqi value
                    icon = point.aqi > 150 ? trafficIcon : L.Icon.Default(); 
                    content = (
                        <>
                            <strong>Traffic Density: {point.traffic_density}</strong><br />
                            Current Flow: {point.aqi > 150 ? 'High Congestion 🔴' : 'Moderate Flow 🟢'}
                        </>
                    );
                } else { content = <><strong>Traffic Data Missing</strong></>; icon = L.Icon.Default(); }
            } else if (activeLayer === 'Green Cover') {
                if (typeof point.green_cover_index === 'number') {
                    // Your working icon logic based on placeholder aqi value
                    icon = point.aqi < 100 ? greenCoverIcon : L.Icon.Default(); 
                    content = (
                        <>
                            <strong>Green Cover Index: {point.green_cover_index}</strong><br />
                            Density: {point.aqi < 100 ? 'High Density 🌳' : 'Low Density 🍂'}
                        </>
                    );
                 } else { content = <><strong>Green Cover Data Missing</strong></>; icon = L.Icon.Default(); }
            }

            // Override icon and content for simulation (only on AQI layer)
            if (activeLayer === 'AQI' && point.simulated === true) {
                if (typeof point.original_aqi === 'number' && typeof point.aqi === 'number') {
                    icon = simulationIcon; // Use the special simulation icon
                    content = (
                        <>
                            Original AQI: <del>{point.original_aqi}</del><br />
                            <strong>Simulated AQI: {point.aqi}</strong>
                        </>
                    );
                } else { content = <><strong>Simulation Data Invalid</strong></>; /* Keep blue icon */ }
            }
        } catch (error) {
            console.error("Error in getLayerProps:", point, error);
            icon = L.Icon.Default(); 
            content = <><strong>Processing Error</strong></>;
        }
        
        // Final safety check
        if (!(icon instanceof L.Icon || icon instanceof L.Icon.Default)) {
             icon = L.Icon.Default();
        }

        return { icon, content };
    };

    return (
        <div className={`map-container ${isSimMode ? 'sim-mode-active' : ''}`}>
            <LeafletMap center={position} zoom={zoomLevel} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <MapClickHandler onMapClick={onMapClick} isSimMode={isSimMode} />

                {Array.isArray(pointsData) ? pointsData.map((point, index) => {
                    if (!point || typeof point.latitude !== 'number' || typeof point.longitude !== 'number') {
                        console.warn(`Skipping invalid point data at index ${index}:`, point);
                        return null;
                    }
                    const markerKey = point.location_id || `marker-${index}-${point.latitude}-${point.longitude}`;
                    const { icon, content } = getLayerProps(point);

                    return (
                        <Marker
                            key={markerKey}
                            position={[point.latitude, point.longitude]}
                            icon={icon}
                            eventHandlers={{ // Your working chart logic
                                click: () => {
                                    if(point.location_id) { onMarkerClick(point.location_id); }
                                },
                            }}
                        >
                            <Popup>
                                <strong>{point.name || 'Unknown Location'}</strong><br />
                                {content}
                            </Popup>
                        </Marker>
                    );
                }) : (
                     <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, background: 'white', padding: '10px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0,0,0,0.5)'}}>
                       Loading map data...
                     </div>
                )}
            </LeafletMap>
        </div>
    );
}

export default MapContainer;

