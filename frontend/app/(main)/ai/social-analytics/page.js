'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FaFacebook, FaSearch, FaSpinner, FaChartLine, FaTimes, FaEye, FaTrash, FaSync, FaKey, FaSave, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import DefaultLayout from '@/app/components/layout/DefaultLayout';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import toast from 'react-hot-toast';

const SocialAnalyticsPage = () => {
    const router = useRouter();
    const [postUrl, setPostUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [isKeySaved, setIsKeySaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [showHistoryStats, setShowHistoryStats] = useState(false);

    // Logic for Prompt Modal
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [existingAnalysisData, setExistingAnalysisData] = useState(null);
    const [pendingUrl, setPendingUrl] = useState(''); // To retry/force update

    // Logic for Table Action Spinner
    const [updatingParams, setUpdatingParams] = useState(null);

    const historyStats = useMemo(() => {
        return history.reduce((acc, curr) => ({
            posts: acc.posts + 1,
            likes: acc.likes + (curr.likes || 0),
            comments: acc.comments + (curr.comments_count || 0),
            shares: acc.shares + (curr.shares || 0)
        }), { posts: 0, likes: 0, comments: 0, shares: 0 });
    }, [history]);

    const fetchHistory = async () => {
        try {
            const response = await fetch('/frontapi/social-analytics');
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    };

    useEffect(() => {
        fetchHistory();
        const savedKey = localStorage.getItem('apify_api_key');
        if (savedKey) {
            setApiKey(savedKey);
            setIsKeySaved(true);
        }
    }, []);

    const saveApiKey = () => {
        if (!apiKey.trim()) {
            toast.error('Please enter a valid API Key');
            return;
        }
        localStorage.setItem('apify_api_key', apiKey);
        setIsKeySaved(true);
        toast.success('API Key saved successfully!');
    };

    const clearApiKey = () => {
        localStorage.removeItem('apify_api_key');
        setApiKey('');
        setIsKeySaved(false);
        toast('API Key removed', { icon: '🗑️' });
    };

    const handleAnalyzeSubmit = async () => {
        setError(null);

        // 1. Check API Key
        if (!isKeySaved && !apiKey) {
            setError('Please save your Apify API Key first (at the top).');
            return;
        }

        // 2. Validate URL
        if (!postUrl.trim()) {
            setError('Please enter a Facebook Post URL.');
            return;
        }

        // 3. Proceed to Analyze (This handles both "Check Existence" and "Analyze New" based on backend logic)
        await runAnalysis(postUrl, false);
    };

    const runAnalysis = async (urlToAnalyze, forceUpdate = false, isTableAction = false) => {
        if (!isTableAction) setLoading(true);

        // Ensure we have a key (from state or storage)
        const currentKey = apiKey || localStorage.getItem('apify_api_key');
        if (!currentKey) {
            setError('API Key is missing. Please save it first.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/frontapi/social-analytics`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: urlToAnalyze,
                    apify_key: currentKey,
                    force_update: forceUpdate
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to analyze post');
            }

            const result = await response.json();

            // 4. Handle Existing Logic
            if (result.existing) {
                // If checking (forceUpdate=false), prompt the user
                setExistingAnalysisData(result);
                setPendingUrl(urlToAnalyze);
                setShowConflictModal(true);
                setLoading(false);
                return;
            }

            // 5. Success (New or Updated)
            toast.success(forceUpdate ? 'Analysis updated successfully!' : 'Analysis completed!');

            // Redirect to view
            if (result.id) {
                router.push(`/ai/social-analytics/${result.id}`);
            } else {
                fetchHistory(); // Fallback
            }

        } catch (err) {
            console.error(err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            if (!isTableAction) setLoading(false);
            setUpdatingParams(null);
        }
    };

    // Prompt Actions
    const handlePromptUpdate = () => {
        setShowConflictModal(false);
        // "Update Feature will work same as analyze/create"
        // Force update with the pending URL using stored key
        runAnalysis(pendingUrl, true);
    };

    const handlePromptView = () => {
        if (existingAnalysisData && existingAnalysisData.id) {
            router.push(`/ai/social-analytics/${existingAnalysisData.id}`);
        }
        setShowConflictModal(false);
    };

    // Table Actions
    const handleTableUpdate = async (url, id) => {
        setUpdatingParams(id);
        const currentKey = localStorage.getItem('apify_api_key');
        if (!currentKey) {
            toast.error('Please save API Key at the top first!');
            setUpdatingParams(null);
            return;
        }
        // Force update immediately
        await runAnalysis(url, true, true);
    };

    const deleteAnalysis = async (id) => {
        if (!confirm('Are you sure you want to delete this analysis?')) return;

        try {
            const response = await fetch(`/frontapi/social-analytics?id=${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchHistory();
                toast.success('Deleted successfully');
            } else {
                toast.error('Failed to delete');
            }
        } catch (error) {
            console.error('Error deleting analysis:', error);
            toast.error('Error deleting analysis');
        }
    };

    return (
        <DefaultLayout>
            <ProtectedRoute permissions={['view-social-analytics']}>
                <div className="p-6 max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <FaFacebook className="text-blue-600 text-4xl" />
                            <div>
                                <span className="block text-2xl">Social Media Analytics</span>
                                <span className="text-sm font-normal text-gray-500">Track and analyze post performance</span>
                            </div>
                        </h1>
                    </div>

                    {/* Step 1: API Key Configuration */}
                    <div className={`rounded-xl shadow-sm border p-6 transition-all duration-300 ${isKeySaved ? 'bg-green-50 border-green-200' : 'bg-white border-blue-100'}`}>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-full ${isKeySaved ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                    <FaKey />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">
                                    {isKeySaved ? 'API Key Configured' : 'Configure API Key'}
                                </h3>
                            </div>
                            {isKeySaved && <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1"><FaCheckCircle /> Ready to Analyze</span>}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <div className="flex-grow relative">
                                <input
                                    autoComplete='off'
                                    type={isKeySaved ? "password" : "text"}
                                    value={apiKey}
                                    onChange={(e) => {
                                        setApiKey(e.target.value);
                                        if (isKeySaved) setIsKeySaved(false); // Reset saved status on edit
                                    }}
                                    placeholder="Enter Apify API Key"
                                    className={`w-full p-3 pl-4 border rounded-lg focus:outline-none focus:ring-2 transition-all ${isKeySaved ? 'bg-gray-50 text-gray-500 border-gray-200' : 'border-blue-300 focus:ring-blue-500 bg-white'}`}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={saveApiKey}
                                    className={`px-6 py-3 rounded-lg font-bold shadow-sm transition-all flex items-center gap-2 ${isKeySaved ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                >
                                    <FaSave /> {isKeySaved ? 'Update' : 'Save'}
                                </button>
                                {isKeySaved && (
                                    <button
                                        onClick={clearApiKey}
                                        className="px-4 py-3 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 font-bold border border-red-100 transition-all"
                                        title="Clear stored key"
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                        </div>
                        {!isKeySaved && <p className="text-sm text-gray-500 mt-2 ml-1">Get your key from <a href="https://console.apify.com/settings/integrations" target="_blank" className="text-blue-600 hover:underline">Apify Console</a></p>}
                    </div>

                    {/* Step 2: Analyze URL Section */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FaSearch className="text-gray-400" /> Analyze New Post
                            </h3>
                            <div className="flex flex-col md:flex-row gap-4">
                                <input
                                    type="text"
                                    value={postUrl}
                                    onChange={(e) => setPostUrl(e.target.value)}
                                    placeholder="Paste Facebook Post URL (e.g., https://www.facebook.com/...)"
                                    className="flex-grow p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700 placeholder-gray-400"
                                />
                                <button
                                    onClick={handleAnalyzeSubmit}
                                    disabled={loading}
                                    className="md:w-48 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {loading ? <FaSpinner className="animate-spin text-xl" /> : 'Analyze'}
                                </button>
                            </div>
                            {error && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center gap-3 animate-fade-in">
                                    <FaExclamationTriangle className="flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* History Section */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FaChartLine className="text-blue-500" /> Recent Analysis
                            </h2>
                            {history.length > 0 && (
                                <button
                                    onClick={() => setShowHistoryStats(true)}
                                    className="text-sm bg-white border border-blue-200 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    View Cumulative Stats
                                </button>
                            )}
                        </div>

                        {history.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 bg-white">
                                <FaSearch className="text-5xl mx-auto mb-4 opacity-20" />
                                <p>No posts analyzed yet. Enter a URL above to start.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                        <tr>
                                            <th className="p-4 font-semibold border-b">Post Info</th>
                                            <th className="p-4 font-semibold border-b text-center">Likes</th>
                                            <th className="p-4 font-semibold border-b text-center">Comments</th>
                                            <th className="p-4 font-semibold border-b text-center">Shares</th>
                                            <th className="p-4 font-semibold border-b">Last Updated</th>
                                            <th className="p-4 font-semibold border-b rounded-tr-lg">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {history.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/30 transition-colors group bg-white">
                                                <td className="p-4 max-w-xs">
                                                    <a href={item.post_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium block truncate mb-1" title={item.post_url}>
                                                        {item.post_url}
                                                    </a>
                                                    <span className="text-xs text-gray-400">ID: {item.id}</span>
                                                </td>
                                                <td className="p-4 text-center font-medium text-gray-700">{item.likes?.toLocaleString() || 0}</td>
                                                <td className="p-4 text-center font-medium text-gray-700">{item.comments_count?.toLocaleString() || 0}</td>
                                                <td className="p-4 text-center font-medium text-gray-700">{item.shares?.toLocaleString() || 0}</td>
                                                <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                                    {new Date(item.updatedAt).toLocaleDateString()}
                                                    <span className="block text-xs">{new Date(item.updatedAt).toLocaleTimeString()}</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => router.push(`/ai/social-analytics/${item.id}`)}
                                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <FaEye />
                                                        </button>
                                                        <button
                                                            onClick={() => handleTableUpdate(item.post_url, item.id)}
                                                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                            title="Update Data"
                                                        >
                                                            {updatingParams === item.id ? <FaSpinner className='animate-spin' /> : <FaSync />}
                                                        </button>
                                                        <button
                                                            onClick={() => deleteAnalysis(item.id)}
                                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Total Analysis Modal */}
                    {showHistoryStats && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto transform transition-all scale-100">
                                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                        <FaChartLine className="text-blue-600" />
                                        Cumulative Analysis
                                    </h2>
                                    <button
                                        onClick={() => setShowHistoryStats(false)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100"
                                    >
                                        <FaTimes size={24} />
                                    </button>
                                </div>

                                <div className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                                        <StatCard label="Total Posts" value={historyStats.posts} color="blue" />
                                        <StatCard label="Total Likes" value={historyStats.likes} color="indigo" />
                                        <StatCard label="Total Comments" value={historyStats.comments} color="green" />
                                        <StatCard label="Total Shares" value={historyStats.shares} color="purple" />
                                    </div>

                                    <div className="bg-white rounded-xl border p-6 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-700 mb-6">Engagement Overview per Post</h3>
                                        <div className="h-96">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={history.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="createdAt" tickFormatter={(time) => new Date(time).toLocaleDateString()} />
                                                    <YAxis />
                                                    <Tooltip
                                                        labelFormatter={(label) => new Date(label).toLocaleString()}
                                                        formatter={(value, name) => [value, name === 'comments_count' ? 'Comments' : name.charAt(0).toUpperCase() + name.slice(1)]}
                                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                    />
                                                    <Legend />
                                                    <Bar dataKey="likes" fill="#3B82F6" name="Likes" radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="comments_count" fill="#10B981" name="Comments" radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="shares" fill="#8B5CF6" name="Shares" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <p className="text-center text-gray-500 text-sm mt-4">Showing most recent 10 posts</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Conflict/Exists Modal */}
                    {showConflictModal && existingAnalysisData && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 transform transition-all">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                        <FaFacebook text-2xl />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">Post Already Exists</h2>
                                </div>
                                <p className="text-gray-600 mb-8 text-lg">
                                    This URL was previously analyzed on <b className='text-gray-800'>{new Date(existingAnalysisData.post_time).toLocaleDateString()}</b> at <b className='text-gray-800'>{new Date(existingAnalysisData.post_time).toLocaleTimeString()}</b>.
                                    <br /><br />
                                    What would you like to do?
                                </p>

                                <div className="flex flex-col gap-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={handlePromptView}
                                            className="px-6 py-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-bold text-lg border border-blue-200 flex flex-col items-center justify-center gap-1"
                                        >
                                            <FaEye className='text-xl' />
                                            View Report
                                        </button>
                                        <button
                                            onClick={handlePromptUpdate}
                                            className="px-6 py-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-bold text-lg shadow-lg shadow-indigo-200 flex flex-col items-center justify-center gap-1"
                                        >
                                            <FaSync className='text-xl' />
                                            Update Data
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setShowConflictModal(false)}
                                        className="mt-2 text-gray-400 hover:text-gray-600 font-medium py-2"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ProtectedRoute>
        </DefaultLayout>
    );
};

// Helper Component for Stats
const StatCard = ({ label, value, color }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200',
    };

    return (
        <div className={`${colorClasses[color]} p-6 rounded-xl border`}>
            <p className={`font-semibold mb-1 opacity-80`}>{label}</p>
            <p className="text-3xl font-bold text-gray-800">{value?.toLocaleString()}</p>
        </div>
    );
};

export default SocialAnalyticsPage;
