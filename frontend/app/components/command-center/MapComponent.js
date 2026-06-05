"use client";
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const MapComponent = ({ agents = [], voteCentres = [], onSelectCentre }) => {
    // Fix for default marker icon in Leaflet
    React.useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);
    // Default center (Dhaka or avg of centers)
    const position = [23.8103, 90.4125];

    const getRiskColor = (risk) => {
        switch (risk) {
            case 'HIGH': return 'red';
            case 'MEDIUM': return 'orange';
            default: return 'green'; // LOW
        }
    };

    return (
        <MapContainer key="command-center-map" center={position} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Vote Centres */}
            {voteCentres.map((vc) => (
                vc.latitude && vc.longitude ? (
                    <CircleMarker
                        key={vc.id}
                        center={[vc.latitude, vc.longitude]}
                        pathOptions={{
                            color: getRiskColor(vc.risk_level),
                            fillColor: getRiskColor(vc.risk_level),
                            fillOpacity: 0.6
                        }}
                        radius={12}
                        eventHandlers={{
                            click: () => onSelectCentre && onSelectCentre(vc),
                        }}
                    >
                        <Popup>
                            <div className="min-w-[200px]">
                                <h3 className="font-bold text-gray-800">{vc.name}</h3>
                                <p className="text-xs text-gray-500">{vc.upozilla_name}</p>
                                <div className="mt-2 text-sm">
                                    <span className={`px-2 py-0.5 rounded text-white text-xs ${vc.risk_level === 'HIGH' ? 'bg-red-500' : vc.risk_level === 'MEDIUM' ? 'bg-orange-500' : 'bg-green-500'}`}>
                                        Risk: {vc.risk_level || 'LOW'}
                                    </span>
                                </div>
                                <div className="mt-2 pt-2 border-t">
                                    <p className="font-semibold text-xs mb-1">Assigned Agents ({vc.assignments?.length || 0})</p>
                                    <ul className="text-xs space-y-1">
                                        {vc.assignments && vc.assignments.length > 0 ? (
                                            vc.assignments.map((assignment, idx) => (
                                                <li key={idx} className="flex justify-between items-center">
                                                    <span>{assignment.agent?.full_name || 'Unknown'}</span>
                                                    <span className={`w-2 h-2 rounded-full ${assignment.status === 'ON_DUTY' ? 'bg-green-500' : 'bg-gray-300'}`} title={assignment.status}></span>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-red-500 italic">No agents assigned</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                ) : null
            ))}
        </MapContainer>
    );
};

export default MapComponent;
