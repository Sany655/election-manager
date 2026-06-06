"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import DefaultLayout from '@/app/components/layout/DefaultLayout';
import ProtectedRoute from '@/app/components/ProtectedRoute';

const MapComponent = dynamic(() => import('@/app/components/command-center/MapComponent'), {
    ssr: false,
    loading: () => <div className="h-96 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500">Loading Map...</div>,
});

const IncidentMonitoring = () => {
    const [incidents, setIncidents] = useState([]);

    const [selectedVoteCentre, setSelectedVoteCentre] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newIncident, setNewIncident] = useState({
        center_id: '',
        type: 'VIOLENCE',
        severity: 'Medium',
        description: ''
    });

    // Initial Static Data
    // State initialization
    const [voteCentres, setVoteCentres] = useState([]);

    const handleResolve = async (incidentId) => {
        try {
            const res = await axios.put(`/frontapi/command-center/incidents/${incidentId}/resolve`, {
                resolution_log: 'Resolved via Command Center UI'
            });
            if (res.data.success) {
                fetchIncidents(); // Refresh
            }
        } catch (error) {
            console.error("Failed to resolve incident", error);
        }
    };

    const handleAcknowledge = (incidentId) => {
        // Placeholder: Backend API for 'acknowledge' not yet implemented
        alert("Acknowledgment feature pending backend implementation.");
    };


    useEffect(() => {
        fetchIncidents();
        fetchVoteCentres();
        const interval = setInterval(() => {
            fetchIncidents();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchVoteCentres = async () => {
        try {
            const res = await axios.get('/frontapi/command-center/vote-centres');
            if (res.data.success) {
                setVoteCentres(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch vote centres", error);
        }
    };

    const fetchIncidents = async () => {
        try {
            const res = await axios.get('/frontapi/command-center/incidents');
            if (res.data.success) {
                setIncidents(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch incidents", error);
        }
    };

    const handleAddIncident = async (e) => {
        e.preventDefault();
        if (!newIncident.center_id) return alert("Please select a center");

        try {
            let mediaUrls = [];

            // Handle File Upload
            if (newIncident.files && newIncident.files.length > 0) {
                const formData = new FormData();
                Array.from(newIncident.files).forEach(file => {
                    formData.append('media', file);
                });

                const uploadRes = await axios.post('/frontapi/command-center/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (uploadRes.data.success) {
                    mediaUrls = uploadRes.data.urls;
                } else {
                    throw new Error(uploadRes.data.message || 'Upload failed');
                }
            } else if (newIncident.media_urls) {
                // Fallback for manually entered URL if we keep text input logic (optional)
                mediaUrls = [newIncident.media_urls];
            }

            const payload = {
                booth_id: newIncident.center_id,
                type: newIncident.type,
                severity: newIncident.severity,
                description: newIncident.description,
                media_urls: mediaUrls
            };

            const res = await axios.post('/frontapi/command-center/incidents', payload);

            if (res.data.success) {
                setShowModal(false);
                setNewIncident({ center_id: '', type: 'VIOLENCE', severity: 'Medium', description: '', media_urls: '', files: null });
                fetchIncidents();
                alert('Incident Reported Successfully');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to report incident: ' + (error.response?.data?.message || error.message));
        }
    };

    const getSeverityColor = (severity) => {
        if (severity >= 4) return 'bg-red-500';
        if (severity === 3) return 'bg-orange-500';
        return 'bg-yellow-500';
    };

    return (
        <DefaultLayout>
            <ProtectedRoute permissions={['view-command-center']}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Incident Monitoring</h1>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
                        >
                            <FaPlus /> Report Incident
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Map Section */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow h-[500px] overflow-hidden relative z-0">
                            <MapComponent
                                voteCentres={voteCentres}
                                onSelectCentre={setSelectedVoteCentre}
                            />
                        </div>

                        {/* Selected Centre Details Section */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow overflow-y-auto h-[500px]">
                            {selectedVoteCentre ? (
                                <>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                            {selectedVoteCentre.name}
                                        </h3>
                                        <button
                                            onClick={() => setSelectedVoteCentre(null)}
                                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <h4 className="text-sm font-semibold text-gray-500 mb-3">Vote Center Incidents</h4>

                                    {selectedVoteCentre.incidents.length === 0 ? (
                                        <p className="text-green-600 font-medium text-sm">No active incidents reported at this center.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedVoteCentre.incidents.map(incident => (
                                                <div key={incident.id} className={`p-3 rounded-lg border-l-4 shadow-sm ${incident.severity === 'High' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                                                    incident.severity === 'Medium' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' :
                                                        'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                                                    }`}>
                                                    <div className="flex justify-between">
                                                        <span className="font-bold text-xs text-gray-800 dark:text-gray-200">{incident.type}</span>
                                                        <span className="text-xs text-gray-500">{incident.time}</span>
                                                    </div>
                                                    <p className="text-xs mt-1 text-gray-600 dark:text-gray-300">{incident.description}</p>
                                                    {/* Media Display in Popup */}
                                                    {(() => {
                                                        let media = [];
                                                        try {
                                                            if (Array.isArray(incident.media_urls)) {
                                                                media = incident.media_urls;
                                                            } else if (typeof incident.media_urls === 'string') {
                                                                if (incident.media_urls.trim().startsWith('[')) {
                                                                    media = JSON.parse(incident.media_urls);
                                                                } else {
                                                                    media = [incident.media_urls];
                                                                }
                                                            }
                                                        } catch (e) {
                                                            media = [incident.media_urls];
                                                        }

                                                        if (!media || media.length === 0) return null;

                                                        return (
                                                            <div className="mt-2 flex gap-1 flex-wrap">
                                                                {media.map((url, idx) => {
                                                                    const cleanUrl = url?.replace ? url : '';
                                                                    const isImage = cleanUrl.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i);
                                                                    const isVideo = cleanUrl.match(/\.(mp4|webm|ogg|mov)$/i);
                                                                    const finalUrl = cleanUrl.startsWith('http') ? cleanUrl : `${process.env.NEXT_PUBLIC_BASE_URL}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;

                                                                    return (
                                                                        <a key={idx} href={finalUrl} target="_blank" rel="noopener noreferrer" className="block w-12 h-12 relative border rounded overflow-hidden bg-gray-50">
                                                                            {isImage ? (
                                                                                <img src={finalUrl} alt="Ev" className="object-cover w-full h-full" />
                                                                            ) : isVideo ? (
                                                                                <video src={finalUrl} className="object-cover w-full h-full" />
                                                                            ) : (
                                                                                <div className="flex items-center justify-center w-full h-full text-[8px] text-gray-500">File</div>
                                                                            )}
                                                                        </a>
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    })()}
                                                    {incident.status !== 'RESOLVED' && (
                                                        <div className="mt-2 flex gap-2">
                                                            <button
                                                                onClick={() => handleAcknowledge(incident.id, selectedVoteCentre.id)}
                                                                className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                                                            >
                                                                Ack
                                                            </button>
                                                            <button
                                                                onClick={() => handleResolve(incident.id, selectedVoteCentre.id)}
                                                                className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-800"
                                                            >
                                                                Resolve
                                                            </button>
                                                        </div>
                                                    )}
                                                    {incident.status === 'RESOLVED' && (
                                                        <span className="mt-2 inline-block text-xs font-bold text-green-600 dark:text-green-400">✓ Resolved</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                                    <p>Select a Vote Center on the map to view specific incidents.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">All Reported Incidents</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {incidents.length === 0 ? (
                            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow text-gray-500">
                                No incidents reported yet. All clear.
                            </div>
                        ) : (
                            incidents.map(incident => (
                                <div key={incident.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex border-l-4 border-red-500">
                                    <div className={`p-3 rounded-full mr-4 flex items-center justify-center text-white font-bold h-12 w-12 ${getSeverityColor(incident.severity)}`}>
                                        {incident.severity}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{incident.type}</h3>
                                                <p className="text-sm text-gray-500">
                                                    Reported by: <span className="font-semibold text-gray-700 dark:text-gray-300">{(incident.reporter?.name || 'Radio Agent')}</span>
                                                    <br />
                                                    At Center: <span className="font-semibold text-gray-700 dark:text-gray-300">{incident.booth?.name || incident.booth_id}</span>
                                                </p>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {new Date(incident.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-gray-700 dark:text-gray-300">{incident.description}</p>

                                        {/* Media Display */}
                                        {/* Media Display */}
                                        {(() => {
                                            let media = [];
                                            try {
                                                if (Array.isArray(incident.media_urls)) {
                                                    media = incident.media_urls;
                                                } else if (typeof incident.media_urls === 'string') {
                                                    if (incident.media_urls.trim().startsWith('[')) {
                                                        media = JSON.parse(incident.media_urls);
                                                    } else {
                                                        media = [incident.media_urls];
                                                    }
                                                }
                                            } catch (e) {
                                                media = [incident.media_urls];
                                            }

                                            if (!media || media.length === 0) return null;

                                            return (
                                                <div className="mt-3 flex gap-2 flex-wrap">
                                                    {media.map((url, idx) => {
                                                        const cleanUrl = url?.replace ? url : '';
                                                        const isImage = cleanUrl.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i);
                                                        const isVideo = cleanUrl.match(/\.(mp4|webm|ogg|mov)$/i);
                                                        const finalUrl = cleanUrl.startsWith('http') ? cleanUrl : `${process.env.NEXT_PUBLIC_BASE_URL}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;

                                                        return (
                                                            <a key={idx} href={finalUrl} target="_blank" rel="noopener noreferrer" className="block w-20 h-20 relative border rounded overflow-hidden bg-gray-50 dark:bg-gray-700">
                                                                {isImage ? (
                                                                    <img src={finalUrl} alt="Evidence" className="object-cover w-full h-full" />
                                                                ) : isVideo ? (
                                                                    <video src={finalUrl} className="object-cover w-full h-full" />
                                                                ) : (
                                                                    <div className="flex flex-col items-center justify-center w-full h-full text-xs text-gray-500 p-1">
                                                                        <span className="font-bold">FILE</span>
                                                                        <span className="text-[10px] truncate w-full text-center">{cleanUrl.split('.').pop()}</span>
                                                                    </div>
                                                                )}
                                                            </a>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}
                                        {incident.status !== 'RESOLVED' && (
                                            <div className="mt-4 flex gap-2">
                                                <button
                                                    onClick={() => handleAcknowledge(incident.id, null)} // null centerId because we don't know it easily here or it's from DB
                                                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                                                >
                                                    Acknowledge
                                                </button>
                                                <button
                                                    onClick={() => handleResolve(incident.id, null)}
                                                    className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                                                >
                                                    Mark as Resolved
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Add Incident Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4 dark:text-white">Report New Incident</h2>
                            <form onSubmit={handleAddIncident}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vote Center</label>
                                    <select
                                        className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={newIncident.center_id}
                                        onChange={e => setNewIncident({ ...newIncident, center_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Center</option>
                                        {voteCentres.map(vc => (
                                            <option key={vc.id} value={vc.id}>{vc.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                    <select
                                        className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={newIncident.type}
                                        onChange={e => setNewIncident({ ...newIncident, type: e.target.value })}
                                    >
                                        <option value="VIOLENCE">Violence</option>
                                        <option value="LOGISTICS_FAIL">Logistics Failure</option>
                                        <option value="RIGGING_ATTEMPT">Rigging Attempt</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity</label>
                                    <select
                                        className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={newIncident.severity}
                                        onChange={e => setNewIncident({ ...newIncident, severity: e.target.value })}
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                    <textarea
                                        className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={newIncident.description}
                                        onChange={e => setNewIncident({ ...newIncident, description: e.target.value })}
                                        rows="3"
                                        required
                                    ></textarea>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Evidence (Images/Videos)</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,video/*"
                                        className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        onChange={e => setNewIncident({ ...newIncident, files: e.target.files })}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Max 10MB per upload.</p>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        Submit Report
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </ProtectedRoute>
        </DefaultLayout >
    );
};

export default IncidentMonitoring;
