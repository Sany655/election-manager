"use client";
import { BASE_URL_FOR_CLIENT } from "@/app/utils/constants";
import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

const HolidayEditModal = ({ isOpen, onClose, onSubmit, roles = [], user }) => {
  const [formData, setFormData] = useState({
    role: "",
    employee_id: "",
    name: "",
    email: "",
    msisdn: "",
    password: "",
    status: true,
    avatar: null,
    avatarPreview: null,
  });

  // Populate form data when editing an existing user
  useEffect(() => {
    if (user) {
      setFormData({
        role: user.roles?.[0]?.id || "",  // Get role ID from user's roles array
        employee_id: user.employee_id || "",
        name: user.name || "",
        email: user.email || "",
        msisdn: user.msisdn || "",
        password: "", // Don't pre-fill password for security
        status: user.isActive !== undefined ? user.isActive : true,
        avatar: null, // Reset file input
        avatarPreview: user.avatar
          ? `${BASE_URL_FOR_CLIENT}/${user.avatar}`
          : null,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      const file = files?.[0];
      if (file) {
        setFormData((prev) => ({
          ...prev,
          avatar: file, // Consistent naming with add modal
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    
    // Always append the user ID for updates
    formDataToSend.append("id", user.id);
    
    // Append all form fields (excluding preview)
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "avatarPreview") return; // Skip preview
      
      if (value !== null && value !== "") {
        // Convert boolean to string for FormData
        if (typeof value === "boolean") {
          formDataToSend.append(key, value ? "1" : "0");
        } else {
          formDataToSend.append(key, value);
        }
      }
    });

    // Debug: Log FormData contents
    console.log("Edit FormData contents:");
    for (let [key, value] of formDataToSend.entries()) {
      console.log(key, value);
    }

    onSubmit(formDataToSend);
  };

  const handleClose = () => {
    // Clean up object URL to prevent memory leaks
    if (formData.avatarPreview && formData.avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(formData.avatarPreview);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Edit Employee</h2>
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              User Role
            </label>
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

          {/* Form Fields */}
          {[
            {
              label: "Full Name",
              name: "name",
              type: "text",
              placeholder: "Enter Full Name",
              required: true,
            },
            {
              label: "Employee ID",
              name: "employee_id",
              type: "text",
              placeholder: "Enter Employee ID",
              required: true,
            },
            {
              label: "Email",
              name: "email",
              type: "email",
              placeholder: "Enter Email",
              required: false,
            },
            {
              label: "Mobile Number",
              name: "msisdn",
              type: "text",
              placeholder: "Enter Mobile Number",
              required: false,
            },
            {
              label: "New Password",
              name: "password",
              type: "password",
              placeholder: "Enter new password (leave blank to keep current)",
              required: false,
            },
          ].map(({ label, name, type, placeholder, required }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700">
                {label}
              </label>
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

          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Profile Picture
            </label>
            <input
              type="file"
              name="avatar"
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
              accept="image/*"
            />
            {formData.avatarPreview && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Current/Preview:</p>
                <img
                  src={formData.avatarPreview}
                  alt="Avatar Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Status Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="status"
              name="status"
              checked={formData.status}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <label
              htmlFor="status"
              className="text-sm font-medium text-gray-700"
            >
              Active Status
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HolidayEditModal;