'use client';

import React, { useState, useEffect } from "react";
import DefaultLayout from "../../components/layout/DefaultLayout";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Loader from "../../components/Loader";
import { useAuthContext } from "@/app/context/auth_context";
import {
  FaUsers,
  FaUserCheck,
  FaCalendarAlt,
  FaChartLine,
  FaUsersCog,
  FaMobile,
  FaVoteYea,
  FaShieldAlt,
  FaMoneyBillWave,
  FaTrophy,
  FaExclamationTriangle,
  FaBullhorn,
  FaMapMarkedAlt,
  FaComments,
  FaImage,
  FaFire,
  FaArrowRight
} from "react-icons/fa";
import Link from "next/link";

// Icon mapping for dynamic content
const iconMap = {
  FaCalendarAlt,
  FaUsersCog,
  FaUsers,
  FaComments,
  FaShieldAlt,
  FaChartLine
};

export default function DashboardPage() {
  const { hasPermission } = useAuthContext();
  const [stats, setStats] = useState({
    voterStats: {
      totalVoters: 0,
      targetedVoters: 0,
      reachedVoters: 0
    },
    events: { upcoming: 0 },
    volunteers: { active: 0, total: 0 },
    pollingBooths: 0,
    communication: { smsSent: 0 },
    areaPerformance: [],
    recentActivities: [],
    socialAnalytics: { engagementScore: 0, sentimentScore: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/frontapi/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data || {
            voterStats: {
              totalVoters: 0,
              targetedVoters: 0,
              reachedVoters: 0
            },
            candidates: { total: 0 },
            events: { upcoming: 0 },
            volunteers: { active: 0, total: 0 },
            pollingBooths: 0,
            peopleReached: 0,
            communication: { smsSent: 0 },
            areaPerformance: [],
            recentActivities: [],
            socialAnalytics: { engagementScore: 0, sentimentScore: 0 }
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const modules = [
    {
      name: "Social Engagement",
      icon: FaFire,
      color: "from-blue-500 to-blue-600",
      stats: { score: stats.socialAnalytics?.engagementScore || 0, label: "Interactions" },
      link: "/ai/social-analytics",
      permission: "view-social-analytics"
    },
    {
      name: "Social Sentiment",
      icon: FaComments,
      color: "from-indigo-500 to-indigo-600",
      stats: { score: `${stats.socialAnalytics?.sentimentScore || 0}%`, label: "Positive" },
      link: "/ai/social-analytics",
      permission: "view-social-analytics"
    },
    {
      name: "Voter Coverage",
      icon: FaMapMarkedAlt,
      color: "from-green-500 to-green-600",
      stats: { score: stats.voterStats.targetedVoters > 0 ? Math.round((stats.voterStats.reachedVoters / stats.voterStats.targetedVoters) * 100) : 0, label: "% Covered" },
      link: "/voter-management/overview",
      permission: "view-voter-overview"
    },
    {
      name: "Communication",
      icon: FaComments,
      color: "from-purple-500 to-purple-600",
      stats: { score: stats.communication.smsSent, label: "Messages" },
      link: "/communication/sms",
      permission: "view-sms"
    },
    {
      name: "Events",
      icon: FaCalendarAlt,
      color: "from-orange-500 to-orange-600",
      stats: { score: stats.events.upcoming, label: "Upcoming" },
      link: "/event/overview",
      permission: "view-event-overview"
    },
    {
      name: "Volunteers",
      icon: FaUsersCog,
      color: "from-teal-500 to-teal-600",
      stats: { score: stats.volunteers.active, label: "Active" },
      link: "/volunteer/overview",
      permission: "view-volunteer-overview"
    },
    {
      name: "Total Voters",
      icon: FaUsers,
      color: "from-pink-500 to-pink-600",
      stats: { score: stats.voterStats.totalVoters, label: "Collected" },
      link: "/voter-management/voters",
      permission: "view-voters"
    },
    {
      name: "Vote Centres",
      icon: FaVoteYea,
      color: "from-red-500 to-red-600",
      stats: { score: stats.pollingBooths, label: "Total Centres" },
      link: "/voter-management/vote-centres",
      permission: "view-vote-centres"
    }
  ];

  const allowedModules = modules.filter(module => !module.permission || hasPermission(module.permission));

  return (
    <DefaultLayout title="Dashboard">
      <ProtectedRoute permissions={['view-dashboard']}>
        {loading ? (
          <Loader />
        ) : (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                    <FaTrophy className="text-yellow-500" />
                    Smart Election Digital Platform
                  </h1>
                  {/* <p className="text-gray-600 dark:text-gray-400">
                    Campaign Command Center - {stats.candidate.constituency}
                  </p> */}
                </div>
                {/* <div className="mt-4 md:mt-0 flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Candidate</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{stats.candidate.name}</p>
                  </div>
                  {stats.candidate.photo ? (
                    <img src={stats.candidate.photo} alt={stats.candidate.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg" />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {stats.candidate.name.charAt(0)}
                    </div>
                  )}
                </div> */}
              </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <FaUsers className="text-6xl text-blue-600" />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4">
                    <FaUsers className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stats.voterStats?.totalVoters || 0}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Voters</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <FaUserCheck className="text-6xl text-purple-600" />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mb-4">
                    <FaUserCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stats.candidates?.total || 0}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Candidates</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <FaUsersCog className="text-6xl text-teal-600" />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center mb-4">
                    <FaUsersCog className="w-6 h-6 text-teal-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stats.volunteers?.total || 0}
                  </p>
                  <div className="flex justify-between items-end">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Volunteers</p>
                    <span className="text-xs text-teal-600 font-medium">{stats.volunteers?.active || 0} Active</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <FaVoteYea className="text-6xl text-red-600" />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center mb-4">
                    <FaVoteYea className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stats.pollingBooths || 0}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Polling Centres</p>
                </div>
              </div>
            </div>

            {/* Module Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {allowedModules.map((module, index) => (
                <Link
                  key={index} href={module.link}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center shadow-md mb-4`}>
                    <module.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    {module.name}
                  </h3>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {module.stats.score}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {module.stats.label}
                      </p>
                    </div>
                    <FaArrowRight className="text-gray-400 hover:text-gray-600" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Area & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Area Performance */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FaMapMarkedAlt className="text-blue-600" />
                    Area Performance (Top Areas)
                  </h3>
                </div>

                <div className="space-y-4">
                  {stats.areaPerformance && stats.areaPerformance.length > 0 ? stats.areaPerformance.map((area, idx) => (
                    <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${area.color || 'bg-blue-500'}`}></div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{area.area}</p>
                            <p className="text-xs text-gray-500">{area.voters.toLocaleString()} voters collected</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{area.score}</p>
                          <p className="text-xs text-gray-500">Predicted Score</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${area.color || 'bg-blue-500'}`}
                          style={{ width: `${area.score}%` }}
                        ></div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-sm">No voter data available by area.</p>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <FaFire className="text-orange-600" />
                  Recent Stats
                </h3>
                <div className="space-y-4">
                  {stats.recentActivities && stats.recentActivities.length > 0 ? stats.recentActivities.map((activity, idx) => {
                    const Icon = iconMap[activity.icon] || FaChartLine;
                    return (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <Icon className={`w-5 h-5 mt-1 ${activity.color}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.text}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    );
                  }) : (
                    <p className="text-gray-500 text-sm">No recent activity.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Alerts & Warnings Mock - Hidden
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-l-4 border-yellow-500 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <FaExclamationTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    System Alerts
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span>• Check upcoming events resources.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>• Verify new voter registration batch.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            */}

          </div>
        )}
      </ProtectedRoute>
    </DefaultLayout>
  );
}
