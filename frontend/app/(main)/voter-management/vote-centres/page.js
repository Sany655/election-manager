'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    HiSearch,
    HiChevronLeft,
    HiChevronRight,
    HiPlus,
    HiPencil,
    HiTrash,
    HiRefresh
} from 'react-icons/hi';
import DefaultLayout from '@/app/components/layout/DefaultLayout';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import VoteCentreModal from '@/app/components/voter/VoteCentreModal';
import { toast } from 'react-hot-toast';
import {
    fetchDivisions,
    fetchDistricts,
    fetchUpazillas
} from '@/app/utils/locationApi';

// --- Utility Functions ---

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

// --- Main Page Component ---

function VoteCentres() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('All');

    // Location Filter State
    const [divisions, setDivisions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [upazillas, setUpazillas] = useState([]);

    const [selectedDivision, setSelectedDivision] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedUpazilla, setSelectedUpazilla] = useState('All');

    const [locationLoading, setLocationLoading] = useState({
        districts: false,
        upazillas: false
    });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCentre, setCurrentCentre] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/frontapi/vote-centres');
            if (res.ok) {
                const result = await res.json();
                setData(result);
            }
        } catch (error) {
            console.error('Failed to fetch vote centres:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const loadDivisions = async () => {
            const divisionData = await fetchDivisions();
            setDivisions(divisionData);
        };
        loadDivisions();
    }, []);

    // Location Handlers
    const handleDivisionChange = async (e) => {
        const divisionId = e.target.value;
        setSelectedDivision(divisionId);
        setSelectedDistrict('');
        setSelectedUpazilla('All');
        setDistricts([]);
        setUpazillas([]);

        if (divisionId) {
            setLocationLoading(prev => ({ ...prev, districts: true }));
            try {
                const fetchedDistricts = await fetchDistricts(divisionId);
                setDistricts(fetchedDistricts);
            } catch (error) {
                console.error("Failed to fetch districts", error);
                toast.error("Failed to load districts");
            } finally {
                setLocationLoading(prev => ({ ...prev, districts: false }));
            }
        }
    };

    const handleDistrictChange = async (e) => {
        const districtId = e.target.value;
        setSelectedDistrict(districtId);
        setSelectedUpazilla('All');
        setUpazillas([]);

        if (districtId) {
            setLocationLoading(prev => ({ ...prev, upazillas: true }));
            try {
                const fetchedUpazillas = await fetchUpazillas(districtId);
                setUpazillas(fetchedUpazillas);
            } catch (error) {
                console.error("Failed to fetch upazillas", error);
                toast.error("Failed to load upazillas");
            } finally {
                setLocationLoading(prev => ({ ...prev, upazillas: false }));
            }
        }
    };

    const handleUpazillaChange = (e) => {
        setSelectedUpazilla(e.target.value);
    };

    const clearFilters = () => {
        setSelectedDivision('');
        setSelectedDistrict('');
        setSelectedUpazilla('All');
        setSearchTerm('');
        setSelectedType('All');
    };

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // --- Flatten Data for Table & Search ---
    const flatData = useMemo(() => {
        return data.map((item, idx) => ({
            ...item,
            // Handle both field names for compatibility
            upozillaName: item.upozilla_name,
            upozillaType: item.type,
            originalCentreIdx: idx,
            parsedTotalVoters: bengaliToEnglishNumber(item.total_voters),
            parsedMaleVoters: bengaliToEnglishNumber(item.male_voters),
            parsedFemaleVoters: bengaliToEnglishNumber(item.female_voters),
            voters: {
                total: item.total_voters,
                male: item.male_voters,
                female: item.female_voters,
                hijra: item.hijra_voters
            }
        }));
    }, [data]);

    const filteredData = useMemo(() => {
        return flatData.filter(item => {
            const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.voter_area?.toLowerCase().includes(searchTerm.toLowerCase());

            // Filter by Upazilla if one is specifically selected from the API dropdown
            let matchesLocation = true;
            if (selectedUpazilla !== 'All') {
                // Try to match the selected Upazilla name case-insensitively
                matchesLocation = item.upozillaName?.toLowerCase() === selectedUpazilla.toLowerCase();
            }

            let matchesType = true;
            if (selectedType !== 'All') {
                if (selectedType === 'Male') matchesType = item.remarks?.includes('পুরুষ');
                else if (selectedType === 'Female') matchesType = item.remarks?.includes('মহিলা');
                else if (selectedType === 'Both') matchesType = item.remarks?.includes('উভয়');
            }

            return matchesSearch && matchesLocation && matchesType;
        });
    }, [flatData, searchTerm, selectedUpazilla, selectedType]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedUpazilla, selectedType]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // --- Handlers ---

    const handleAdd = () => {
        setCurrentCentre(null);
        setIsModalOpen(true);
    };

    const handleEdit = (centre) => {
        setCurrentCentre(centre);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this vote centre?')) return;

        try {
            const res = await fetch(`/frontapi/vote-centres/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success('Vote centre deleted successfully');
                fetchData();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Failed to delete');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete');
        }
    };

    const handleModalSubmit = async (formData) => {
        try {
            const url = currentCentre
                ? `/frontapi/vote-centres/${currentCentre.id}`
                : '/frontapi/vote-centres';
            const method = currentCentre ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(currentCentre ? 'Updated successfully' : 'Created successfully');
                setIsModalOpen(false);
                fetchData();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Operation failed');
        }
    };

    // --- Render ---

    return (
        <DefaultLayout title="Vote Centres">
            <ProtectedRoute permissions={['view-vote-centres']}>
                <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 font-sans p-6 space-y-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Vote Centres</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage voting locations and voter statistics</p>
                        </div>

                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 font-medium"
                        >
                            <HiPlus size={20} />
                            <span>Add Centre</span>
                        </button>
                    </div>

                    {/* Filters & Actions */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-4">
                        <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                            {/* Search */}
                            <div className="relative w-full xl:w-96">
                                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search centres or areas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-200 placeholder-slate-400"
                                />
                            </div>

                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors self-end xl:self-auto"
                            >
                                <HiRefresh size={18} />
                                Reset Filters
                            </button>
                        </div>

                        {/* Advanced Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Division Filter */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Division</label>
                                <select
                                    value={selectedDivision}
                                    onChange={handleDivisionChange}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-200 text-sm"
                                >
                                    <option value="">All Divisions</option>
                                    {divisions.map(div => (
                                        <option key={div.id} value={div.id}>{div.name} ({div.bn_name})</option>
                                    ))}
                                </select>
                            </div>

                            {/* District Filter */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">District</label>
                                <select
                                    value={selectedDistrict}
                                    onChange={handleDistrictChange}
                                    disabled={!selectedDivision || locationLoading.districts}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-200 text-sm disabled:opacity-50"
                                >
                                    <option value="">{locationLoading.districts ? 'Loading...' : 'All Districts'}</option>
                                    {districts.map(dist => (
                                        <option key={dist.id} value={dist.id}>{dist.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Upazilla Filter */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Upazilla</label>
                                <select
                                    value={selectedUpazilla}
                                    onChange={handleUpazillaChange}
                                    disabled={!selectedDistrict || locationLoading.upazillas}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-200 text-sm disabled:opacity-50"
                                >
                                    <option value="All">{locationLoading.upazillas ? 'Loading...' : 'All Upazillas'}</option>
                                    {upazillas.map(upz => (
                                        <option key={upz.id} value={upz.name}>{upz.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Type Filter */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Centre Type</label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-200 text-sm"
                                >
                                    <option value="All">All Types</option>
                                    <option value="Male">Male (পুরুষ)</option>
                                    <option value="Female">Female (মহিলা)</option>
                                    <option value="Both">Both (উভয়)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                                        <th className="p-4">SL</th>
                                        <th className="p-4">Centre Name</th>
                                        <th className="p-4">Upazilla</th>
                                        <th className="p-4">Voter Area</th>
                                        <th className="p-4 text-center">Booths</th>
                                        <th className="p-4 text-right">Voters</th>
                                        <th className="p-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {paginatedData.map((item, idx) => (
                                        <tr key={item.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4 text-slate-500 dark:text-slate-400 font-medium">{item.serial}</td>
                                            <td className="p-4">
                                                <p className="font-semibold text-slate-800 dark:text-slate-200 max-w-xs">{item.name}</p>
                                                <p className="text-xs text-slate-400 mt-1">{item.remarks}</p>
                                            </td>
                                            <td className="p-4 text-slate-600 dark:text-slate-300">
                                                <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs font-semibold">
                                                    {item.upozillaName}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs text-sm">{item.voter_area}</td>
                                            <td className="p-4 text-center text-slate-600 dark:text-slate-300">{item.booth_count}</td>
                                            <td className="p-4 text-right">
                                                <div className="font-bold text-slate-800 dark:text-slate-200">{item.voters.total}</div>
                                                <div className="text-xs text-slate-500 mt-1 flex justify-end gap-2">
                                                    <span title="Male Voters">♂ {item.voters.male || '-'}</span>
                                                    <span title="Female Voters">♀ {item.voters.female || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <HiPencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <HiTrash size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredData.length === 0 && (
                                <div className="p-12 text-center text-slate-400">
                                    No voting centres found matching your criteria.
                                </div>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {filteredData.length > 0 && (
                            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    Showing <span className="font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-bold">{filteredData.length}</span> results
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Previous Page"
                                    >
                                        <HiChevronLeft size={20} />
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            // Simplified pagination logic for display
                                            let pageNum = i + 1;
                                            if (totalPages > 5 && currentPage > 3) {
                                                pageNum = currentPage - 2 + i;
                                                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Next Page"
                                    >
                                        <HiChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    <VoteCentreModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={handleModalSubmit}
                        initialData={currentCentre}
                    />

                </div>
            </ProtectedRoute>
        </DefaultLayout>
    );
}

export default VoteCentres;