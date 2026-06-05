'use client'
import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const VoterMap = ({ voters }) => {
    // Fix Leaflet Default Icon issue
    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;

        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
    }, []);

    return (
        <MapContainer
            center={[23.8103, 90.4125]}
            zoom={7}
            className="h-full w-full"
            minZoom={6}
            maxBounds={[
                [20.3, 87.9], // Southwest (Bay of Bengal & West border)
                [26.8, 92.8]  // Northeast (Sylhet border)
            ]}
            maxBoundsViscosity={1.0}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {voters.map((voter) => {
                let lat, lng;

                // Priority 1: Use District Coordinates if available
                if (voter.district?.lat && voter.district?.lon) {
                    // Add small random jitter to avoid exact overlap if multiple voters in same district
                    lat = parseFloat(voter.district.lat) + (((voter.id * 13) % 100) - 50) / 10000;
                    lng = parseFloat(voter.district.lon) + (((voter.id * 7) % 100) - 50) / 10000;
                }
                // Priority 2: Fallback to Division Center
                else {
                    const divisionId = voter.division_id || voter.division?.id || 6
                    const divisionCoords = {
                        1: [22.3569, 91.7832], // Chattagram
                        2: [24.3636, 88.6241], // Rajshahi
                        3: [22.8456, 89.5403], // Khulna
                        4: [22.7010, 90.3535], // Barisal
                        5: [24.8949, 91.8687], // Sylhet
                        6: [23.8103, 90.4125], // Dhaka
                        7: [25.7439, 89.2752], // Rangpur
                        8: [24.7471, 90.4203]  // Mymensingh
                    }
                    const center = divisionCoords[divisionId] || [23.8103, 90.4125]

                    // Larger spread for division-level fallback
                    lat = center[0] + (((voter.id * 13) % 100) - 50) / 1000
                    lng = center[1] + (((voter.id * 7) % 100) - 50) / 1000
                }

                return (
                    <Marker
                        key={voter.id}
                        position={[lat, lng]}
                        eventHandlers={{
                            mouseover: (e) => e.target.openPopup(),
                            mouseout: (e) => e.target.closePopup()
                        }}
                    >
                        <Popup>
                            <div className="p-2 min-w-[200px]">
                                <h3 className="font-bold text-lg mb-1">{voter.name}</h3>
                                <div className="text-sm space-y-1">
                                    <p><span className="font-semibold">NID:</span> {voter.nid}</p>
                                    <p><span className="font-semibold">Phone:</span> {voter.phone}</p>
                                    <div className="border-t pt-1 mt-1 text-xs text-gray-600">
                                        {voter.division?.name}, {voter.district?.name}
                                        <br />
                                        {voter.upazilla?.name}, {voter.union?.name}
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )
            })}
        </MapContainer>
    )
}

export default VoterMap
