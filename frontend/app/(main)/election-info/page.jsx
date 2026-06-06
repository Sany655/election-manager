'use client';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DefaultLayout from '@/app/components/layout/DefaultLayout';
import { FaCalendarDay, FaSave } from 'react-icons/fa';

export default function ElectionInfoPage() {
    const [formData, setFormData] = useState({
        nominationDate: '',
        electionDate: '',
        status: 'Active'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchInfo();
    }, []);

    const fetchInfo = async () => {
        try {
            const res = await fetch('/frontapi/election-info');
            const data = await res.json();
            if (res.ok && data) {
                setFormData({
                    nominationDate: data.nominationDate ? data.nominationDate.split('T')[0] : '',
                    electionDate: data.electionDate ? data.electionDate.split('T')[0] : '',
                    status: data.status || 'Active'
                });
            }
        } catch (error) {
            toast.error('Error fetching election info');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/frontapi/election-info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Election info updated successfully');
                fetchInfo();
            } else {
                toast.error('Failed to update election info');
            }
        } catch (error) {
            toast.error('Error updating election info');
        } finally {
            setSaving(false);
        }
    };

    return (
        <DefaultLayout>
            <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaCalendarDay className="text-blue-500" />
                        Election Calendar Settings
                    </h1>
                    <p className="text-gray-600 mt-1">Manage global dates for the upcoming election.</p>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading settings...</div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nomination Submission Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.nominationDate}
                                        onChange={e => setFormData({...formData, nominationDate: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Deadline for candidates to submit their nomination.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Final Election Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.electionDate}
                                        onChange={e => setFormData({...formData, electionDate: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">The day of the final polling.</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({...formData, status: e.target.value})}
                                    className="w-full md:w-1/2 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                                >
                                    <option value="Active">Active / Upcoming</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Postponed">Postponed</option>
                                </select>
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>

                        </form>
                    </div>
                )}
            </div>
        </DefaultLayout>
    );
}
