"use client";
import React, { useEffect, useState } from "react";
import { FaTimes, FaBuilding } from "react-icons/fa";

/**
 * OrganizerEditModal
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onSubmit: (payload) => void
 *  - organizer: object
 */
const OrganizerEditModal = ({ isOpen, onClose, onSubmit, organizer }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    status: true,
  });

  /* -----------------------------
     Populate form on edit
  ------------------------------ */
  useEffect(() => {
    if (organizer) {
      setFormData({
        name: organizer.name ?? "",
        type: organizer.type ?? "",
        contact_person: organizer.contact_person ?? "",
        email: organizer.email ?? "",
        phone: organizer.phone ?? "",
        address: organizer.address ?? "",
        status: organizer.status === 1 || organizer.status === true,
      });
    }
  }, [organizer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!organizer?.id) return;

    const payload = {
      id: organizer.id,
      name: formData.name.trim(),
      type: formData.type || null,
      contact_person: formData.contact_person || null,
      email: formData.email || null,
      phone: formData.phone || null,
      address: formData.address || null,
      status: formData.status ? 1 : 0,
    };

    onSubmit(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FaBuilding className="text-white" />
            <h2 className="text-xl font-semibold text-white">
              Edit Organizer
            </h2>
          </div>
          <button onClick={onClose} className="text-white">
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Organizer Name *
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Organizer Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Select type</option>
              <option value="Government">Government</option>
              <option value="NGO">NGO</option>
              <option value="Private">Private</option>
              <option value="Community">Community</option>
              <option value="Partner">Partner</option>
            </select>
          </div>

          {/* Contact Person */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Contact Person
            </label>
            <input
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Phone
            </label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="status"
              checked={formData.status}
              onChange={handleChange}
            />
            <label className="text-sm">Active</label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim()}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg"
            >
              Update Organizer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizerEditModal;