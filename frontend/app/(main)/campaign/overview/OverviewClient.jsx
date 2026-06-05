"use client";

import { useEffect, useState } from "react";
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';

const OverviewClient = () => {
    const [selectedEventType, setSelectedEventType] = useState("");
    const [filteredCampaigns, setFilteredCampaigns] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [eventTypes, setEventTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch event types
                const typesRes = await fetch("/frontapi/event-types");
                if (!typesRes.ok) throw new Error("Failed to fetch event types");
                const typesData = await typesRes.json();

                if (typesData.success) {
                    setEventTypes(typesData.data);
                }

                // Fetch campaigns
                const campaignsRes = await fetch("/frontapi/campaigns");
                if (!campaignsRes.ok) throw new Error("Failed to fetch campaigns");
                const campaignsData = await campaignsRes.json();

                if (campaignsData.success) {
                    setCampaigns(campaignsData.data);
                    setFilteredCampaigns(campaignsData.data);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedEventType === "") {
            setFilteredCampaigns(campaigns);
        } else {
            setFilteredCampaigns(
                campaigns.filter((campaign) =>
                    campaign.milestones && campaign.milestones.some(m => m.eventType && m.eventType.id === parseInt(selectedEventType))
                )
            );
        }
    }, [campaigns, selectedEventType]);

    // --- Data Processing for Charts ---

    const getStatus = (campaign) => {
        const now = new Date();
        const start = new Date(campaign.startDate);
        const end = new Date(campaign.endDate);

        if (now < start) return 'Upcoming';
        if (now > end) return 'Completed';
        return 'Active';
    };

    // Prepare Status Data
    const statusCounts = { Upcoming: 0, Active: 0, Completed: 0 };
    filteredCampaigns.forEach(c => {
        const status = getStatus(c);
        if (statusCounts[status] !== undefined) {
            statusCounts[status]++;
        }
    });

    const statusData = [
        { name: 'Upcoming', value: statusCounts.Upcoming, color: '#fbbf24' }, // amber-400
        { name: 'Active', value: statusCounts.Active, color: '#22c55e' },   // green-500
        { name: 'Completed', value: statusCounts.Completed, color: '#3b82f6' }, // blue-500
    ].filter(d => d.value > 0);

    // Prepare Type Data
    const typeCountMap = {};
    filteredCampaigns.forEach(c => {
        if (c.milestones && c.milestones.length > 0) {
            const uniqueTypes = new Set();
            c.milestones.forEach(m => {
                if (m.eventType?.name) uniqueTypes.add(m.eventType.name);
            });
            uniqueTypes.forEach(typeName => {
                typeCountMap[typeName] = (typeCountMap[typeName] || 0) + 1;
            });
        } else {
            typeCountMap['Uncategorized'] = (typeCountMap['Uncategorized'] || 0) + 1;
        }
    });

    const typeData = Object.keys(typeCountMap).map(key => ({
        name: key,
        count: typeCountMap[key]
    })).sort((a, b) => b.count - a.count); // Sort descending


    return (
        <div>
            <div className="p-4 bg-white shadow rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-4">Analytics Dashboard</h2>
                {loading && <p>Loading data...</p>}
                {error && <p className="text-red-500">Error: {error.message}</p>}
                {!loading && !error && (
                    <>
                        <div className="mb-4 flex items-center space-x-4">
                            <label htmlFor="eventTypeFilter" className="font-medium">Filter by Type:</label>
                            <select
                                id="eventTypeFilter"
                                className="border rounded-md px-3 py-2"
                                value={selectedEventType}
                                onChange={(e) => setSelectedEventType(e.target.value)}
                            >
                                <option value="">All Types</option>
                                {eventTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-100 p-4 rounded-lg shadow">
                                <h3 className="text-lg font-medium">Total Campaigns</h3>
                                <p className="text-3xl font-bold">{filteredCampaigns.length}</p>
                            </div>
                            <div className="bg-green-100 p-4 rounded-lg shadow">
                                <h3 className="text-lg font-medium">Active Campaigns</h3>
                                <p className="text-3xl font-bold">{statusCounts.Active}</p>
                            </div>
                            <div className="bg-yellow-100 p-4 rounded-lg shadow">
                                <h3 className="text-lg font-medium">Upcoming Campaigns</h3>
                                <p className="text-3xl font-bold">{statusCounts.Upcoming}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Status Chart */}
                            <div className="bg-white p-4 rounded-lg shadow h-80 flex flex-col">
                                <h3 className="text-lg font-medium mb-2 text-center">Campaigns by Status</h3>
                                <div className="flex-1 w-full min-h-0">
                                    {statusData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={statusData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {statusData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-400">
                                            No data to display
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Type Chart */}
                            <div className="bg-white p-4 rounded-lg shadow h-80 flex flex-col">
                                <h3 className="text-lg font-medium mb-2 text-center">Campaigns by Type</h3>
                                <div className="flex-1 w-full min-h-0">
                                    {typeData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={typeData}
                                                layout="vertical"
                                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" allowDecimals={false} />
                                                <YAxis type="category" dataKey="name" width={100} />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="count" fill="#8884d8" name="Count" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-400">
                                            No data to display
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default OverviewClient;