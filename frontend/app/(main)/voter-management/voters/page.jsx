'use client'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { FaUsers, FaPlus, FaFileUpload, FaFilter } from 'react-icons/fa'
import toast from 'react-hot-toast'
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import VoterCard from '@/app/components/voter/VoterCard'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import VoterAddModal from '@/app/components/voter/VoterAddModal'
import VoterFilters from '@/app/components/voter/VoterFilters'
import VoterPagination from '@/app/components/voter/VoterPagination'
import {
    fetchDistricts as fetchDistrictsApi,
    fetchUpazillas as fetchUpazillasApi,
    fetchUnions as fetchUnionsApi
} from '@/app/utils/locationApi'

const VoterPage = () => {
    // Data state
    const [voters, setVoters] = useState([])
    const [totalCount, setTotalCount] = useState(0)
    const [filteredCount, setFilteredCount] = useState(0)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(20)
    const [totalPages, setTotalPages] = useState(1)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [hasPrevPage, setHasPrevPage] = useState(false)

    // UI state
    const [searchTerm, setSearchTerm] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedVoter, setSelectedVoter] = useState(null)
    const [loading, setLoading] = useState(true)

    // Location filter states
    const [filters, setFilters] = useState({
        division: '',
        district: '',
        upazilla: '',
        union: ''
    })

    // Location data state
    const [districts, setDistricts] = useState([])
    const [upazillas, setUpazillas] = useState([])
    const [unions, setUnions] = useState([])
    const [locationLoading, setLocationLoading] = useState({
        districts: false,
        upazillas: false,
        unions: false
    })

    // Memoized stats calculation
    const stats = useMemo(() => [
        {
            title: 'Total Voters',
            value: totalCount.toLocaleString(),
            icon: FaUsers,
            color: 'bg-blue-500',
            lightBg: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            title: 'Filtered Voters',
            value: filteredCount.toLocaleString(),
            icon: FaFilter,
            color: 'bg-green-500',
            lightBg: 'bg-green-50',
            textColor: 'text-green-600'
        }
    ], [totalCount, filteredCount])

    // Fetch voters with server-side filtering and pagination
    const fetchVoters = useCallback(async () => {
        try {
            setLoading(true)

            const apiFilters = {
                page: currentPage,
                limit: itemsPerPage,
                search: searchTerm,
                division_id: filters.division,
                district_id: filters.district,
                upazilla_id: filters.upazilla,
                union_id: filters.union
            }
            // Create query string from non-empty filters
            const queryParams = new URLSearchParams()
            Object.entries(apiFilters).forEach(([key, value]) => {
                if (value !== null && value !== '' && value !== undefined) {
                    queryParams.append(key, value)
                }
            })

            const response = await fetch(`/frontapi/voters/?${queryParams.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (response.ok) {
                const data = await response.json()
                setVoters(data.data)

                // Handle pagination structure
                if (data.pagination) {
                    setTotalCount(data.pagination.totalVoters || 0)
                    setFilteredCount(data.pagination.totalFiltered || 0)
                    setTotalPages(data.pagination.totalPages || 1)
                    setHasNextPage(data.pagination.hasNextPage || false)
                    setHasPrevPage(data.pagination.hasPrevPage || false)
                } else {
                    // Fallback for old response structure
                    setTotalCount(data.totalVoters || 0)
                    setFilteredCount(data.total || 0)
                    setTotalPages(data.totalPages || 1)
                }
            } else {
                toast.error('Failed to fetch voters')
                setVoters([])
                setTotalCount(0)
                setFilteredCount(0)
            }
        } catch (error) {
            console.error('Error loading voters:', error)
            toast.error('Failed to load voters. Please try again.')
            setVoters([])
        } finally {
            setLoading(false)
        }
    }, [currentPage, itemsPerPage, searchTerm, filters])

    // Location data fetchers
    const fetchDistricts = useCallback(async (divisionId) => {
        if (!divisionId) {
            setDistricts([])
            setUpazillas([])
            setUnions([])
            return
        }

        try {
            setLocationLoading((prev) => ({ ...prev, districts: true }))
            const data = await fetchDistrictsApi(divisionId)
            setDistricts(data)
            setUpazillas([])
            setUnions([])
        } catch (error) {
            console.error('Error fetching districts:', error)
            setDistricts([])
        } finally {
            setLocationLoading((prev) => ({ ...prev, districts: false }))
        }
    }, [])

    const fetchUpazillas = useCallback(async (districtId) => {
        if (!districtId) {
            setUpazillas([])
            setUnions([])
            return
        }

        try {
            setLocationLoading((prev) => ({ ...prev, upazillas: true }))
            const data = await fetchUpazillasApi(districtId)
            setUpazillas(data)
            setUnions([])
        } catch (error) {
            console.error('Error fetching upazillas:', error)
            setUpazillas([])
        } finally {
            setLocationLoading((prev) => ({ ...prev, upazillas: false }))
        }
    }, [])

    const fetchUnions = useCallback(async (upazillaId) => {
        if (!upazillaId) {
            setUnions([])
            return
        }

        try {
            setLocationLoading((prev) => ({ ...prev, unions: true }))
            const data = await fetchUnionsApi(upazillaId)
            setUnions(data)
        } catch (error) {
            console.error('Error fetching unions:', error)
            setUnions([])
        } finally {
            setLocationLoading((prev) => ({ ...prev, unions: false }))
        }
    }, [])

    // Filter change handler
    const handleFilterChange = useCallback((filterName, value) => {
        // Cascade resets similar to the voter form
        if (filterName === 'division') {
            setFilters(prev => ({
                ...prev,
                division: value,
                district: '',
                upazilla: '',
                union: ''
            }))
            fetchDistricts(value)
            return
        }

        if (filterName === 'district') {
            setFilters(prev => ({
                ...prev,
                district: value,
                upazilla: '',
                union: ''
            }))
            fetchUpazillas(value)
            return
        }

        if (filterName === 'upazilla') {
            setFilters(prev => ({
                ...prev,
                upazilla: value,
                union: ''
            }))
            fetchUnions(value)
            return
        }

        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }))
    }, [fetchDistricts, fetchUpazillas, fetchUnions])

    const clearFilters = useCallback(() => {
        setFilters({
            division: '',
            district: '',
            upazilla: '',
            union: ''
        })
        setSearchTerm('')
        setDistricts([])
        setUpazillas([])
        setUnions([])
    }, [])

    // Voter CRUD handlers
    const handleAddVoter = useCallback(() => {
        setSelectedVoter(null)
        setShowAddModal(true)
    }, [])

    const handleSubmitVoter = useCallback(async (voterData) => {
        try {
            let response
            if (selectedVoter) {
                response = await fetch(`/frontapi/voters/${selectedVoter.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(voterData)
                })
            } else {
                response = await fetch('/frontapi/voters', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(voterData)
                })
            }

            if (response.ok) {
                fetchVoters()
                toast.success(selectedVoter ? 'Voter updated successfully!' : 'Voter added successfully!')
                setShowAddModal(false)
                setSelectedVoter(null)
            } else {
                toast.error(response.message || (selectedVoter ? 'Failed to update voter' : 'Failed to add voter'))
                console.log(response);

            }
        } catch (error) {
            toast.error(error.message || (selectedVoter ? 'Failed to update voter' : 'Failed to add voter'))
            console.error(error)
        }
    }, [selectedVoter, fetchVoters])

    const handleBulkEntry = useCallback(() => {
        toast.success('Opening Bulk Entry form...')
        // Navigate to bulk entry page or open modal
    }, [])

    const handleEditVoter = useCallback((voterDataOrId) => {
        let voterToEdit = voterDataOrId
        if (typeof voterDataOrId === 'number' || typeof voterDataOrId === 'string') {
            voterToEdit = voters.find(v => v.id === voterDataOrId)
        }

        if (voterToEdit) {
            setSelectedVoter(voterToEdit)
            setShowAddModal(true)
        } else {
            toast.error("Could not find voter details")
        }
    }, [voters])

    const handleDeleteVoter = useCallback(async (voterId) => {
        if (confirm('Are you sure you want to delete this voter?')) {
            try {
                const response = await fetch(`/frontapi/voters/${voterId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                if (response.ok) {
                    fetchVoters()
                    toast.success('Voter deleted successfully!')
                } else {
                    console.log(response);
                    toast.error(response.message || 'Failed to delete voter')
                }
            } catch (error) {
                toast.error(error.message || 'Failed to delete voter')
                console.error(error)
            }
        }
    }, [fetchVoters])

    // Effects
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchVoters()
        }, 300) // Debounce search

        return () => clearTimeout(timeoutId)
    }, [fetchVoters])

    // Reset to page 1 when filters or search change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, filters])

    return (
        <DefaultLayout title='Voters'>
            <ProtectedRoute permissions={['view-voters']}>
                <div className="p-6 bg-gray-50 min-h-screen">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Voter Management</h1>
                                <p className="text-gray-600">Manage and organize voter information efficiently</p>
                            </div>
                            <div className="flex gap-3 mt-4 md:mt-0">
                                <button
                                    onClick={handleBulkEntry}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    <FaFileUpload className="text-lg" />
                                    Bulk Entry
                                </button>
                                <button
                                    onClick={handleAddVoter}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    <FaPlus className="text-lg" />
                                    Add Voter
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats - Compact Display */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex flex-wrap items-center gap-6">
                            {stats.map((stat, index) => {
                                const Icon = stat.icon
                                return (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className={`${stat.lightBg} p-2.5 rounded-lg`}>
                                            <Icon className={`text-xl ${stat.textColor}`} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
                                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                        </div>
                                        {index < stats.length - 1 && (
                                            <div className="hidden sm:block w-px h-12 bg-gray-200 ml-3" />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Filters Component */}
                    <VoterFilters
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        showFilters={showFilters}
                        setShowFilters={setShowFilters}
                        filters={filters}
                        handleFilterChange={handleFilterChange}
                        clearFilters={clearFilters}
                        districts={districts}
                        upazillas={upazillas}
                        unions={unions}
                        locationLoading={locationLoading}
                    />

                    {/* Voters Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Voter Info
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            NID
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Occupation
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                                    <p className="text-lg font-medium">Loading voters...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : voters.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <FaUsers className="text-5xl mb-4 text-gray-300" />
                                                    <p className="text-lg font-medium">No voters found</p>
                                                    <p className="text-sm mt-1">Try adjusting your filters or add new voters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        voters.map((voter, index) => (
                                            <VoterCard
                                                key={voter.id || index}
                                                voter={voter}
                                                onEdit={handleEditVoter}
                                                onDelete={handleDeleteVoter}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Component */}
                    <VoterPagination
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        setItemsPerPage={setItemsPerPage}
                        totalPages={totalPages}
                        filteredCount={filteredCount}
                        totalCount={totalCount}
                        hasNextPage={hasNextPage}
                        hasPrevPage={hasPrevPage}
                        loading={loading}
                    />

                    {/* Add Voter Modal */}
                    <VoterAddModal
                        isOpen={showAddModal}
                        onClose={() => {
                            setShowAddModal(false)
                            setSelectedVoter(null)
                        }}
                        onSubmit={handleSubmitVoter}
                        initialData={selectedVoter}
                    />
                </div>
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default VoterPage
