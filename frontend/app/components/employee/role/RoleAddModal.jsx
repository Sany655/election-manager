'use client'
import React, { useState, useEffect } from "react";
import { FaTimes, FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";

const RoleAddModal = ({ isOpen, onClose, onSubmit, permissions = [] }) => {
  const [formData, setFormData] = useState({
    role_name: "",
    permission_ids: [],
  });

  const ALL_PERMISSION_ID = permissions.find(p => p.name.toLowerCase() === "all")?.id;

  // Handle input text changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle individual permissions
  const handlePermissionToggle = (permissionId) => {
    if (permissionId === ALL_PERMISSION_ID) {
      // Toggle all
      const allSelected = isAllSelected();
      setFormData(prev => ({
        ...prev,
        permission_ids: allSelected ? [] : permissions.map(p => p.id)
      }));
    } else {
      setFormData(prev => {
        const isSelected = prev.permission_ids.includes(permissionId);
        let updatedIds = isSelected
          ? prev.permission_ids.filter(id => id !== permissionId)
          : [...prev.permission_ids, permissionId];

        // Sync 'all' checkbox
        const allIds = permissions.map(p => p.id);
        const hasAll = updatedIds.length === allIds.length;
        if (hasAll && !updatedIds.includes(ALL_PERMISSION_ID)) {
          updatedIds.push(ALL_PERMISSION_ID);
        } else if (!hasAll && updatedIds.includes(ALL_PERMISSION_ID)) {
          updatedIds = updatedIds.filter(id => id !== ALL_PERMISSION_ID);
        }

        return {
          ...prev,
          permission_ids: updatedIds
        };
      });
    }
  };

  const isAllSelected = () =>
    formData.permission_ids.length === permissions.length;

  const handleSubmit = (e) => {
    e.preventDefault();
    const { role_name, permission_ids } = formData;
    onSubmit({
      role_name: role_name.trim(),
      permission_ids: permission_ids
    });
  };

  const handleClose = () => {
    setFormData({
      role_name: "",
      permission_ids: []
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FaMapMarkerAlt className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Add New Role</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Role Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Role Name *
            </label>
            <input
              type="text"
              name="role_name"
              value={formData.role_name}
              onChange={handleChange}
              required
              placeholder="Enter role name"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Select Permissions
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {permissions.map((perm) => {
                const isChecked = formData.permission_ids.includes(perm.id);
                const isAll = perm.id === ALL_PERMISSION_ID;

                return (
                  <label
                    key={perm.id}
                    className={`flex items-center gap-2 text-sm px-2 py-1 rounded ${
                      isAll
                        ? 'bg-blue-100 dark:bg-blue-900 font-semibold text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handlePermissionToggle(perm.id)}
                      className={`form-checkbox ${
                        isAll ? 'accent-blue-500' : 'accent-indigo-500'
                      }`}
                    />
                    <span>{perm.name}</span>
                    {isAll && isChecked && <FaCheckCircle className="text-green-500 ml-auto" />}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.role_name.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              Add Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleAddModal;
