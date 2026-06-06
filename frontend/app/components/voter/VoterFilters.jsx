'use client'
import React from 'react'
import { FaFilter, FaTimes, FaSearch } from 'react-icons/fa'
import { divisions } from '@/app/utils/locationApi'

const VoterFilters = ({
    searchTerm,
    setSearchTerm,
    showFilters,
    setShowFilters,
    filters,
    handleFilterChange,
    clearFilters,
    districts,
    upazillas,
    unions,
    locationLoading
}) => {
    const hasActiveFilters = filters.division || filters.district || filters.upazilla || filters.union || searchTerm

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, NID, or phone number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${showFilters
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <FaFilter />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
                <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Division Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Division
                            </label>
                            <select
                                value={filters.division}
                                onChange={(e) => handleFilterChange('division', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="">All Divisions</option>
                                {divisions.map((division) => (
                                    <option key={division.id} value={division.id}>
                                        {division.name} ({division.bn_name})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* District Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                District
                            </label>
                            <select
                                value={filters.district}
                                onChange={(e) => handleFilterChange('district', e.target.value)}
                                disabled={!filters.division || locationLoading.districts}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">
                                    {locationLoading.districts ? 'Loading...' : 'All Districts'}
                                </option>
                                {Array.isArray(districts) &&
                                    districts.map((district) => (
                                        <option key={district.id} value={district.id}>
                                            {district.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Upazilla Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upazilla
                            </label>
                            <select
                                value={filters.upazilla}
                                onChange={(e) => handleFilterChange('upazilla', e.target.value)}
                                disabled={!filters.district || locationLoading.upazillas}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">
                                    {locationLoading.upazillas ? 'Loading...' : 'All Upazillas'}
                                </option>
                                {Array.isArray(upazillas) &&
                                    upazillas.map((upazilla) => (
                                        <option key={upazilla.id} value={upazilla.id}>
                                            {upazilla.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Union Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Union
                            </label>
                            <select
                                value={filters.union}
                                onChange={(e) => handleFilterChange('union', e.target.value)}
                                disabled={!filters.upazilla || locationLoading.unions}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">
                                    {locationLoading.unions ? 'Loading...' : 'All Unions'}
                                </option>
                                {Array.isArray(unions) &&
                                    unions.map((union) => (
                                        <option key={union.id} value={union.id}>
                                            {union.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Institution Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Institution
                            </label>
                            <input
                                type="text"
                                placeholder="Filter by institution..."
                                value={filters.organization || ''}
                                onChange={(e) => handleFilterChange('organization', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Profession Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Job / Profession
                            </label>
                            <input
                                type="text"
                                placeholder="Filter by job..."
                                value={filters.profession || ''}
                                onChange={(e) => handleFilterChange('profession', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Voter Category
                            </label>
                            <input
                                type="text"
                                placeholder="Filter by category..."
                                value={filters.category || ''}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                        >
                            <FaTimes />
                            Clear All Filters
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default VoterFilters