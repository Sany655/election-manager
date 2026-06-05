'use client';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaTimes, FaSearch, FaTrash } from 'react-icons/fa';

const AssignPolicyModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  users = [], 
  tasks = [], 
  initialData = null,
  title
}) => {
  const [assignmentData, setAssignmentData] = useState({
    user_ids: [],
    task_id: null,
    start_date: '',
    end_date: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setAssignmentData({
          user_ids: initialData.user_ids || [],
          task_id: '',
          // start_date: initialData.start_date || '',
          // end_date: initialData.end_date || ''
        });
        
        // Set selected users based on initial data
        const preSelectedUsers = users.filter(user => 
          initialData.user_ids?.includes(user.id)
        );
        setSelectedUsers(preSelectedUsers);
      } else {
        // Set default dates
        // const today = new Date().toISOString().split('T')[0];
        // const endOfYear = new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0];
        
        // setAssignmentData(prev => ({
        //   ...prev,
        //   start_date: today,
        //   end_date: endOfYear
        // }));
      }
    }
  }, [isOpen, initialData, users]);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignmentChange = (field, value) => {
    setAssignmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  const validateForm = () => {
    return (
      assignmentData.user_ids.length > 0 &&
      assignmentData.task_id
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.dismiss();
      toast.error('Please fill in all required fields');
      return;
    }

    const assignmentPayload = {
      user_ids: assignmentData.user_ids,
      task_id: Number(assignmentData.task_id),
      // start_date: assignmentData.start_date,
      // end_date: assignmentData.end_date
    };
    
    onSubmit(assignmentPayload);
    handleClose();
  };

  const handleClose = () => {
    setAssignmentData({
      user_ids: [],
      attendence_policy_id: '',
      start_date: '',
      end_date: ''
    });
    
    setSelectedUsers([]);
    setSearchTerm('');
    setShowUserDropdown(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Assign Task to Users
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
            {/* Task Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Task *
              </label>
              <select
                // value={assignmentData.tasks}
                onChange={(e) => handleAssignmentChange('task_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a task</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
            {/* Date Range */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={assignmentData.start_date}
                  onChange={(e) => handleAssignmentChange('start_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={assignmentData.end_date}
                  onChange={(e) => handleAssignmentChange('end_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div> */}

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
                Assign {title}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignPolicyModal;