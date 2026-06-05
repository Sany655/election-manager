'use client'
import React, { useState, useEffect, useMemo } from 'react'
import {
  FaWhatsapp,
  FaCheckCircle,
  FaSync,
  FaPaperPlane,
  FaQrcode,
  FaExclamationTriangle,
  FaSignOutAlt,
  FaUser,
  FaUsers,
  FaSearch
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useWhatsApp } from '../../../context/whatsapp_context'

const ViewTable = ({ token }) => {
  const { status, qrCode, loading: statusLoading, fetchStatus, getHeaders } = useWhatsApp();
  const [testPhone, setTestPhone] = useState('')
  // Bulk SMS States
  const [activeTab, setActiveTab] = useState('single'); // 'single' or 'bulk'
  const [singlePhone, setSinglePhone] = useState('');
  const [bulkRecipientType, setBulkRecipientType] = useState('volunteers') // 'volunteers' or 'voters' or 'teams'
  const [selectedRecipients, setSelectedRecipients] = useState([])
  const [bulkMessage, setBulkMessage] = useState('')
  const [sendingProgress, setSendingProgress] = useState({ sent: 0, total: 0, inProgress: false })

  // Teams & Geo States
  const [teams, setTeams] = useState([])
  const [volunteersList, setVolunteersList] = useState([])
  const [loadingVolunteers, setLoadingVolunteers] = useState(false)
  const [geoData, setGeoData] = useState({
    divisions: [],
    districts: [],
    upazillas: [],
    unions: []
  })
  const [filters, setFilters] = useState({
    name: '',
    division_id: '',
    district_id: '',
    upazilla_id: '',
    union_id: ''
  })
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [votersList, setVotersList] = useState([])
  const [loadingVoters, setLoadingVoters] = useState(false)

  // Fetch Teams
  const fetchTeams = async () => {
    setLoadingTeams(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/volunteer-teams`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (res.ok) {
        setTeams(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
      toast.error('Failed to fetch teams')
    } finally {
      setLoadingTeams(false)
    }
  }

  // Fetch Volunteers
  const fetchVolunteers = async () => {
    setLoadingVolunteers(true)
    try {
      let url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/users?role=volunteer&per_page=1000`
      if (filters.name) {
        url += `&search=${encodeURIComponent(filters.name)}`
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (res.ok) {
        setVolunteersList(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching volunteers:', error)
      toast.error('Failed to fetch volunteers')
    } finally {
      setLoadingVolunteers(false)
    }
  }

  // Fetch Geo Data
  const fetchDivisions = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/geo/divisions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      setGeoData(prev => ({ ...prev, divisions: data }))
    } catch (error) {
      console.error("Error fetching divisions:", error)
    }
  }

  const fetchDistricts = async (divisionId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/geo/districts/${divisionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      setGeoData(prev => ({ ...prev, districts: data }))
    } catch (error) {
      console.error("Error fetching districts:", error)
    }
  }

  const fetchUpazillas = async (districtId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/geo/upazillas/${districtId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      setGeoData(prev => ({ ...prev, upazillas: data }))
    } catch (error) {
      console.error("Error fetching upazillas:", error)
    }
  }

  const fetchUnions = async (upazillaId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/geo/unions/${upazillaId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      setGeoData(prev => ({ ...prev, unions: data }))
    } catch (error) {
      console.error("Error fetching unions:", error)
    }
  }

  // Fetch Voters
  const fetchVoters = async () => {
    // Only fetch if at least one filter is applied
    const hasFilters = filters.division_id || filters.district_id || filters.upazilla_id || filters.union_id || filters.name;

    if (!hasFilters) {
      setVotersList([]);
      return;
    }

    setLoadingVoters(true)
    try {
      const queryParams = new URLSearchParams()
      if (filters.division_id) queryParams.append('division_id', filters.division_id)
      if (filters.district_id) queryParams.append('district_id', filters.district_id)
      if (filters.upazilla_id) queryParams.append('upazilla_id', filters.upazilla_id)
      if (filters.union_id) queryParams.append('union_id', filters.union_id)
      if (filters.name) queryParams.append('search', filters.name)
      queryParams.append('limit', 1000)

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/voters?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (res.ok) {
        setVotersList(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching voters:', error)
      toast.error('Failed to fetch voters')
    } finally {
      setLoadingVoters(false)
    }
  }

  // Effect to load initial data based on type
  useEffect(() => {
    if (bulkRecipientType === 'teams') {
      if (teams.length === 0) fetchTeams()
      if (geoData.divisions.length === 0) fetchDivisions()
    } else if (bulkRecipientType === 'voters') {
      if (geoData.divisions.length === 0) fetchDivisions()
    } else if (bulkRecipientType === 'volunteers') {
      fetchVolunteers()
    }
  }, [bulkRecipientType])

  // Fetch voters/volunteers when filters change
  useEffect(() => {
    if (bulkRecipientType === 'voters') {
      const timer = setTimeout(() => {
        fetchVoters();
      }, 500); // Debounce
      return () => clearTimeout(timer);
    } else if (bulkRecipientType === 'volunteers') {
      const timer = setTimeout(() => {
        fetchVolunteers();
      }, 500); // Debounce
      return () => clearTimeout(timer);
    }
  }, [filters, bulkRecipientType])

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))

    // Reset dependent fields
    if (field === 'division_id') {
      setFilters(prev => ({ ...prev, district_id: '', upazilla_id: '', union_id: '' }))
      setGeoData(prev => ({ ...prev, districts: [], upazillas: [], unions: [] }))
      if (value) fetchDistricts(value)
    } else if (field === 'district_id') {
      setFilters(prev => ({ ...prev, upazilla_id: '', union_id: '' }))
      setGeoData(prev => ({ ...prev, upazillas: [], unions: [] }))
      if (value) fetchUpazillas(value)
    } else if (field === 'upazilla_id') {
      setFilters(prev => ({ ...prev, union_id: '' }))
      setGeoData(prev => ({ ...prev, unions: [] }))
      if (value) fetchUnions(value)
    }
  }

  const getFilteredTeams = () => {
    return teams.filter(team => {
      if (filters.name && !team.name.toLowerCase().includes(filters.name.toLowerCase())) return false
      if (filters.division_id && team.division_id != filters.division_id) return false
      if (filters.district_id && team.district_id != filters.district_id) return false
      if (filters.upazilla_id && team.upazilla_id != filters.upazilla_id) return false
      if (filters.union_id && team.union_id != filters.union_id) return false
      return true
    })
  }

  // Get current recipient list based on type
  const getCurrentRecipients = () => {
    if (bulkRecipientType === 'teams') return getFilteredTeams()
    if (bulkRecipientType === 'voters') return votersList
    if (bulkRecipientType === 'volunteers') return volunteersList
    return []
  }

  // Handle select all
  const handleSelectAll = () => {
    const currentList = getCurrentRecipients()
    if (selectedRecipients.length === currentList.length) {
      setSelectedRecipients([])
    } else {
      if (bulkRecipientType === 'teams') {
        setSelectedRecipients(currentList.map(item => item.id))
      } else {
        setSelectedRecipients(currentList.map(item => item.msisdn).filter(Boolean))
      }
    }
  }

  // Handle individual selection
  const handleToggleRecipient = (value) => {
    if (selectedRecipients.includes(value)) {
      setSelectedRecipients(selectedRecipients.filter(m => m !== value))
    } else {
      setSelectedRecipients([...selectedRecipients, value])
    }
  }

  // Reset selections when recipient type changes
  useEffect(() => {
    setSelectedRecipients([])
  }, [bulkRecipientType])

  // Calculate total unique recipients count
  const totalRecipientCount = useMemo(() => {
    if (bulkRecipientType === 'teams') {
      const selectedTeams = teams.filter(t => selectedRecipients.includes(t.id))
      const numbers = new Set()
      selectedTeams.forEach(team => {
        team.members?.forEach(member => {
          if (member.user?.msisdn) {
            numbers.add(member.user.msisdn)
          }
        })
      })
      return numbers.size
    }
    return selectedRecipients.length
  }, [bulkRecipientType, selectedRecipients, teams])

  const handleSendSingle = async () => {
    if (!singlePhone) {
      toast.error('Please enter a phone number');
      return;
    }
    if (!bulkMessage) {
      toast.error('Please enter a message');
      return;
    }

    setSendingProgress({ sent: 0, total: 1, inProgress: true });

    let phone = singlePhone.trim();
    if (phone.startsWith('0')) {
      phone = '88' + phone;
    }

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/whatsapp/send`, {
        phone: phone,
        message: bulkMessage
      }, {
        headers: getHeaders()
      });

      if (res.data.success) {
        toast.success('Message sent successfully!');
        setBulkMessage('');
        // Optional: clear phone or keep it? Keeping it often better for single msg workflows.
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error("Send failed", error);
      toast.error(error.response?.data?.error || 'Failed to send message');
    } finally {
      setSendingProgress({ sent: 0, total: 0, inProgress: false });
    }
  }

  const handleSendBulk = async () => {
    if (selectedRecipients.length === 0) {
      toast.error('Please select at least one recipient')
      return;
    }
    if (!bulkMessage) {
      toast.error('Enter a message')
      return
    }

    // Determine finalized list of phone numbers
    let finalNumbers = [];
    if (bulkRecipientType === 'teams') {
      const selectedTeams = teams.filter(t => selectedRecipients.includes(t.id))
      const numbers = new Set()
      selectedTeams.forEach(team => {
        team.members?.forEach(member => {
          if (member.user?.msisdn) {
            numbers.add(member.user.msisdn)
          }
        })
      })
      finalNumbers = Array.from(numbers)
    } else {
      finalNumbers = selectedRecipients
    }

    if (finalNumbers.length === 0) {
      toast.error("No valid phone numbers found.")
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to send this message to ${finalNumbers.length} recipient(s)?`
    )

    if (!confirmed) return

    setSendingProgress({ sent: 0, total: finalNumbers.length, inProgress: true })

    try {
      let sentCount = 0;
      let failedCount = 0;

      for (const number of finalNumbers) {
        let phone = number;
        if (phone.startsWith('0')) {
          phone = '88' + phone
        }

        try {
          // Send individually for now to ensure reliability with the single-message endpoint
          await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/whatsapp/send`, {
            phone: phone,
            message: bulkMessage
          }, {
            headers: getHeaders()
          });
          sentCount++;
        } catch (error) {
          console.error(`Failed to send to ${phone}`, error);
          failedCount++;
        }

        setSendingProgress(prev => ({ ...prev, sent: sentCount + failedCount }));
      }

      toast.success(`Broadcasting complete. Sent: ${sentCount}, Failed: ${failedCount}`);
      setBulkMessage('');
      setSelectedRecipients([]);

    } catch (error) {
      console.error(error);
      toast.error('Failed to process bulk sending');
    } finally {
      setSendingProgress({ sent: 0, total: 0, inProgress: false })
    }
  }
  // Send Bulk SMS
  const handleSendBulkSMS = async () => {
    if (selectedRecipients.length === 0) {
      toast.error('Please select at least one recipient')
      return
    }

    if (!bulkMessage.trim()) {
      toast.error('Please enter a message')
      return
    }

    // Calculate actual recipients (unique phone numbers)
    let finalRecipients = []

    if (bulkRecipientType === 'teams') {
      const selectedTeams = teams.filter(t => selectedRecipients.includes(t.id))
      const numbers = new Set()
      selectedTeams.forEach(team => {
        team.members?.forEach(member => {
          if (member.user?.msisdn) {
            numbers.add(member.user.msisdn)
          }
        })
      })
      finalRecipients = Array.from(numbers)

      if (finalRecipients.length === 0) {
        toast.error('No valid phone numbers found in selected teams')
        return
      }
    } else {
      finalRecipients = selectedRecipients
    }

    // Confirm before sending with ACTUAL count
    const confirmed = window.confirm(
      `Are you sure you want to send SMS to ${finalRecipients.length} recipient(s)?`
    )

    if (!confirmed) return

    setSendingProgress({ sent: 0, total: finalRecipients.length, inProgress: true })

    try {
      const res = await fetch(`/frontapi/communication/sms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numbers: finalRecipients,
          message: bulkMessage
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(`SMS sent to ${finalRecipients.length} recipient(s)!`)

        // Reset form
        setSelectedRecipients([])
        setBulkMessage('')
        setShowBulkModal(false)
        setSendingProgress({ sent: 0, total: 0, inProgress: false })

        router.refresh()
      } else {
        toast.error(data.message || "Failed to send bulk SMS")
        setSendingProgress({ sent: 0, total: 0, inProgress: false })
      }
    } catch (err) {
      console.error("Client error:", err)
      toast.error("Something went wrong while sending bulk SMS")
      setSendingProgress({ sent: 0, total: 0, inProgress: false })
    }
  }

  const logout = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/whatsapp/logout`, {}, { headers: getHeaders() });
      if (res.data.success) {
        toast.success('Session stopped successfully!');
        fetchStatus();
      }
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Failed to stop session");
    }
  }

  const getStatusColor = (s) => {
    const lower = String(s || '').toLowerCase();
    if (lower === 'working' || lower === 'connected') return 'text-green-600 bg-green-50';
    if (lower.includes('scan') || lower.includes('qr') || lower.includes('authenticat')) return 'text-orange-600 bg-orange-50';
    if (lower === 'stopped' || lower === 'starting') return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <FaWhatsapp className="text-3xl text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">WhatsApp Gateway</h1>
            <p className="text-sm text-gray-500">System Session Management</p>
          </div>
        </div>
        {/* Header Actions */}
        <div className="flex items-center gap-3">
          {(status?.toLowerCase() === 'working' || status?.toLowerCase() === 'connected') && (
            <button
              onClick={logout}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium border border-red-200"
            >
              Logout <FaSignOutAlt />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Status Logic: Show Inbox if Connected (WORKING), otherwise show Status/QR */}
        {(status?.toLowerCase() === 'working' || status?.toLowerCase() === 'connected') ? (
          /* Connected View */
          <div className="space-y-6">
            {/* Connection Info */}
            {/* <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-2xl text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Session Active</h3>
                  <p className="text-green-700 text-sm">Ready to send messages</p>
                </div>
              </div>
              <div className="text-xs bg-white px-2 py-1 rounded border border-green-200 text-green-600 font-mono">
                {status}
              </div>
            </div> */}

            {/* Bulk Messaging Interface */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100">
                <button
                  className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === 'single' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('single')}
                >
                  Single Message
                </button>
                <button
                  className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === 'bulk' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('bulk')}
                >
                  Bulk Message
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Recipients (Differs by activeTab) */}
                  <div className="space-y-4">
                    {activeTab === 'single' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Phone Number</label>
                        <input
                          type="text"
                          value={singlePhone}
                          onChange={(e) => setSinglePhone(e.target.value)}
                          placeholder="e.g. 01712345678"
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-2">Enter 11-digit mobile number (e.g. 017xxxxxxxx).</p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                            <button
                              onClick={() => setBulkRecipientType('volunteers')}
                              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${bulkRecipientType === 'volunteers'
                                ? 'bg-white text-green-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                              <FaUser className="inline mr-2" /> Volunteers ({volunteersList.length})
                            </button>
                            <button
                              onClick={() => setBulkRecipientType('voters')}
                              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${bulkRecipientType === 'voters'
                                ? 'bg-white text-green-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                              <FaUsers className="inline mr-2" /> Voters ({votersList.length})
                            </button>
                            <button
                              onClick={() => setBulkRecipientType('teams')}
                              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${bulkRecipientType === 'teams'
                                ? 'bg-white text-green-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                              <FaUsers className="inline mr-2" /> Teams
                            </button>
                          </div>
                        </div>

                        {/* Filters for Teams/Voters/Volunteers */}
                        {(bulkRecipientType === 'teams' || bulkRecipientType === 'voters' || bulkRecipientType === 'volunteers') && (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
                            <div className="relative">
                              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                placeholder={`Search ${bulkRecipientType}...`}
                                value={filters.name}
                                onChange={(e) => handleFilterChange('name', e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-green-500 outline-none"
                              />
                            </div>
                            {(bulkRecipientType === 'teams' || bulkRecipientType === 'voters') && (
                              <div className="grid grid-cols-2 gap-2">
                                {/* Geo Filters */}
                                <select
                                  value={filters.division_id}
                                  onChange={(e) => handleFilterChange('division_id', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm outline-none"
                                >
                                  <option value="">Division</option>
                                  {geoData.divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                <select
                                  value={filters.district_id}
                                  onChange={(e) => handleFilterChange('district_id', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm outline-none"
                                  disabled={!filters.division_id}
                                >
                                  <option value="">District</option>
                                  {geoData.districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                <select
                                  value={filters.upazilla_id}
                                  onChange={(e) => handleFilterChange('upazilla_id', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm outline-none"
                                  disabled={!filters.district_id}
                                >
                                  <option value="">Upazilla</option>
                                  {geoData.upazillas.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                <select
                                  value={filters.union_id}
                                  onChange={(e) => handleFilterChange('union_id', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm outline-none"
                                  disabled={!filters.upazilla_id}
                                >
                                  <option value="">Union</option>
                                  {geoData.unions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Recipient List */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="p-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-500">
                              {selectedRecipients.length} selected
                            </span>
                            <button
                              onClick={handleSelectAll}
                              className="text-xs text-green-600 hover:text-green-700 font-medium"
                            >
                              {selectedRecipients.length === getCurrentRecipients().length && getCurrentRecipients().length > 0 ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>
                          <div className="h-64 overflow-y-auto p-2 space-y-1">
                            {loadingVoters || loadingTeams ? (
                              <div className="flex justify-center items-center h-full text-gray-400">
                                <FaSync className="animate-spin mr-2" /> Loading...
                              </div>
                            ) : getCurrentRecipients().length === 0 ? (
                              <div className="text-center py-8 text-gray-400 text-sm">
                                No {bulkRecipientType} found.
                              </div>
                            ) : (
                              getCurrentRecipients().map((item, index) => {
                                const isTeam = bulkRecipientType === 'teams';
                                const value = isTeam ? item.id : item.msisdn;
                                const label = isTeam ? item.name : (item.name || item.username || 'Unknown');
                                const subLabel = isTeam ? `${item.members?.length || 0} members` : (item.msisdn || 'No phone');

                                return (
                                  <label key={isTeam ? item.id : index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-gray-100">
                                    <input
                                      type="checkbox"
                                      checked={selectedRecipients.includes(value)}
                                      onChange={() => handleToggleRecipient(value)}
                                      className="rounded text-green-600 focus:ring-green-500"
                                      disabled={!value && !isTeam} // Disable if no phone
                                    />
                                    <div className="flex-1 overflow-hidden">
                                      <p className="text-sm font-medium text-gray-800 truncate">{label}</p>
                                      <p className="text-xs text-gray-500 truncate">{subLabel}</p>
                                    </div>
                                  </label>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right Column: Message */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                      <textarea
                        rows="6"
                        value={bulkMessage}
                        onChange={e => setBulkMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none"
                      />
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>{bulkMessage.length} chars</span>
                        <span>~{Math.ceil(bulkMessage.length / 160)} SMS chunks</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quick Templates</label>
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          onClick={() => setBulkMessage('আপনার ভোটটি গুরুত্বপূর্ণ! আগামী নির্বাচনে অংশ নিন।')}
                          className="text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                        >
                          🇧🇩 Voting Reminder (Bangla)
                        </button>
                        <button
                          onClick={() => setBulkMessage('Your vote matters! Please participate in the upcoming election.')}
                          className="text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                        >
                          🇺🇸 Voting Reminder (English)
                        </button>
                        <button
                          onClick={() => setBulkMessage('Thank you for registering! We will keep you updated.')}
                          className="text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                        >
                          ✅ Registration Confirmation
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 mt-auto">
                      <button
                        onClick={activeTab === 'single' ? handleSendSingle : handleSendBulk}
                        disabled={sendingProgress.inProgress || !bulkMessage || (activeTab === 'bulk' && selectedRecipients.length === 0)}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingProgress.inProgress ? (
                          <>
                            <FaSync className="animate-spin" /> Sending...
                            {activeTab === 'bulk' && <span className="text-sm ml-1">({sendingProgress.sent}/{sendingProgress.total})</span>}
                          </>
                        ) : (
                          <>
                            <FaPaperPlane /> {activeTab === 'single' ? 'Send Message' : `Send to ${totalRecipientCount} Recipient(s)`}
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Disconnected / QR View */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FaExclamationTriangle className="text-orange-500" /> Connection Required
              </h2>
              <button
                onClick={fetchStatus}
                disabled={statusLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors text-sm font-medium"
              >
                <FaSync className={statusLoading ? "animate-spin" : ""} /> Refresh Status
              </button>
            </div>

            <div className="flex flex-col items-center justify-center text-center">

              {/* Status Indicator */}
              <div className={`mb-8 px-4 py-2 rounded-full text-sm font-bold tracking-wide uppercase ${getStatusColor(status)}`}>
                Current Status: {status || 'Unknown'}
              </div>

              {qrCode ? (
                <div className="space-y-6 w-full max-w-sm">
                  <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 shadow-sm">
                    <img src={qrCode} alt="WhatsApp QR" className="w-full h-auto object-contain" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Scan QR Code</h3>
                    <p className="text-sm text-gray-500">
                      1. Open WhatsApp on your phone<br />
                      2. Go to Settings {'>'} Linked Devices<br />
                      3. Tap "Link a Device" and scan this code
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mb-3 bg-yellow-50 p-2 rounded">
                      After scanning the code on your phone, wait a few seconds and click the button below.
                    </p>
                    <button
                      onClick={fetchStatus}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                    >
                      <FaCheckCircle /> I've Scanned the Code
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center">
                  <div className="animate-pulse bg-gray-100 rounded-full h-24 w-24 mb-4 flex items-center justify-center text-gray-300">
                    <FaQrcode className="text-4xl" />
                  </div>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {status === 'initializing' ? 'Initializing session...' : 'Waiting for connection details...'}
                  </p>
                  {status !== 'initializing' && (
                    <button onClick={fetchStatus} className="mt-6 text-blue-600 hover:underline">
                      Try Refreshing
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewTable