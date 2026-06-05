'use client'
import React, { useState, useEffect } from 'react'
import {
  MdSms,
  MdCheckCircle,
  MdError,
  MdRefresh,
  MdSave,
  MdSend,
  MdGroup,
  MdPerson
} from 'react-icons/md'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const ViewTable = ({ users = [], voters = [], title, token }) => {
  const [config, setConfig] = useState({
    provider: 'send_my_sms',
    api_key: '',
    api_secret: '',
    sender_id: '',
    base_url: '',
    is_enabled: true,
  })

  const [preferences, setPreferences] = useState({
    enable_notifications: true,
    unicode_support: true,
    auto_retry: true,
    max_retry_attempts: 3,
    daily_limit: 1000,
    time_restriction_start: '22:00',
    time_restriction_end: '08:00',
  })

  const [showSecret, setShowSecret] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Bulk SMS States
  const [bulkRecipientType, setBulkRecipientType] = useState('users') // 'users' or 'voters'
  const [selectedRecipients, setSelectedRecipients] = useState([])
  const [bulkMessage, setBulkMessage] = useState('')
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [sendingProgress, setSendingProgress] = useState({ sent: 0, total: 0, inProgress: false })

  // Teams & Geo States
  const [teams, setTeams] = useState([])
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

  useEffect(() => {
    if (showBulkModal) {
      if (bulkRecipientType === 'teams') {
        if (teams.length === 0) fetchTeams()
        if (geoData.divisions.length === 0) fetchDivisions()
      } else if (bulkRecipientType === 'voters') {
        if (geoData.divisions.length === 0) fetchDivisions()
      }
    }
  }, [showBulkModal, bulkRecipientType])

  // Fetch voters when filters change
  useEffect(() => {
    if (showBulkModal && bulkRecipientType === 'voters') {
      const timer = setTimeout(() => {
        fetchVoters();
      }, 500); // Debounce
      return () => clearTimeout(timer);
    }
  }, [filters, bulkRecipientType, showBulkModal])

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

  const router = useRouter();

  const providers = [
    { value: 'send_my_sms', label: 'Send my sms', url: 'https://sendmysms.net/api.php' },
    { value: 'ssl_wireless', label: 'SSL Wireless', url: 'https://sms.sslwireless.com/api/v3' },
    { value: 'banglalink', label: 'Banglalink', url: 'https://api.banglalink.net/sms' },
    { value: 'twilio', label: 'Twilio', url: 'https://api.twilio.com' },
    { value: 'custom', label: 'Custom Provider', url: '' },
  ]

  // Get current recipient list based on type
  const getCurrentRecipients = () => {
    if (bulkRecipientType === 'teams') return getFilteredTeams()
    if (bulkRecipientType === 'voters') return votersList
    return users
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
  const totalRecipientCount = React.useMemo(() => {
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

  const handleProviderChange = (e) => {
    const selectedProvider = providers.find(p => p.value === e.target.value)
    setConfig({
      ...config,
      provider: e.target.value,
      base_url: selectedProvider?.url || ''
    })
  }

  const handleConfigChange = (field, value) => {
    setConfig({ ...config, [field]: value })
  }

  const handlePreferenceChange = (field, value) => {
    setPreferences({ ...preferences, [field]: value })
  }

  const handleSaveConfig = async () => {
    setLoading(true)
    try {
      // API call to save configuration
      console.log('Saving config:', config)
      setTimeout(() => {
        setLoading(false)
        toast.success('Configuration saved successfully!')
      }, 1000)
    } catch (error) {
      setLoading(false)
      toast.error('Failed to save configuration')
    }
  }

  const handleTestConnection = async () => {
    setConnectionStatus('testing')
    try {
      console.log('Testing connection...')
      setTimeout(() => {
        setConnectionStatus('connected')
        toast.success('Connection successful!')
      }, 2000)
    } catch (error) {
      setConnectionStatus('disconnected')
      toast.error('Connection failed!')
    }
  }

  const handleSendTest = async () => {
    if (!testPhone || !testMessage) {
      toast.error('Please enter phone number and message')
      return
    }

    setLoading(true)
    try {
      const phoneNumbers = testPhone
        .split(',')
        .map(num => num.trim())
        .filter(Boolean)

      const res = await fetch(`/frontapi/communication/sms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ numbers: phoneNumbers, message: testMessage }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || "SMS sent successfully")
        setTestPhone('')
        setTestMessage('')
        router.refresh()
      } else {
        toast.error(data.message || "Failed to send")
      }
    } catch (err) {
      console.error("Client error:", err)
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MdSms className="text-2xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">SMS Configuration</h1>
              <p className="text-sm text-gray-500">Configure your SMS gateway settings</p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-3">
            {/* Bulk SMS Button */}
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <MdGroup />
              Send Bulk SMS
            </button>

            {connectionStatus === 'connected' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                <MdCheckCircle />
                <span className="font-medium">Connected</span>
              </div>
            )}
            {connectionStatus === 'disconnected' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg">
                <MdError />
                <span className="font-medium">Disconnected</span>
              </div>
            )}
            {connectionStatus === 'testing' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg">
                <MdRefresh className="animate-spin" />
                <span className="font-medium">Testing...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Provider Settings Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Provider Settings</h2>

            <div className="space-y-4">
              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMS Provider
                </label>
                <select
                  value={config.provider}
                  onChange={handleProviderChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {providers.map(provider => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="text"
                  value={config.api_key}
                  onChange={(e) => handleConfigChange('api_key', e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* API Secret */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Secret
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    value={config.api_secret}
                    onChange={(e) => handleConfigChange('api_secret', e.target.value)}
                    placeholder="Enter your API secret"
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showSecret ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/* Sender ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sender ID / Mask Name
                </label>
                <input
                  type="text"
                  value={config.sender_id}
                  onChange={(e) => handleConfigChange('sender_id', e.target.value)}
                  placeholder="e.g., CAMPAIGN"
                  maxLength={11}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 11 characters</p>
              </div>

              {/* Base URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base URL
                </label>
                <input
                  type="text"
                  value={config.base_url}
                  onChange={(e) => handleConfigChange('base_url', e.target.value)}
                  placeholder="https://api.provider.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={config.provider !== 'custom'}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleTestConnection}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <MdRefresh />
                  Test Connection
                </button>
                <button
                  onClick={handleSaveConfig}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MdSave />
                  {loading ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </div>
          </div>

          {/* Preferences Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Preferences</h2>

            <div className="space-y-4">
              {/* Enable SMS Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Enable SMS Notifications</label>
                  <p className="text-xs text-gray-500">Allow sending SMS notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.enable_notifications}
                    onChange={(e) => handlePreferenceChange('enable_notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Unicode Support */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Unicode Support</label>
                  <p className="text-xs text-gray-500">Support Bengali and special characters</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.unicode_support}
                    onChange={(e) => handlePreferenceChange('unicode_support', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Auto Retry */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto Retry on Failure</label>
                  <p className="text-xs text-gray-500">Automatically retry failed messages</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.auto_retry}
                    onChange={(e) => handlePreferenceChange('auto_retry', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Max Retry Attempts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Retry Attempts
                </label>
                <input
                  type="number"
                  value={preferences.max_retry_attempts}
                  onChange={(e) => handlePreferenceChange('max_retry_attempts', parseInt(e.target.value))}
                  min="1"
                  max="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Daily Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Sending Limit
                </label>
                <input
                  type="number"
                  value={preferences.daily_limit}
                  onChange={(e) => handlePreferenceChange('daily_limit', parseInt(e.target.value))}
                  min="100"
                  step="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Time Restrictions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restrict From
                  </label>
                  <input
                    type="time"
                    value={preferences.time_restriction_start}
                    onChange={(e) => handlePreferenceChange('time_restriction_start', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restrict To
                  </label>
                  <input
                    type="time"
                    value={preferences.time_restriction_end}
                    onChange={(e) => handlePreferenceChange('time_restriction_end', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">SMS won't be sent during these hours</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Test SMS Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Send Test SMS</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+8801XXXXXXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter test message..."
                  rows="4"
                  maxLength="160"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 text-right mt-1">
                  {testMessage.length}/160
                </p>
              </div>

              <button
                onClick={handleSendTest}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <MdSend />
                {loading ? 'Sending...' : 'Send Test SMS'}
              </button>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="font-semibold text-gray-800">{users.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Voters</span>
                <span className="font-semibold text-gray-800">{voters.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Balance/Credits</span>
                <span className="font-semibold text-gray-800">৳5,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sent Today</span>
                <span className="font-semibold text-gray-800">248</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-semibold text-green-600">98.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Failed</span>
                <span className="font-semibold text-red-600">4</span>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Configuration Tips</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Test connection before saving configuration</li>
              <li>• Sender ID must be pre-registered with provider</li>
              <li>• Keep API credentials secure</li>
              <li>• Monitor daily limits to avoid service interruption</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bulk SMS Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MdGroup className="text-xl text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Send Bulk SMS</h2>
                  <p className="text-sm text-gray-500">Select recipients and compose your message</p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Recipient Selection */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Type
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setBulkRecipientType('users')}
                        className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${bulkRecipientType === 'users'
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <MdPerson className="inline mr-2" />
                        Users ({users.length})
                      </button>
                      <button
                        onClick={() => setBulkRecipientType('voters')}
                        className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${bulkRecipientType === 'voters'
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <MdGroup className="inline mr-2" />
                        Voters ({votersList.length})
                      </button>
                      <button
                        onClick={() => setBulkRecipientType('teams')}
                        className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${bulkRecipientType === 'teams'
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <MdGroup className="inline mr-2" />
                        Teams
                      </button>
                    </div>
                  </div>

                  {/* Team & Voter Filters */}
                  {(bulkRecipientType === 'teams' || bulkRecipientType === 'voters') && (
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <input
                        type="text"
                        placeholder={`Search ${bulkRecipientType}...`}
                        value={filters.name}
                        onChange={(e) => handleFilterChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={filters.division_id}
                          onChange={(e) => handleFilterChange('division_id', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        >
                          <option value="">Division</option>
                          {geoData.divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <select
                          value={filters.district_id}
                          onChange={(e) => handleFilterChange('district_id', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          disabled={!filters.division_id}
                        >
                          <option value="">District</option>
                          {geoData.districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <select
                          value={filters.upazilla_id}
                          onChange={(e) => handleFilterChange('upazilla_id', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          disabled={!filters.district_id}
                        >
                          <option value="">Upazilla</option>
                          {geoData.upazillas.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <select
                          value={filters.union_id}
                          onChange={(e) => handleFilterChange('union_id', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          disabled={!filters.upazilla_id}
                        >
                          <option value="">Union</option>
                          {geoData.unions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Select All */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      {loadingVoters ? 'Loading...' : `${selectedRecipients.length} of ${getCurrentRecipients().length} selected`}
                    </span>
                    <button
                      onClick={handleSelectAll}
                      disabled={loadingVoters}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                    >
                      {selectedRecipients.length === getCurrentRecipients().length && getCurrentRecipients().length > 0 ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  {/* Recipient List */}
                  <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                    {getCurrentRecipients().length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        {loadingVoters ? (
                          <div className="flex flex-col items-center">
                            <MdRefresh className="text-4xl mx-auto mb-2 animate-spin" />
                            <p>Loading voters...</p>
                          </div>
                        ) : (
                          <>
                            <MdGroup className="text-4xl mx-auto mb-2 opacity-50" />
                            <p>No {bulkRecipientType} available</p>
                            {bulkRecipientType === 'voters' && !filters.division_id && !filters.name && (
                              <p className="text-xs mt-1">Select filters to load voters</p>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {getCurrentRecipients().map((item, index) => {
                          const isTeam = bulkRecipientType === 'teams'
                          const value = isTeam ? item.id : item.msisdn
                          const label = isTeam ? item.name : (item.name || item.username || 'Unknown')
                          const subLabel = isTeam
                            ? `${item.members?.length || 0} members`
                            : (item.msisdn || 'No phone number')

                          return (
                            <label
                              key={isTeam ? item.id : index}
                              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedRecipients.includes(value)}
                                onChange={() => handleToggleRecipient(value)}
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                disabled={!value && !isTeam}
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800">
                                  {label}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {subLabel}
                                </p>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Message Composition */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={bulkMessage}
                      onChange={(e) => setBulkMessage(e.target.value)}
                      placeholder="Enter your message here..."
                      rows="10"
                      maxLength="500"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">
                        {bulkMessage.length}/500 characters
                      </p>
                      <p className="text-xs text-gray-500">
                        ~{Math.ceil(bulkMessage.length / 160)} SMS
                      </p>
                    </div>
                  </div>

                  {/* Message Templates */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quick Templates
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setBulkMessage('আপনার ভোটটি গুরুত্বপূর্ণ! আগামী নির্বাচনে অংশ নিন।')}
                        className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border border-gray-200"
                      >
                        Voting reminder (Bengali)
                      </button>
                      <button
                        onClick={() => setBulkMessage('Your vote matters! Please participate in the upcoming election.')}
                        className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border border-gray-200"
                      >
                        Voting reminder (English)
                      </button>
                      <button
                        onClick={() => setBulkMessage('Thank you for registering! We will keep you updated.')}
                        className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border border-gray-200"
                      >
                        Registration confirmation
                      </button>
                    </div>
                  </div>

                  {/* Preview */}
                  {bulkMessage && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Preview</h4>
                      <p className="text-sm text-blue-700 whitespace-pre-wrap">{bulkMessage}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="text-sm text-gray-600">
                Ready to send to <span className="font-semibold">{totalRecipientCount}</span> recipient(s)
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendBulkSMS}
                  disabled={sendingProgress.inProgress || selectedRecipients.length === 0 || !bulkMessage.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MdSend />
                  {sendingProgress.inProgress ? 'Sending...' : 'Send SMS'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewTable