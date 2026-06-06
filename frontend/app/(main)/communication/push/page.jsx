'use client';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import DefaultLayout from '@/app/components/layout/DefaultLayout';
import { MdOutlineMessage, MdSend } from 'react-icons/md';

export default function PushNotificationPage() {
    const [formData, setFormData] = useState({ title: '', message: '', target: 'all' });
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const res = await fetch('/frontapi/push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Push notification sent successfully');
                setFormData({ title: '', message: '', target: 'all' });
            } else {
                toast.error('Failed to send notification');
            }
        } catch (error) {
            toast.error('Error sending notification');
        } finally {
            setSending(false);
        }
    };

    return (
        <DefaultLayout title="Push Notifications">
            <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <MdOutlineMessage className="text-blue-500" />
                        Send Push Notifications
                    </h1>
                    <p className="text-gray-600 mt-1">Broadcast direct notifications to users' mobile apps.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Target Audience
                            </label>
                            <select
                                value={formData.target}
                                onChange={e => setFormData({...formData, target: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="all">All Android App Users</option>
                                <option value="voters">Registered Voters Only</option>
                                <option value="agents">Volunteers & Agents Only</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notification Title
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Important Election Update"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Message Body
                            </label>
                            <textarea
                                required
                                rows="4"
                                value={formData.message}
                                onChange={e => setFormData({...formData, message: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="Write your message here..."
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-1 flex justify-between">
                                <span>This message will pop up directly on the users' phones.</span>
                                <span>{formData.message.length} chars</span>
                            </p>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={sending}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 font-medium shadow-md hover:shadow-lg"
                            >
                                <MdSend /> {sending ? 'Sending...' : 'Broadcast Notification'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DefaultLayout>
    );
}
