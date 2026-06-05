'use client'
import React, { useEffect, useState } from "react";
import { FaTimes, FaMapMarkerAlt, FaBuilding } from "react-icons/fa";

const TerritoryEditModal = ({ isOpen, onClose, onSubmit, territory, areas = [] }) => {
  const [formData, setFormData] = useState({
    territory_name: "",
    area_id: "",
  });

  // Populate form data when editing an existing territory
  useEffect(() => {
    if (territory) {
      setFormData({
        territory_name: territory.name || territory.territory_name || "",
        area_id: territory.area_id || territory.Area?.id || "",
      });
    } else {
      // Reset form when no territory (for new entries)
      setFormData({
        territory_name: "",
        area_id: "",
      });
    }
  }, [territory]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.territory_name.trim()) {
      alert("Please enter a territory name");
      return;
    }
    
    if (!formData.area_id) {
      alert("Please select an area");
      return;
    }

    // Send JSON data instead of FormData
    const jsonData = {
      id: territory?.id, // Use optional chaining in case territory is null
      territory_name: formData.territory_name.trim(),
      area_id: parseInt(formData.area_id), // Convert to integer since it's an ID
    };

    onSubmit(jsonData);
  };

  const handleClose = () => {
    // Reset form when closing
    if (territory) {
      setFormData({
        territory_name: territory.name || territory.territory_name || "",
        area_id: territory.area_id || territory.Area?.id || "",
      });
    } else {
      setFormData({
        territory_name: "",
        area_id: "",
      });
    }
    onClose();
  };

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
            <h2 className="text-xl font-semibold text-white">
              {territory ? 'Edit Territory' : 'Add Territory'}
            </h2>
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
          {/* Area Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <FaBuilding className="inline w-4 h-4 mr-2 text-blue-600" />
              Area *
            </label>
            <select
              name="area_id"
              value={formData.area_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
            >
              <option value="">Select Area</option>
              {areas && areas.length > 0 ? (
                areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.area_name || area.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>No areas available</option>
              )}
            </select>
            {formData.area_id && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Selected Area ID: {formData.area_id}
              </p>
            )}
          </div>

          {/* Territory Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Territory Name *
            </label>
            <input
              type="text"
              name="territory_name"
              value={formData.territory_name}
              onChange={handleChange}
              required
              placeholder="Enter territory name"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
            />
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
              disabled={!formData.territory_name.trim() || !formData.area_id}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              {territory ? 'Update Territory' : 'Add Territory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TerritoryEditModal;