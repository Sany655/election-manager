"use client";
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

// title,
// description,
// priority,
// duetime,
// type,
// status

const PolicyAddModal = ({ isOpen, onClose, onSubmit, title }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    duetime: "",
    type: "General",
    status: "Pending",
  });

  const handleInputChange = (field, value) => {
    // if (field === "work_start_time" || field === "work_end_time") {
    //   const [hour, minute] = value.split(":");
    //   value = `${hour}:${minute}:00`;
    // }
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // const handleDayToggle = (day, type) => {
  //   setFormData((prev) => {
  //     const currentList = prev[type];
  //     const otherType = type === "working_days" ? "off_days" : "working_days";
  //     const otherList = prev[otherType];

  //     if (currentList.includes(day)) {
  //       // Remove from current list
  //       return {
  //         ...prev,
  //         [type]: currentList.filter((d) => d !== day),
  //       };
  //     } else {
  //       // Add to current list and remove from other list
  //       return {
  //         ...prev,
  //         [type]: [...currentList, day],
  //         [otherType]: otherList.filter((d) => d !== day),
  //       };
  //     }
  //   });
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      const jsonData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        duetime: formData.duetime,
        type: formData.type,
        status: formData.status,
      };

      onSubmit(jsonData);
      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        duetime: "",
        type: "General",
        status: "Pending",
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
            Add New {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Policy Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {title} Name *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter ${title} name`}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter ${title} description`}
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange("priority", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="3">High</option>
              <option value="2">Medium</option>
              <option value="1">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Time</label>
            <input
              type="datetime-local"
              value={formData.duetime}
              onChange={(e) => handleInputChange("duetime", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="General">General</option>
              <option value="Urgent">Urgent</option>
              <option value="Optional">Optional</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

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
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PolicyAddModal;
