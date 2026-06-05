'use client'
import React, { useEffect, useState } from "react";
import { FaTimes, FaMapMarkerAlt } from "react-icons/fa";

const AreaEditModal = ({ isOpen, onClose, onSubmit, area, locations=[] }) => {
  const [formData, setFormData] = useState({
    area_name: "",
    location_id: "",
  });

  // Populate form data when editing an existing area
  useEffect(() => {
    if (area) {
      setFormData({
        area_name: area.area_name || "",
        location_id: area.location_id || area.address || "",
      });
    }
  }, [area]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Send JSON data instead of FormData
    const jsonData = {
      id: area.id,
      area_name: formData.area_name.trim(),
      location_id: parseInt(formData.location_id),
    };

    onSubmit(jsonData);
  };

  const handleClose = () => {
    // Reset form when closing
    if (area) {
      setFormData({
        area_name: area.area_name || "",
        location_id: area.location_id || "",
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
            <h2 className="text-xl font-semibold text-white">Edit Area</h2>
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
      {/* Region Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <FaMapMarkerAlt className="inline w-4 h-4 mr-2 text-blue-600" />
              Region *
            </label>
            <select
              name="location_id"
              value={formData.location_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
            >
              <option value="">Select Region</option>
              {locations && locations.length > 0 ? (
                locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.location_name}
                  </option>
                ))
              ) : (
                <option value="" disabled>No region available</option>
              )}
            </select>
            {formData.location_id && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Selected Region ID: {formData.location_id}
              </p>
            )}
          </div>

          {/* area Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Area Name *
            </label>
            <input
              type="text"
              name="area_name"
              value={formData.area_name}
              onChange={handleChange}
              required
              placeholder="Enter Area name"
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
              disabled={!formData.area_name.trim() || !formData.location_id}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              Update Area
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AreaEditModal;