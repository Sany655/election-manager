'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    FaUsers,
    FaMapMarkerAlt,
    FaIdCard,
    FaVenusMars
} from 'react-icons/fa'
import {
    HiOfficeBuilding,
    HiUserGroup
} from 'react-icons/hi'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts'
import toast from 'react-hot-toast'
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import dynamic from 'next/dynamic'

// Dynamically import the map component so it doesn't load on server (fixes window not defined)
const VoterMap = dynamic(() => import('@/app/components/voter/overview/VoterMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">Loading Map...</div>
})

// --- Utility Functions ---

const englishToBengaliNumber = (num) => {
    if (num === undefined || num === null) return '০';
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(digit =>
        /\d/.test(digit) ? bengaliDigits[digit] : digit
    ).join('');
};

const bengaliToEnglishNumber = (str) => {
    if (!str) return 0;
    const cleanStr = str.toString().replace(/[\s,ΟO]/g, '0');
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    let englishStr = cleanStr;
    bengaliDigits.forEach((digit, index) => {
        englishStr = englishStr.split(digit).join(index);
    });
    return parseInt(englishStr) || 0;
};

// --- Components ---

const Card = ({ title, value, icon, gradient, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={`relative overflow-hidden rounded-2xl p-6 shadow-lg text-white ${gradient}`}
    >
        <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
                <h3 className="text-3xl font-bold">{value}</h3>
            </div>
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                {icon}
            </div>
        </div>
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
    </motion.div>
);

const VoterOverviewPage = () => {
    const [voters, setVoters] = useState([])
    const [voteCentres, setVoteCentres] = useState([])

    // Fetch voters and vote centres on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch Voters
                const votersResponse = await fetch('/frontapi/voters', { limit: 1000 })
                if (!votersResponse.ok) {
                    toast.error('Failed to fetch voters')
                } else {
                    const parsedVoters = (await votersResponse.json()).data.map(voter => ({
                        ...voter,
                        division: typeof voter.division === 'string' ? JSON.parse(voter.division) : voter.division,
                        district: typeof voter.district === 'string' ? JSON.parse(voter.district) : voter.district,
                        upazilla: typeof voter.upazilla === 'string' ? JSON.parse(voter.upazilla) : voter.upazilla,
                        union: typeof voter.union === 'string' ? JSON.parse(voter.union) : voter.union,
                    }))
                    setVoters(parsedVoters)
                }

                // Fetch Vote Centres
                const vcResponse = await fetch('/frontapi/vote-centres');
                if (vcResponse.ok) {
                    const vcResult = await vcResponse.json();
                    setVoteCentres(vcResult);
                } else {
                    console.error('Failed to fetch vote centres');
                }

            } catch (error) {
                console.error('Error loading data:', error)
                toast.error('Failed to load data. Please try again.')
            }
        }

        loadData()
    }, [])


    // Voter Analytics
    const analytics = useMemo(() => {
        const total = voters.length
        const male = voters.filter(v => v.gender === 'Male').length
        const female = voters.filter(v => v.gender === 'Female').length
        const uniqueDivisions = new Set(voters.map(v => v.division_id || v.division?.id)).size
        const totalAge = voters.reduce((acc, curr) => acc + (Number(curr.age) || 0), 0)
        const avgAge = total > 0 ? Math.round(totalAge / total) : 0

        return { total, male, female, uniqueDivisions, avgAge }
    }, [voters])

    // Vote Centre Analytics
    const vcStats = useMemo(() => {
        const flatData = voteCentres.map(item => ({
            ...item,
            parsedTotalVoters: bengaliToEnglishNumber(item.total_voters),
            parsedMaleVoters: bengaliToEnglishNumber(item.male_voters),
            parsedFemaleVoters: bengaliToEnglishNumber(item.female_voters),
            parsedBoothCount: bengaliToEnglishNumber(item.booth_count)
        }));

        const totalCentres = flatData.length;
        const totalVoters = flatData.reduce((acc, curr) => acc + curr.parsedTotalVoters, 0);
        const totalMale = flatData.reduce((acc, curr) => acc + curr.parsedMaleVoters, 0);
        const totalFemale = flatData.reduce((acc, curr) => acc + curr.parsedFemaleVoters, 0);
        const totalBooths = flatData.reduce((acc, curr) => acc + curr.parsedBoothCount, 0);

        return { totalCentres, totalVoters, totalMale, totalFemale, totalBooths, flatData };
    }, [voteCentres]);

    const vcChartData = useMemo(() => {
        // Group by upazilla (was union in previous code but logic used upozilla_name)
        const groups = {};
        vcStats.flatData.forEach(item => {
            const key = item.upozilla_name || 'N/A';
            if (!groups[key]) {
                groups[key] = 0;
            }
            groups[key] += item.parsedTotalVoters;
        });

        return Object.keys(groups).map(key => ({
            name: key,
            voters: groups[key]
        }));
    }, [vcStats]);

    const vcPieData = [
        { name: 'Male', value: vcStats.totalMale },
        { name: 'Female', value: vcStats.totalFemale },
    ];
    const COLORS = ['#6366f1', '#ec4899'];

    return (
        <DefaultLayout title='Overview'>
            <div className="space-y-8">

                {/* Section: Voter Analytics */}
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Real-time Voter Insights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <FaUsers size={20} />
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Registered Voters</p>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{analytics.total.toLocaleString()}</h3>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-pink-600">
                                <FaVenusMars size={20} />
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Gender Ratio</p>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    {analytics.male} <span className="text-sm text-gray-400 font-normal">M</span> / {analytics.female} <span className="text-sm text-gray-400 font-normal">F</span>
                                </h3>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                <FaMapMarkerAlt size={20} />
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Divisions</p>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{analytics.uniqueDivisions} / 8</h3>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                                <FaIdCard size={20} />
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Avg. Voter Age</p>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{analytics.avgAge} Yrs</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Vote Centre Analytics */}
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Vote Centre Statistics</h2>

                    {/* Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card
                            title="Total Centres"
                            value={englishToBengaliNumber(vcStats.totalCentres)}
                            icon={<HiOfficeBuilding className="text-2xl" />}
                            gradient="bg-gradient-to-br from-violet-500 to-purple-600"
                            delay={0}
                        />
                        <Card
                            title="Total Centre Voters"
                            value={englishToBengaliNumber(vcStats.totalVoters)}
                            icon={<HiUserGroup className="text-2xl" />}
                            gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
                            delay={0.1}
                        />
                        <Card
                            title="Male Voters (Centre)"
                            value={englishToBengaliNumber(vcStats.totalMale)}
                            icon={<span className="text-xl font-bold">♂</span>}
                            gradient="bg-gradient-to-br from-indigo-500 to-blue-600"
                            delay={0.2}
                        />
                        <Card
                            title="Female Voters (Centre)"
                            value={englishToBengaliNumber(vcStats.totalFemale)}
                            icon={<span className="text-xl font-bold">♀</span>}
                            gradient="bg-gradient-to-br from-pink-500 to-rose-600"
                            delay={0.3}
                        />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"
                        >
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Vote Centre Voters by Upazilla</h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={vcChartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                        <Tooltip
                                            cursor={{ fill: '#f1f5f9' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="voters" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"
                        >
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Centre Gender Distribution</h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={vcPieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {vcPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Male</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-pink-500" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Female</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Section: Map */}
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Geographic Distribution</h2>
                    <div className="h-[calc(100vh-240px)] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        <VoterMap voters={voters} />
                    </div>
                </div>

            </div>
        </DefaultLayout>
    )
}

export default VoterOverviewPage
