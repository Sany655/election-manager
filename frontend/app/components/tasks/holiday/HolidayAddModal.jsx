"use client";
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

const HolidayAddModal = ({
  isOpen,
  onClose,
  onSubmit,
  locations = [],
  areas = [],
  users = [],
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    type: "",
    scope: "",
    location_id: "",
    area_id: "",
    is_recurring: false,
    user_ids: [],
  });

  const holidayTypes = [
    { value: "company", label: "Company Holiday" },
    { value: "government", label: "Government Holiday" },
    { value: "religious", label: "Religious Holiday" },
    { value: "team_specific", label: "Team Specific Holiday" },
    { value: "location_specific", label: "Location Speicifc Holiday" },
    { value: "area_specific", label: "Area Speicifc Holiday" },
    { value: "territory_specific", label: "Terrirtiry Specific Holiday" },
  ];

  const scopeOptions = [
    { value: "global", label: "Global Wide" },
    { value: "team", label: "Team Specific" },
    { value: "location", label: "Location Specific" },
    { value: "area", label: "Area Specific" },
    { value: "territory", label: "Territory Specific" },
    { value: "user_speicific", label: "Individual Users" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUserIdsChange = (selectedOptions) => {
    const userIds = Array.from(selectedOptions).map((option) =>
      parseInt(option.value)
    );
    setFormData((prev) => ({
      ...prev,
      user_ids: userIds,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim() && formData.date) {
      const jsonData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        date: formData.date,
        type: formData.type,
        scope: formData.scope,
        ...(formData.location_id && {
          location_id: parseInt(formData.location_id),
        }),
        ...(formData.area_id && { area_id: parseInt(formData.area_id) }),
        is_recurring: formData.is_recurring,
        ...(formData.user_ids.length > 0 && { user_ids: formData.user_ids }),
      };

      onSubmit(jsonData);
      setFormData({
        name: "",
        description: "",
        date: "",
        type: "public",
        scope: "company",
        location_id: "",
        area_id: "",
        is_recurring: false,
        user_ids: [],
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Add New Holiday
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Holiday Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Holiday Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter holiday name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter holiday description"
              rows="3"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Type and Scope */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Holiday Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select One</option>
                {holidayTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scope *
              </label>
              <select
                value={formData.scope}
                onChange={(e) => handleInputChange("scope", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select One</option>
                {scopeOptions.map((scope) => (
                  <option key={scope.value} value={scope.value}>
                    {scope.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (optional)
              </label>
              <select
                value={formData.location_id}
                onChange={(e) =>
                  handleInputChange("location_id", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area (optional)
              </label>
              <select
                value={formData.area_id}
                onChange={(e) => handleInputChange("area_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Area</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

    
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.is_recurring}
                onChange={(e) =>
                  handleInputChange("is_recurring", e.target.checked)
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Recurring Holiday (optional)
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Check if this holiday occurs annually on the same date
            </p>
          </div>

        
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Users (optional)
            </label>
            <select
              multiple
              value={formData.user_ids.map((id) => id.toString())}
              onChange={(e) => handleUserIdsChange(e.target.selectedOptions)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              size="4"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Hold Ctrl/Cmd to select multiple users. Relevant when scope is
              "Individual Users"
            </p>
          </div> */}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Holiday
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HolidayAddModal;
