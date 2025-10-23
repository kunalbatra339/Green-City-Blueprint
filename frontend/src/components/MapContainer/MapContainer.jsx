import React from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import './MapContainer.css';

// --- ICONS (Defined correctly) ---
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

    // --- CORRECTED getLayerProps Function ---
    const getLayerProps = (point) => {
        let icon = defaultIcon; // Default to blue
        let content = <strong>Data Not Available</strong>;

        // Determine icon and content based ONLY on the activeLayer first
        if (activeLayer === 'AQI') {
            icon = defaultIcon; // Standard AQI points are blue
            content = (
                <><strong>Air Quality (AQI): {point.aqi}</strong></>
            );
        } else if (activeLayer === 'Traffic') {
            icon = point.traffic_density > 0.75 ? trafficIcon : defaultIcon; // Red or Blue
            content = (
                <>
                    <strong>Traffic Density: {point.traffic_density}</strong><br />
                    Current Flow: {point.traffic_density > 0.75 ? 'High Congestion 🔴' : 'Moderate Flow 🟢'}
                </>
            );
        } else if (activeLayer === 'Green Cover') {
            icon = point.green_cover_index > 0.5 ? greenCoverIcon : defaultIcon; // Green or Blue
            content = (
                <>
                    <strong>Green Cover Index: {point.green_cover_index}</strong><br />
                    Density: {point.green_cover_index > 0.5 ? 'High Density 🌳' : 'Low Density 🍂'}
                </>
            );
        }

        // NOW, override ONLY if the point is simulated AND the AQI layer is active
        if (activeLayer === 'AQI' && point.simulated) {
            icon = simulationIcon; // Use the special pink/green icon
            content = ( // Show the simulation-specific popup content
                <>
                    Original AQI: <del>{point.original_aqi}</del><br />
                    <strong>Simulated AQI: {point.aqi}</strong>
                </>
            );
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

                {pointsData.map(point => {
                    const { icon, content } = getLayerProps(point);

                    return (
                        <Marker
                            key={point.location_id}
                            position={[point.latitude, point.longitude]}
                            icon={icon}
                            eventHandlers={{ // Your working chart logic
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

