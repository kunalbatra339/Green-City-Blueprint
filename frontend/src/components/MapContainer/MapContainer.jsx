import React from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import './MapContainer.css';

// --- ICONS (Defined correctly - No changes here) ---
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
// Specific icon for SIMULATED AQI points
const simulationIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png', // Base blue icon URL
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
    className: 'leaflet-simulation-icon' // Class for the color filter
});
const defaultIcon = new L.Icon.Default(); // Default blue icon


// --- Map Click Handler (Unchanged from your working version) ---
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
function MapContainer({ pointsData, onMarkerClick, onMapClick, isSimMode, activeLayer }) {
    // Center map on India and zoom out
    const position = [20.5937, 78.9629];
    const zoomLevel = 5;

    // --- getLayerProps Function with TYPO FIXED ---
    const getLayerProps = (point) => {
        let icon = defaultIcon; // Default to blue
        let content = <strong>Data Error</strong>; // Default error message

        try {
            // Determine base icon and content based ONLY on the activeLayer first
            if (activeLayer === 'AQI') {
                icon = defaultIcon; // Standard AQI points are blue
                content = (
                    <><strong>Air Quality (AQI): {point.aqi}</strong></>
                );
            } else if (activeLayer === 'Traffic') {
                if (point.traffic_density !== undefined && point.traffic_density !== null) {
                    icon = point.traffic_density > 0.75 ? trafficIcon : defaultIcon; // Red or Blue
                    content = (
                        <>
                            <strong>Traffic Density: {point.traffic_density}</strong><br />
                            Current Flow: {point.traffic_density > 0.75 ? 'High Congestion 🔴' : 'Moderate Flow 🟢'}
                        </>
                    );
                } else { content = <><strong>Traffic Data Missing</strong></>; }

            } else if (activeLayer === 'Green Cover') {
                 if (point.green_cover_index !== undefined && point.green_cover_index !== null) {
                    icon = point.green_cover_index > 0.5 ? greenCoverIcon : defaultIcon; // Green or Blue
                    content = (
                        <>
                            <strong>Green Cover Index: {point.green_cover_index}</strong><br />
                            Density: {point.green_cover_index > 0.5 ? 'High Density 🌳' : 'Low Density 🍂'}
                        </>
                    );
                 } else { content = <><strong>Green Cover Data Missing</strong></>; }
            }

            // NOW, override ONLY if the point is simulated AND the AQI layer is active
            if (activeLayer === 'AQI' && point.simulated) {
                icon = simulationIcon; // Use the special pink/green icon
                content = ( // Show the simulation-specific popup content
                    <>
                        {/* THE TYPO IS FIXED HERE */}
                        Original AQI: <del>{point.original_aqi}</del><br />
                        <strong>Simulated AQI: {point.aqi}</strong>
                    </>
                );
            }

        } catch (error) {
            console.error("Error processing point data:", point, error);
            // In case of any error, keep the default icon and show error content
        }

        // Final safety check
        if (!icon) {
            icon = defaultIcon;
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

                {/* Check if pointsData is an array before mapping */}
                {Array.isArray(pointsData) && pointsData.map(point => {
                    // Ensure point is valid and has coordinates before processing
                    if (!point || typeof point.latitude !== 'number' || typeof point.longitude !== 'number') {
                        console.warn("Skipping invalid point data:", point);
                        return null; // Skip rendering this marker
                    }

                    const { icon, content } = getLayerProps(point);

                    return (
                        <Marker
                            key={point.location_id || Math.random()} // Use location_id or fallback key
                            position={[point.latitude, point.longitude]}
                            icon={icon}
                            eventHandlers={{ // Your working chart logic
                                click: () => {
                                    // Make sure location_id exists before calling handler
                                    if(point.location_id) {
                                        onMarkerClick(point.location_id);
                                    }
                                },
                            }}
                        >
                            <Popup>
                                <strong>{point.name || 'Unknown Location'}</strong><br />
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

