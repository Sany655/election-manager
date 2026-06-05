'use client';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaTimes, FaSearch, FaTrash } from 'react-icons/fa';

const AssignHolidayModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  users = [], 
  holidays = [], 
  initialData = null 
}) => {
  const [assignmentData, setAssignmentData] = useState({
    user_ids: [],
    holiday_ids: []
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedHolidays, setSelectedHolidays] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setAssignmentData({
          user_ids: initialData.user_ids || [],
          holiday_ids: initialData.holiday_ids || []
        });
        
        // Set selected users based on initial data
        const preSelectedUsers = users.filter(user => 
          initialData.user_ids?.includes(user.id)
        );
        setSelectedUsers(preSelectedUsers);

        // Set selected holidays based on initial data
        const preSelectedHolidays = holidays.filter(holiday => 
          initialData.holiday_ids?.includes(holiday.id)
        );
        setSelectedHolidays(preSelectedHolidays);
      } else {
        setAssignmentData({
          user_ids: [],
          holiday_ids: []
        });
        setSelectedUsers([]);
        setSelectedHolidays([]);
      }
    }
  }, [isOpen, initialData, users, holidays]);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSelect = (user) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      const newSelectedUsers = [...selectedUsers, user];
      setSelectedUsers(newSelectedUsers);
      setAssignmentData(prev => ({
        ...prev,
        user_ids: newSelectedUsers.map(u => u.id)
      }));
    }
    setSearchTerm('');
    setShowUserDropdown(false);
  };

  const handleUserRemove = (userId) => {
    const newSelectedUsers = selectedUsers.filter(user => user.id !== userId);
    setSelectedUsers(newSelectedUsers);
    setAssignmentData(prev => ({
      ...prev,
      user_ids: newSelectedUsers.map(u => u.id)
    }));
  };

  const handleHolidayToggle = (holiday) => {
    const isSelected = selectedHolidays.find(h => h.id === holiday.id);
    let newSelectedHolidays;

    if (isSelected) {
      newSelectedHolidays = selectedHolidays.filter(h => h.id !== holiday.id);
    } else {
      newSelectedHolidays = [...selectedHolidays, holiday];
    }

    setSelectedHolidays(newSelectedHolidays);
    setAssignmentData(prev => ({
      ...prev,
      holiday_ids: newSelectedHolidays.map(h => h.id)
    }));
  };

  const handleSelectAllUsers = () => {
    setSelectedUsers([...users]);
    setAssignmentData(prev => ({
      ...prev,
      user_ids: users.map(u => u.id)
    }));
  };

  const handleClearAllUsers = () => {
    setSelectedUsers([]);
    setAssignmentData(prev => ({
      ...prev,
      user_ids: []
    }));
  };

  const handleSelectAllHolidays = () => {
    setSelectedHolidays([...holidays]);
    setAssignmentData(prev => ({
      ...prev,
      holiday_ids: holidays.map(h => h.id)
    }));
  };

  const handleClearAllHolidays = () => {
    setSelectedHolidays([]);
    setAssignmentData(prev => ({
      ...prev,
      holiday_ids: []
    }));
  };

  const validateForm = () => {
    return (
      assignmentData.user_ids.length > 0 &&
      assignmentData.holiday_ids.length > 0
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.dismiss();
      toast.error('Please select at least one user and one holiday');
      return;
    }

    const assignmentPayload = {
      user_ids: assignmentData.user_ids,
      holiday_ids: assignmentData.holiday_ids
    };
    
    onSubmit(assignmentPayload);
    handleClose();
  };

  const handleClose = () => {
    setAssignmentData({
      user_ids: [],
      holiday_ids: []
    });
    
    setSelectedUsers([]);
    setSelectedHolidays([]);
    setSearchTerm('');
    setShowUserDropdown(false);
    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Assign Holidays to Users
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Holiday Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Select Holidays * ({selectedHolidays.length} selected)
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleSelectAllHolidays}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllHolidays}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                {holidays.map(holiday => {
                  const isSelected = selectedHolidays.find(h => h.id === holiday.id);
                  return (
                    <div
                      key={holiday.id}
                      onClick={() => handleHolidayToggle(holiday)}
                      className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        isSelected ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={() => handleHolidayToggle(holiday)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{holiday.name}</div>
                          <div className="text-xs text-gray-600">
                            {formatDate(holiday.date)} • {holiday.type} • {holiday.scope}
                          </div>
                          {holiday.description && (
                            <div className="text-xs text-gray-500 mt-1">
                              {holiday.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {holidays.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No holidays available
                </div>
              )}
            </div>

            {/* User Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Users * ({selectedUsers.length} selected)
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleSelectAllUsers}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllUsers}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* User Search */}
              <div className="relative mb-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowUserDropdown(true);
                    }}
                    onFocus={() => setShowUserDropdown(true)}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Search users by name, email, or employee ID..."
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" size={14} />
                </div>

                {/* User Dropdown */}
                {showUserDropdown && filteredUsers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredUsers.map(user => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleUserSelect(user)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                        disabled={selectedUsers.find(u => u.id === user.id)}
                      >
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">
                            {user.email} {user.employee_id && `• ${user.employee_id}`}
                          </div>
                        </div>
                        {selectedUsers.find(u => u.id === user.id) && (
                          <span className="text-green-500 text-sm">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
                  <div className="grid grid-cols-1 gap-2">
                    {selectedUsers.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-xs text-gray-600">{user.email}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUserRemove(user.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Assignment Summary */}
            {selectedUsers.length > 0 && selectedHolidays.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-sm text-gray-900 mb-2">Assignment Summary:</h4>
                <p className="text-sm text-gray-700">
                  You are about to assign <span className="font-medium">{selectedHolidays.length} holiday(s)</span> to{' '}
                  <span className="font-medium">{selectedUsers.length} user(s)</span>.
                </p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!validateForm()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Holidays
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignHolidayModal;