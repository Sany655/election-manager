'use client'
import React, { useEffect, useState } from "react";
import { FaTimes, FaMapMarkerAlt } from "react-icons/fa";

const RoleEditModal = ({ isOpen, onClose, onSubmit, role, permissions = [] }) => {
  const [formData, setFormData] = useState({
    role_name: "",
    permission_ids: [],
  });

useEffect(() => {
  if (role) {
    setFormData({
      role_name: role.name || "",
      permission_ids: role.permissions ? role.permissions.map(p => p.id) : [],
    });
  }
}, [role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePermissionToggle = (id) => {
    if (id === "all") {
      // Toggle all permissions
      const allIds = permissions.map((p) => p.id);
      const isAllSelected = allIds.every((pid) => formData.permission_ids.includes(pid));
      setFormData((prev) => ({
        ...prev,
        permission_ids: isAllSelected ? [] : allIds,
      }));
    } else {
      setFormData((prev) => {
        const exists = prev.permission_ids.includes(id);
        const newIds = exists
          ? prev.permission_ids.filter((pid) => pid !== id)
          : [...prev.permission_ids, id];
        return {
          ...prev,
          permission_ids: newIds,
        };
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: role.id,
      role_name: formData.role_name.trim(),
      permission_ids: formData.permission_ids,
    });
  };

  const handleClose = () => {
    if (role) {
      setFormData({
        role_name: role.name || "",
        permission_ids: role.permission_ids || [],
      });
    }
    onClose();
  };

  const allPermissionIds = permissions.map((p) => p.id);
  const isAllChecked = allPermissionIds.every((id) => formData.permission_ids.includes(id));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FaMapMarkerAlt className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Edit Role</h2>
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
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Permissions
            </label>
            <div className="space-y-2 max-h-52 overflow-y-auto">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllChecked}
                  onChange={() => handlePermissionToggle("all")}
                  className="accent-yellow-500 w-4 h-4"
                />
                Select All
              </label>
              {permissions.map((perm) => (
                <label
                  key={perm.id}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.permission_ids.includes(perm.id)}
                    onChange={() => handlePermissionToggle(perm.id)}
                    className="accent-yellow-500 w-4 h-4"
                  />
                  {perm.name}
                </label>
              ))}
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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              Update Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleEditModal;
