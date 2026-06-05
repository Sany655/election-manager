'use client'
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

const UserAddModal = ({ isOpen, onClose, onSubmit, roles = [], policies }) => {
  const [formData, setFormData] = useState({
    role: "",
    policy: "",
    firstName: "",
    lastName: "",
    email: "",
    msisdn: "",
    password: "",
    status: true,
    avatar: null,
    avatarPreview: null,
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      const file = files[0];
      if (file) {
        setFormData((prev) => ({
          ...prev,
          avatar: file,
          avatarPreview: URL.createObjectURL(file),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "imagePreview" && value) {
        formDataToSend.append(key, value);
      }
    });

    const result = await onSubmit(formDataToSend);
    if (result && !result.success) {
      setError(result.msg);
    }
    // onClose is now handled by parent in success case
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Add New</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <FaTimes />
          </button>
        </div>

        {/* Form (Scrollable Content) */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">User Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg cursor-pointer"
              required
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">User Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg cursor-pointer"
              required
            >
              <option value="">Select Attendance Policy</option>
              {policies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>


          {[
            { label: "First Name", name: "firstName", type: "text", placeholder: `Enter First Name`, required: true },
            { label: "Last Name", name: "lastName", type: "text", placeholder: `Enter Last Name` },
            { label: "Email", name: "email", type: "email", placeholder: `Enter Email`, required: true },
            { label: "Mobile", name: "msisdn", type: "text", placeholder: `Enter msisdn` },
            { label: "Password", name: "password", type: "text", placeholder: `Enter Password`, required: true },
          ].map(({ label, name, type, placeholder, required }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700">{label}</label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required={required}
                className="w-full mt-1 p-2 border rounded-lg"
                placeholder={placeholder}
              />
            </div>
          ))}


          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">User Profile Image</label>
            <input
              type="file"
              name="avatar"
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
              accept="image/*"
            />
            {formData.imagePreview && (
              <img src={formData.imagePreview} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="status"
              name="status"
              checked={formData.status}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <label htmlFor="status" className="text-sm font-medium text-gray-700">Active</label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserAddModal;
