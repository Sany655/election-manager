"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUserPlus, FaMapMarkedAlt, FaExclamationTriangle } from 'react-icons/fa';
import DefaultLayout from '@/app/components/layout/DefaultLayout';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import dynamic from 'next/dynamic';

// Dynamically import MapComponent to disable SSR
const MapComponent = dynamic(() => import('@/app/components/command-center/MapComponent'), {
    ssr: false,
    loading: () => <div className="h-96 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500">Loading Map...</div>,
});

const CommandCenterOverview = () => {
    const [stats, setStats] = useState({
        totalAgents: 0,
        activeAgents: 0,
        totalIncidents: 0,
        resolvedIncidents: 0
    });
    const [agents, setAgents] = useState([]);
    const [voteCentres, setVoteCentres] = useState([]);
    const [recentIncidents, setRecentIncidents] = useState([]);

    const fetchData = async () => {
        try {
            // Fetch Stats
            const statsRes = await axios.get('/frontapi/command-center/stats');
            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }

            // Fetch Map Data (Vote Centres with Agents)
            const mapRes = await axios.get('/frontapi/command-center/map');
            if (mapRes.data.success) {
                setVoteCentres(mapRes.data.data);
            }

            // Fetch Agents (Legacy list if needed, or remove)
            // const agentsRes = await axios.get('/frontapi/command-center/agents');
            // if (agentsRes.data.success) setAgents(agentsRes.data.data);

            // Fetch Incidents for Feed
            const incidentsRes = await axios.get('/frontapi/command-center/incidents');
            if (incidentsRes.data.success) {
                setRecentIncidents(incidentsRes.data.data.slice(0, 5)); // Top 5
            }

        } catch (error) {
            console.error("Error fetching command center data", error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // 10s Polling
        return () => clearInterval(interval);
    }, []);

    return (
        <DefaultLayout>
            <ProtectedRoute permissions={['view-command-center']}>
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Command Center Overview</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Agents</p>
                                    <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{stats.totalAgents}</h3>
                                </div>
                                <FaUserPlus className="text-3xl text-blue-500 opacity-50" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Active Duty</p>
                                    <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{stats.activeAgents}</h3>
                                </div>
                                <FaMapMarkedAlt className="text-3xl text-green-500 opacity-50" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-red-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Active Incidents</p>
                                    <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{stats.totalIncidents - stats.resolvedIncidents}</h3>
                                </div>
                                <FaExclamationTriangle className="text-3xl text-red-500 opacity-50" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Live Map */}
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow h-96 overflow-hidden relative z-0">
                            <MapComponent voteCentres={voteCentres} />
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-96 overflow-y-auto">
                            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Recent Activity Feed</h3>
                            <ul className="space-y-4">
                                {recentIncidents.length === 0 ? (
                                    <li className="text-sm text-gray-500">No recent activity</li>
                                ) : (
                                    recentIncidents.map(incident => (
                                        <li key={incident.id} className="flex items-start text-sm text-gray-600 dark:text-gray-400 border-b pb-2 last:border-0 border-gray-100 dark:border-gray-700">
                                            <span className={`w-2 h-2 rounded-full mt-1.5 mr-2 ${incident.severity > 3 ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-800 dark:text-white">{incident.type}</span>
                                                    <span className="text-xs opacity-70">{new Date(incident.createdAt).toLocaleTimeString()}</span>
                                                </div>
                                                <p className="text-xs mt-1">{incident.description}</p>
                                                <span className="text-xs text-blue-500">Booth: {incident.booth_id}</span>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        </DefaultLayout>
    );
};

export default CommandCenterOverview;
