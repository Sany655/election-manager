'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import { FaFacebook, FaSpinner, FaArrowLeft, FaThumbsUp, FaComment, FaShare } from 'react-icons/fa';
import DefaultLayout from '@/app/components/layout/DefaultLayout';
import ProtectedRoute from '@/app/components/ProtectedRoute';

const SocialAnalysisDetailPage = ({ params }) => {
    const router = useRouter();
    const { id } = params;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    // Modern color palette
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

    // Specific colors for sentiment
    const SENTIMENT_COLORS = {
        'positive': '#00C49F',
        'very positive': '#0088FE',
        'neutral': '#8884d8',
        'negative': '#FFBB28',
        'very negative': '#FF8042'
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await fetch(`/frontapi/social-analytics?id=${id}`);
                if (!response.ok) {
                    throw new Error('Failed to load analysis details');
                }
                const result = await response.json();
                console.log('Analysis Data:', result);
                setData(result);
            } catch (err) {
                console.error(err);
                setError('Could not load analysis details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const chartsData = useMemo(() => {
        if (!data) return {
            emotionData: [],
            intentData: [],
            sentimentData: [],
            toneData: [],
            engagementData: [],
            topWordsData: [],
            hashtagsData: []
        };

        const comments = Array.isArray(data.comments_data) ? data.comments_data : [];

        // Helper to count frequencies
        const countBy = (arr, key) => {
            const counts = {};
            arr.forEach(item => {
                const val = item[key] ? item[key].toLowerCase() : 'unknown';
                counts[val] = (counts[val] || 0) + 1;
            });
            return Object.keys(counts).map(k => ({
                name: k.charAt(0).toUpperCase() + k.slice(1),
                value: counts[k]
            })).sort((a, b) => b.value - a.value);
        };

        const emotionData = countBy(comments, 'emotion');
        const intentData = countBy(comments, 'intent');
        const sentimentData = countBy(comments, 'sentiment');
        const toneData = countBy(comments, 'tone');

        const engagementData = [
            { name: 'Likes', value: data.post_data?.likes || 0, fill: '#0088FE' },
            { name: 'Shares', value: data.post_data?.shares || 0, fill: '#FF8042' },
            { name: 'Comments', value: data.post_data?.comments || 0, fill: '#00C49F' }
        ];

        const topWordsData = (data.top_words || []).slice(0, 15).map(w => ({ name: w.word, value: w.count }));
        const hashtagsData = (data.hashtags || []).slice(0, 15).map(h => ({ name: h.hashtag, value: h.count }));

        return { emotionData, intentData, sentimentData, toneData, engagementData, topWordsData, hashtagsData };
    }, [data]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 shadow-xl rounded-lg">
                    <p className="font-semibold text-gray-700">{label || payload[0].name}</p>
                    <p className="text-gray-600">Count: <span className="font-bold text-blue-600">{payload[0].value}</span></p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <DefaultLayout title="Social Media Analytics">
                <div className="flex justify-center items-center h-screen">
                    <FaSpinner className="animate-spin text-5xl text-blue-600" />
                </div>
            </DefaultLayout>
        );
    }

    if (error) {
        return (
            <DefaultLayout title="Social Media Analytics">
                <div className="p-6 text-center">
                    <p className="text-red-500 text-xl">{error}</p>
                    <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">Go Back</button>
                </div>
            </DefaultLayout>
        );
    }

    if (!data) return null;

    return (
        <DefaultLayout title="Social Media Analytics">
            <ProtectedRoute permissions={['view-social-analytics']}>
                <div className="p-6 max-w-7xl mx-auto">
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <button
                                onClick={() => router.push('/ai/social-analytics')}
                                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-2"
                            >
                                <FaArrowLeft /> Back to Dashboard
                            </button>
                            <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
                                <FaFacebook className="text-blue-600" />
                                Analysis Report
                            </h1>
                        </div>
                        {data.post_data?.timestamp && (
                            <div className="text-right text-sm text-gray-500">
                                <p>Posted: {new Date(data.post_data.timestamp).toLocaleString()}</p>
                                <p>Analyzed: {new Date(data.post_data.timestamp).toLocaleDateString()}</p>
                            </div>
                        )}
                    </div>

                    {/* Post Content Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                        <h3 className="font-bold text-gray-800 mb-3 text-lg">Post Content</h3>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{data.post_data?.content}</p>
                    </div>

                    <div className="space-y-8 animate-fade-in-up mb-12">

                        {/* Row 1: Pie Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Comment Sentiment */}
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                <h2 className="text-xl font-bold mb-4 text-gray-700">Comment Sentiment</h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartsData.sentimentData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                                            >
                                                {chartsData.sentimentData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.name.toLowerCase()] || COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend verticalAlign="middle" align="right" layout="vertical" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Comment Emotion */}
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                <h2 className="text-xl font-bold mb-4 text-gray-700">Comment Emotion</h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartsData.emotionData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                                            >
                                                {chartsData.emotionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend verticalAlign="middle" align="right" layout="vertical" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Pie Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Comment Tone */}
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                <h2 className="text-xl font-bold mb-4 text-gray-700">Comment Tone</h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartsData.toneData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                                            >
                                                {chartsData.toneData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend verticalAlign="middle" align="right" layout="vertical" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Comment Intent */}
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                <h2 className="text-xl font-bold mb-4 text-gray-700">Comment Intent</h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartsData.intentData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                                            >
                                                {chartsData.intentData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend verticalAlign="middle" align="right" layout="vertical" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Bar Charts (Engagement & Emotions) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Engagement Metrics */}
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                <h2 className="text-xl font-bold mb-4 text-gray-700">Engagement Metrics</h2>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartsData.engagementData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} />
                                            <Tooltip cursor={{ fill: '#f3f4f6' }} content={<CustomTooltip />} />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                {chartsData.engagementData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                                <LabelList dataKey="value" position="top" />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Comment Emotions Bar */}
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                <h2 className="text-xl font-bold mb-4 text-gray-700">Comment Emotions</h2>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartsData.emotionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} />
                                            <Tooltip cursor={{ fill: '#f3f4f6' }} content={<CustomTooltip />} />
                                            <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                                                {chartsData.emotionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                                <LabelList dataKey="value" position="top" />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Row 4: Bar Charts (Words & Hashtags) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Top Words */}
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                <h2 className="text-xl font-bold mb-4 text-gray-700">Top Words (Post + Comments)</h2>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartsData.topWordsData} margin={{ top: 0, right: 0, left: 0, bottom: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" interval={0} angle={-90} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
                                            <YAxis />
                                            <Tooltip cursor={{ fill: '#f3f4f6' }} content={<CustomTooltip />} />
                                            <Bar dataKey="value" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Top Hashtags */}
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                <h2 className="text-xl font-bold mb-4 text-gray-700">Top Hashtags</h2>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartsData.hashtagsData} margin={{ top: 0, right: 0, left: 0, bottom: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" interval={0} angle={-90} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
                                            <YAxis />
                                            <Tooltip cursor={{ fill: '#f3f4f6' }} content={<CustomTooltip />} />
                                            <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>


                        {/* Detailed Comments Table */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                            <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Analyzed Comments</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-700">
                                            <th className="p-4 border-b font-semibold rounded-tl-lg">User</th>
                                            <th className="p-4 border-b font-semibold w-5/12">Comment</th>
                                            <th className="p-4 border-b font-semibold">Sentiment</th>
                                            <th className="p-4 border-b font-semibold">Emotion</th>
                                            <th className="p-4 border-b font-semibold">Intent</th>
                                            <th className="p-4 border-b font-semibold">Tone</th>
                                            <th className="p-4 border-b font-semibold rounded-tr-lg text-center">Likes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(Array.isArray(data.comments_data) ? data.comments_data : []).map((comment, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 border-b last:border-0 transition-colors">
                                                <td className="p-4 font-medium text-gray-900 whitespace-nowrap">{comment.user_name}</td>
                                                <td className="p-4 text-gray-600 text-sm">{comment.comment_text}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${(comment.sentiment || '').toLowerCase().includes('positive') ? 'bg-green-100 text-green-700' :
                                                        (comment.sentiment || '').toLowerCase().includes('negative') ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {comment.sentiment}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">{comment.emotion}</td>
                                                <td className="p-4 text-sm text-gray-600">{comment.intent}</td>
                                                <td className="p-4 text-sm text-gray-600">{comment.tone}</td>
                                                <td className="p-4 text-gray-600 font-semibold text-center">{comment.likes_count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        </DefaultLayout>
    );
};

export default SocialAnalysisDetailPage;
