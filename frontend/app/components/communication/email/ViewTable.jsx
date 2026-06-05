'use client'
import React, { useState, useEffect } from 'react'
import { 
  MdEmail,
  MdCheckCircle,
  MdError,
  MdRefresh,
  MdSave,
  MdSend,
  MdAttachFile,
  MdDelete,
  MdEdit,
  MdVisibility,
  MdContentCopy,
  MdAdd
} from 'react-icons/md'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { 
  FaEnvelope, 
  FaServer, 
  FaChartLine,
  FaFileAlt 
} from 'react-icons/fa'

const ViewTable = () => {
  const [config, setConfig] = useState({
    provider: 'gmail',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    encryption: 'tls',
    username: '',
    password: '',
    from_name: '',
    from_email: '',
    reply_to: '',
    cc: '',
    bcc: '',
  })

  const [advancedSettings, setAdvancedSettings] = useState({
    queue_enabled: false,
    retry_attempts: 3,
    timeout: 30,
    max_attachment_size: 10,
  })

  const [signature, setSignature] = useState({
    content: '',
    logo_url: '',
    social_links: {
      facebook: '',
      twitter: '',
      website: '',
    },
    disclaimer: '',
    apply_to_all: true,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [activeTab, setActiveTab] = useState('config') // config, templates, test, signature
  const [loading, setLoading] = useState(false)

  // Test Email State
  const [testEmail, setTestEmail] = useState({
    recipient: '',
    subject: '',
    body: '',
    attachments: [],
  })

  // Templates State
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Welcome Email',
      subject: 'Welcome to {{campaign_name}}',
      category: 'transactional',
      body: '<h2>Welcome {{name}}!</h2><p>Thank you for joining our campaign...</p>',
      variables: ['name', 'campaign_name'],
      last_modified: '2024-01-15',
    },
    {
      id: 2,
      name: 'Event Invitation',
      subject: 'You\'re Invited: {{event_name}}',
      category: 'marketing',
      body: '<h2>Join us for {{event_name}}</h2><p>Date: {{event_date}}</p><p>Time: {{event_time}}</p>',
      variables: ['event_name', 'event_date', 'event_time'],
      last_modified: '2024-01-18',
    },
    {
      id: 3,
      name: 'Survey Request',
      subject: 'We Value Your Opinion',
      category: 'notification',
      body: '<p>Dear {{name}},</p><p>Please take a moment to share your thoughts...</p>',
      variables: ['name'],
      last_modified: '2024-01-20',
    },
  ])

  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState({
    name: '',
    subject: '',
    category: 'transactional',
    body: '',
  })

  const providers = [
    { value: 'gmail', label: 'Gmail', host: 'smtp.gmail.com', port: 587, encryption: 'tls' },
    { value: 'sendgrid', label: 'SendGrid', host: 'smtp.sendgrid.net', port: 587, encryption: 'tls' },
    { value: 'mailgun', label: 'Mailgun', host: 'smtp.mailgun.org', port: 587, encryption: 'tls' },
    { value: 'aws_ses', label: 'AWS SES', host: 'email-smtp.us-east-1.amazonaws.com', port: 587, encryption: 'tls' },
    { value: 'custom', label: 'Custom SMTP', host: '', port: 587, encryption: 'tls' },
  ]

  const encryptionTypes = [
    { value: 'tls', label: 'TLS' },
    { value: 'ssl', label: 'SSL' },
    { value: 'none', label: 'None' },
  ]

  const portOptions = [25, 465, 587, 2525]

  const categories = [
    { value: 'transactional', label: 'Transactional' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'notification', label: 'Notification' },
  ]

  const handleProviderChange = (e) => {
    const selectedProvider = providers.find(p => p.value === e.target.value)
    if (selectedProvider) {
      setConfig({
        ...config,
        provider: e.target.value,
        smtp_host: selectedProvider.host,
        smtp_port: selectedProvider.port,
        encryption: selectedProvider.encryption,
      })
    }
  }

  const handleConfigChange = (field, value) => {
    setConfig({ ...config, [field]: value })
  }

  const handleAdvancedChange = (field, value) => {
    setAdvancedSettings({ ...advancedSettings, [field]: value })
  }

  const handleSignatureChange = (field, value) => {
    setSignature({ ...signature, [field]: value })
  }

  const handleSocialLinkChange = (platform, value) => {
    setSignature({
      ...signature,
      social_links: { ...signature.social_links, [platform]: value }
    })
  }

  const handleSaveConfig = async () => {
    setLoading(true)
    try {
      console.log('Saving config:', { config, advancedSettings, signature })
      setTimeout(() => {
        setLoading(false)
        alert('Configuration saved successfully!')
      }, 1000)
    } catch (error) {
      setLoading(false)
      alert('Failed to save configuration')
    }
  }

  const handleTestConnection = async () => {
    setConnectionStatus('testing')
    try {
      console.log('Testing SMTP connection...')
      setTimeout(() => {
        setConnectionStatus('connected')
      }, 2000)
    } catch (error) {
      setConnectionStatus('disconnected')
    }
  }

  const handleSendTest = async () => {
    if (!testEmail.recipient || !testEmail.subject || !testEmail.body) {
      alert('Please fill all required fields')
      return
    }
    
    setLoading(true)
    try {
      console.log('Sending test email:', testEmail)
      setTimeout(() => {
        setLoading(false)
        alert('Test email sent successfully!')
        setTestEmail({ recipient: '', subject: '', body: '', attachments: [] })
      }, 1500)
    } catch (error) {
      setLoading(false)
      alert('Failed to send test email')
    }
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    setTestEmail({
      ...testEmail,
      attachments: [...testEmail.attachments, ...files]
    })
  }

  const removeAttachment = (index) => {
    const newAttachments = testEmail.attachments.filter((_, i) => i !== index)
    setTestEmail({ ...testEmail, attachments: newAttachments })
  }

  const getCategoryBadge = (category) => {
    const badges = {
      transactional: 'bg-blue-100 text-blue-700',
      marketing: 'bg-purple-100 text-purple-700',
      notification: 'bg-green-100 text-green-700',
    }
    return badges[category] || badges.transactional
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MdEmail className="text-2xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Email Configuration</h1>
              <p className="text-sm text-gray-500">Configure SMTP settings and email templates</p>
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center gap-2">
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

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          {['config', 'templates', 'signature', 'test'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* SMTP Settings Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaServer className="text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">SMTP Server Settings</h2>
              </div>
              
              <div className="space-y-4">
                {/* Provider Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Provider
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

                {/* SMTP Host & Port */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={config.smtp_host}
                      onChange={(e) => handleConfigChange('smtp_host', e.target.value)}
                      placeholder="smtp.example.com"
                      disabled={config.provider !== 'custom'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Port
                    </label>
                    <select
                      value={config.smtp_port}
                      onChange={(e) => handleConfigChange('smtp_port', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {portOptions.map(port => (
                        <option key={port} value={port}>{port}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Encryption */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Encryption Type
                  </label>
                  <select
                    value={config.encryption}
                    onChange={(e) => handleConfigChange('encryption', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {encryptionTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username / Email
                  </label>
                  <input
                    type="text"
                    value={config.username}
                    onChange={(e) => handleConfigChange('username', e.target.value)}
                    placeholder="your-email@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password / App Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={config.password}
                      onChange={(e) => handleConfigChange('password', e.target.value)}
                      placeholder="Enter password"
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {config.provider === 'gmail' && (
                    <p className="text-xs text-blue-600 mt-1">
                      Use App Password for Gmail. <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="underline">Learn more</a>
                    </p>
                  )}
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

            {/* Sender Information Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaEnvelope className="text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">Sender Information</h2>
              </div>
              
              <div className="space-y-4">
                {/* From Name & Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={config.from_name}
                      onChange={(e) => handleConfigChange('from_name', e.target.value)}
                      placeholder="Campaign Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={config.from_email}
                      onChange={(e) => handleConfigChange('from_email', e.target.value)}
                      placeholder="noreply@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Reply-To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reply-To Email
                  </label>
                  <input
                    type="email"
                    value={config.reply_to}
                    onChange={(e) => handleConfigChange('reply_to', e.target.value)}
                    placeholder="support@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* CC & BCC */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CC (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={config.cc}
                      onChange={(e) => handleConfigChange('cc', e.target.value)}
                      placeholder="email1@example.com, email2@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      BCC (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={config.bcc}
                      onChange={(e) => handleConfigChange('bcc', e.target.value)}
                      placeholder="email1@example.com, email2@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Settings Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Advanced Settings</h2>
              
              <div className="space-y-4">
                {/* Email Queue */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Enable Email Queue</label>
                    <p className="text-xs text-gray-500">Queue emails for batch sending</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={advancedSettings.queue_enabled}
                      onChange={(e) => handleAdvancedChange('queue_enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Retry Attempts */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retry Attempts on Failure
                  </label>
                  <input
                    type="number"
                    value={advancedSettings.retry_attempts}
                    onChange={(e) => handleAdvancedChange('retry_attempts', parseInt(e.target.value))}
                    min="1"
                    max="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Timeout */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Connection Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    value={advancedSettings.timeout}
                    onChange={(e) => handleAdvancedChange('timeout', parseInt(e.target.value))}
                    min="10"
                    max="120"
                    step="10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Max Attachment Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Attachment Size (MB)
                  </label>
                  <input
                    type="number"
                    value={advancedSettings.max_attachment_size}
                    onChange={(e) => handleAdvancedChange('max_attachment_size', parseInt(e.target.value))}
                    min="1"
                    max="25"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaChartLine className="text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">Quick Stats</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sent Today</span>
                  <span className="font-semibold text-gray-800">456</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Delivered</span>
                  <span className="font-semibold text-green-600">442</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Opened</span>
                  <span className="font-semibold text-blue-600">312</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bounced</span>
                  <span className="font-semibold text-red-600">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Open Rate</span>
                  <span className="font-semibold text-gray-800">70.6%</span>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Configuration Tips</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Always test connection after configuration</li>
                <li>• Use app-specific passwords for Gmail</li>
                <li>• Verify sender email to avoid spam</li>
                <li>• Monitor bounce rates regularly</li>
                <li>• Keep SMTP credentials secure</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Email Templates</h2>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MdAdd />
              Create Template
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Modified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaFileAlt className="text-gray-400" />
                        <div className="text-sm font-medium text-gray-900">{template.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{template.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadge(template.category)}`}>
                        {template.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{template.last_modified}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button className="text-blue-600 hover:text-blue-900">
                          <MdVisibility />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <MdEdit />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <MdContentCopy />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Signature Tab */}
      {activeTab === 'signature' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Email Signature</h2>
            
            <div className="space-y-4">
              {/* Signature Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signature Content
                </label>
                <textarea
                  value={signature.content}
                  onChange={(e) => handleSignatureChange('content', e.target.value)}
                  placeholder="Best regards,
John Doe
Campaign Manager"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL (optional)
                </label>
                <input
                  type="url"
                  value={signature.logo_url}
                  onChange={(e) => handleSignatureChange('logo_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Social Links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Media Links (optional)
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={signature.social_links.facebook}
                    onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                    placeholder="Facebook URL"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="url"
                    value={signature.social_links.twitter}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    placeholder="Twitter/X URL"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="url"
                    value={signature.social_links.website}
                    onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                    placeholder="Website URL"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Disclaimer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Legal Disclaimer (optional)
                </label>
                <textarea
                  value={signature.disclaimer}
                  onChange={(e) => handleSignatureChange('disclaimer', e.target.value)}
                  placeholder="This email and any attachments are confidential..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Apply to All */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Apply to All Emails</label>
                  <p className="text-xs text-gray-500">Automatically add signature to all outgoing emails</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signature.apply_to_all}
                    onChange={(e) => handleSignatureChange('apply_to_all', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="whitespace-pre-wrap text-sm text-gray-700">
                    {signature.content || 'Your signature will appear here...'}
                  </div>
                  {signature.logo_url && (
                    <img src={signature.logo_url} alt="Logo" className="mt-2 h-12" />
                  )}
                  {(signature.social_links.facebook || signature.social_links.twitter || signature.social_links.website) && (
                    <div className="flex gap-2 mt-2">
                      {signature.social_links.facebook && (
                        <a href={signature.social_links.facebook} className="text-blue-600 text-xs">Facebook</a>
                      )}
                      {signature.social_links.twitter && (
                        <a href={signature.social_links.twitter} className="text-blue-600 text-xs">Twitter</a>
                      )}
                      {signature.social_links.website && (
                        <a href={signature.social_links.website} className="text-blue-600 text-xs">Website</a>
                      )}
                    </div>
                  )}
                  {signature.disclaimer && (
                    <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-300">
                      {signature.disclaimer}
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveConfig}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MdSave />
                {loading ? 'Saving...' : 'Save Signature'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Email Tab */}
      {activeTab === 'test' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Send Test Email</h2>
            
            <div className="space-y-4">
              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={testEmail.recipient}
                  onChange={(e) => setTestEmail({ ...testEmail, recipient: e.target.value })}
                  placeholder="recipient@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={testEmail.subject}
                  onChange={(e) => setTestEmail({ ...testEmail, subject: e.target.value })}
                  placeholder="Test Email Subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Body <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={testEmail.body}
                  onChange={(e) => setTestEmail({ ...testEmail, body: e.target.value })}
                  placeholder="Enter your test message here..."
                  rows="8"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                    <MdAttachFile />
                    Choose Files
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-sm text-gray-500">
                    Max {advancedSettings.max_attachment_size}MB per file
                  </span>
                </div>
                
                {testEmail.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {testEmail.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                        <div className="flex items-center gap-2">
                          <MdAttachFile className="text-gray-400" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendTest}
                disabled={loading || !testEmail.recipient || !testEmail.subject || !testEmail.body}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <MdSend />
                {loading ? 'Sending...' : 'Send Test Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewTable