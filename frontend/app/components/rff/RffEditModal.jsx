"use client";
import React, { useEffect, useState } from "react";
import { FaTimes, FaMapMarkerAlt, FaBuilding } from "react-icons/fa";

const RffEditModal = ({ isOpen, onClose, onSubmit, rff, territories = [] }) => {
  const [formData, setFormData] = useState({
    rff_point_name: "",
    sap_code: "",
    territory_id: "",
    start_date:"",
    isActive: true,
  });

  // Populate form data when editing an existing rff
  useEffect(() => {
    if (rff) {
      setFormData({
        rff_point_name: rff.rff_point_name || rff.name || "",
        sap_code: rff.sap_code || rff.rff_sub_code || "",
        territory_id: rff.territory_id || "",
        start_date: rff.start_date ? rff.start_date.split("T")[0] : "",
        isActive: rff.isActive !== undefined ? rff.isActive : true,
      });
    } else {
      // Reset form when no rff (for new entries)
      setFormData({
        rff_point_name: "",
        sap_code: "",
        territory_id: "",
        start_date:"",
        isActive: true,
      });
    }
  }, [rff]);

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
    if (!formData.rff_point_name.trim()) {
      alert("Please enter RFF point name");
      return;
    }

    if (!formData.territory_id) {
      alert("Please select a territory");
      return;
    }

    // Send JSON data instead of FormData
    const jsonData = {
      id: rff?.id, // Use optional chaining in case rff is null
      rff_point_name: formData.rff_point_name.trim(),
      sap_code: formData.sap_code.trim() || null,
      territory_id: parseInt(formData.territory_id), // Convert to integer since it's an ID
      start_date: formData.start_date,
      isActive: formData.isActive,
    };

    onSubmit(jsonData);
  };

  const handleClose = () => {
    // Reset form when closing
    if (rff) {
      setFormData({
        rff_point_name: rff.rff_point_name || rff.rff_name || "",
        sap_code: rff.sap_code || "",
        territory_id: rff.territory_id || "",
        isActive: rff.isActive !== undefined ? rff.isActive : true,
      });
    } else {
      setFormData({
        rff_point_name: "",
        sap_code: "",
        territory_id: "",
        isActive: true,
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
              {rff ? "Edit RFF Point" : "Add RFF Point"}
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
          {/* Territory Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <FaBuilding className="inline w-4 h-4 mr-2 text-blue-600" />
              Territory *
            </label>
            <select
              name="territory_id"
              value={formData.territory_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
            >
              <option value="">Select Territory</option>
              {territories && territories.length > 0 ? (
                territories.map((territory) => (
                  <option key={territory.id} value={territory.id}>
                    {territory.name || territory.territory_name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No territories available
                </option>
              )}
            </select>
            {formData.territory_id && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Selected Territory ID: {formData.territory_id}
              </p>
            )}
          </div>

          {/* RFF Point Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              RFF Point Name *
            </label>
            <input
              type="text"
              name="rff_point_name"
              value={formData.rff_point_name}
              onChange={handleChange}
              required
              placeholder="Enter RFF point name"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* SAP Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              SAP Code
            </label>
            <input
              type="text"
              name="sap_code"
              value={formData.sap_code}
              onChange={handleChange}
              placeholder="Enter SAP code (optional)"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Starting Date
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
            />
          </div>
          <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="status"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium text-gray-700"
                  >
                    Active Status
                  </label>
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
              disabled={
                !formData.rff_point_name.trim() || !formData.territory_id
              }
              className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              {rff ? "Update RFF Point" : "Add RFF Point"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RffEditModal;
