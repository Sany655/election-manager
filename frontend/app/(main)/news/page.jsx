'use client';
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaNewspaper } from 'react-icons/fa';
import toast from 'react-hot-toast';
import DefaultLayout from '@/app/components/layout/DefaultLayout';

export default function NewsPage() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const res = await fetch('/frontapi/news');
            const data = await res.json();
            if (res.ok) setNews(data.data || []);
            else toast.error('Failed to load news');
        } catch (error) {
            toast.error('Error fetching news');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/frontapi/news/${editingId}` : '/frontapi/news';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(`News ${editingId ? 'updated' : 'created'} successfully`);
                setShowModal(false);
                setFormData({ title: '', description: '' });
                setEditingId(null);
                fetchNews();
            } else {
                toast.error('Failed to save news');
            }
        } catch (error) {
            toast.error('Error saving news');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this news item?')) return;
        
        try {
            const res = await fetch(`/frontapi/news/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('News deleted');
                fetchNews();
            } else {
                toast.error('Failed to delete news');
            }
        } catch (error) {
            toast.error('Error deleting news');
        }
    };

    const openEdit = (item) => {
        setFormData({ title: item.title, description: item.description });
        setEditingId(item.id);
        setShowModal(true);
    };

    return (
        <DefaultLayout>
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaNewspaper className="text-blue-500" />
                        News Management
                    </h1>
                    <button
                        onClick={() => {
                            setFormData({ title: '', description: '' });
                            setEditingId(null);
                            setShowModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <FaPlus /> Add News
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading news...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {news.map(item => (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.description}</p>
                                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                                    <span className="text-xs text-gray-400">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {news.length === 0 && (
                            <div className="col-span-full text-center py-10 text-gray-500">
                                No news items found. Add one to get started.
                            </div>
                        )}
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit News' : 'Add News'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="News Title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        required
                                        rows="4"
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        placeholder="News Content"
                                    ></textarea>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        {editingId ? 'Update' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DefaultLayout>
    );
}
