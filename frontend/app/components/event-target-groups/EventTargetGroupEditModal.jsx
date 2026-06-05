'use client';
import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { AiOutlineAntDesign } from "react-icons/ai";

/**
 * EventTargetGroupEditModal
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onSubmit: (payload) => void  // expects JSON payload with id + fields
 *  - eventtargetgroup: object (existing item)
 */
const EventTargetGroupEditModal = ({ isOpen, onClose, onSubmit, eventtargetgroup }) => {
  const [formData, setFormData] = useState({
    eventtargetgroup_name: "",
    eventtargetgroup_namedescription: "",
  });

  // Populate form data when editing an existing eventtargetgroup
  useEffect(() => {
    if (eventtargetgroup) {
      setFormData({
        eventtargetgroup_name: eventtargetgroup.name ?? eventtargetgroup.eventtargetgroup_name ?? "",
        eventtargetgroup_description:
          eventtargetgroup.description ?? eventtargetgroup.eventtargetgroup_description ?? "",
      });
    } else {
      // if no eventtargetgroup, clear form
      setFormData({
        eventtargetgroup_name: "",
        eventtargetgroup_description: "",
      });
    }
  }, [eventtargetgroup]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!eventtargetgroup) {
      console.error("No event target group provided for edit");
      return;
    }

    // Get id from eventtargetgroup prop, support both SQL and Mongo style
    const id = eventtargetgroup.id ?? eventtargetgroup._id;
    if (!id) {
      console.error("Event target Group id missing");
      return;
    }

    const payload = {
      id,
      // include common keys backend likely expects
      name: formData.eventtargetgroup_name.trim(),
      description: formData.eventtargetgroup_description.trim(),
      // keep legacy keys if you used them elsewhere
      eventtargetgroup_name: formData.eventtargetgroup_name.trim(),
      eventtargetgroup_description: formData.eventtargetgroup_description.trim(),
    };

    onSubmit(payload);
  };

  const handleClose = () => {
    // Reset form to original eventtargetgroup values (if any)
    if (eventtargetgroup) {
      setFormData({
        eventtargetgroup_name: eventtargetgroup.name ?? eventtargetgroup.eventtargetgroup_name ?? "",
        eventtargetgroup_description:
          eventtargetgroup.description ?? eventtargetgroup.eventtargetgroup_description ?? "",
      });
    } else {
      setFormData({
        eventtargetgroup_name: "",
        eventtargetgroup_description: "",
      });
    }
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <AiOutlineAntDesign className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Edit Event Group</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            aria-label="Close edit event type"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              name="eventtargetgroup_name"
              value={formData.eventtargetgroup_name}
              onChange={handleChange}
              required
              placeholder="Enter event type name"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="eventtargetgroup_description"
              value={formData.eventtargetgroup_description}
              onChange={handleChange}
              rows={3}
              placeholder="Enter description"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 resize-none"
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
              disabled={!formData.eventtargetgroup_name.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventTargetGroupEditModal;