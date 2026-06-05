"use client";
import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { getAuthToken } from "../../utils/helpers";

const EmployeeAddModal = ({
  isOpen,
  onClose,
  onSubmit,
  roles = [],
  policies = [],
  title,
  renderFrom
}) => {
  const [divisions, setDivisions] = useState([]);
  const [error, setError] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [upazillas, setUpazillas] = useState([]);
  const [unions, setUnions] = useState([]);
  const [formData, setFormData] = useState({
    role: roles.find(role => role.name === 'volunteer' && 'volunteer' === renderFrom.trim())?.id || "", //volunteer
    employee_id: "",
    attendence_policy_id: "",
    start_date: "",
    end_date: "",
    user_id: "",
    name: "",
    email: "",
    msisdn: "",
    password: process.env.NEXT_PUBLIC_DEFAULT_USER_PASSWORD || "123456",
    status: true,
    avatar: null,
    avatarPreview: null,
    division_id: "",
    district_id: "",
    upazilla_id: "",
    union_id: "",
    ward: ""
  });

  //functions calls for Divisions
  const fetchDivisions = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/geo/divisions`, {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        }
      });

      const data = await res.json();

      if (!res.ok) {
        setDivisions([]);
        return;
      }

      setDivisions(data);
      setFormData((prev) => ({
        ...prev,
        division_id: data.find((div) => div.name === "Chattagram")?.id,
      }));
    } catch (error) {
      console.error("Fetch failed:", error);
      setDivisions([]);
    }
  };

  useEffect(() => {
    fetchDivisions();
  }, []);

  //functions calls for Districts
  const fetchDistricts = async (division_id) => {
    if (!division_id) {
      setDistricts([]);
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/geo/districts/${division_id}`, {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        }
      });

      const data = await res.json();

      if (!res.ok) {
        setDistricts([]);
        return;
      }

      setDistricts(data);
    } catch (error) {
      console.error("Fetch failed:", error);
      setDistricts([]);
    }
  };

  useEffect(() => {
    fetchDistricts(formData.division_id);
  }, [formData.division_id]);

  //functions calls for Upazillas
  const fetchUpazillas = async (district_id) => {
    if (!district_id) {
      setUpazillas([]);
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/geo/upazillas/${district_id}`, {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        }
      }
      );

      const data = await res.json();

      if (!res.ok) {
        setUpazillas([]);
        return;
      }

      setUpazillas(data);
    } catch (error) {
      console.error("Fetch failed:", error);
      setUpazillas([]);
    }
  };

  useEffect(() => {
    fetchUpazillas(formData.district_id);
  }, [formData.district_id]);

  //functions calls for Unions
  const fetchUnions = async (upazilla_id) => {
    if (!upazilla_id) {
      setUnions([]);
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/geo/unions/${upazilla_id}`, {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        }
      }
      );

      const data = await res.json();

      if (!res.ok) {
        setUnions([]);
        return;
      }

      setUnions(data);
    } catch (error) {
      console.error("Fetch failed:", error);
      setUnions([]);
    }
  };

  useEffect(() => {
    fetchUnions(formData.upazilla_id);
  }, [formData.upazilla_id]);

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
      setFormData((prev) => {
        const newData = {
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        };

        // Reset child fields when parent changes
        if (name === "division_id") {
          newData.district_id = "";
          newData.upazilla_id = "";
          newData.union_id = "";
          setDistricts([]);
          setUpazillas([]);
          setUnions([]);
        } else if (name === "district_id") {
          newData.upazilla_id = "";
          newData.union_id = "";
          setUpazillas([]);
          setUnions([]);
        } else if (name === "upazilla_id") {
          newData.union_id = "";
          setUnions([]);
        }

        return newData;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const formDataToSend = new FormData();

    // Append all form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "avatarPreview" && value !== null && value !== "") {
        // Convert boolean to string for FormData
        if (typeof value === "boolean") {
          formDataToSend.append(key, value ? "1" : "0");
        } else {
          formDataToSend.append(key, value);
        }
      }
    });

    const result = await onSubmit(formDataToSend);
    if (result && !result.success) {
      setError(result.msg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Add New {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg cursor-pointer"
              required
              disabled={renderFrom === 'volunteer'}
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700">
              Attendance Policy
            </label>
            <select
              name="attendence_policy_id"
              value={formData.attendence_policy_id}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg cursor-pointer"
              required
            >
              <option value="">Select policy</option>
              {policies.map((policy) => (
                <option key={policy.id} value={policy.id}>
                  {policy.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Policy's start date *
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Policy's end date *</p>
            </div>
          </div> */}

          {/* Text Fields */}
          {[
            {
              label: `${title} ID`,
              name: "employee_id",
              type: "text",
              placeholder: `Enter ${title} ID`,
              required: true,
            },
            {
              label: "Full Name",
              name: "name",
              type: "text",
              placeholder: "Enter Full Name",
              required: true,
            },
            {
              label: "Email",
              name: "email",
              type: "email",
              placeholder: "Enter Email",
            },
            {
              label: "Mobile Number",
              name: "msisdn",
              type: "text",
              placeholder: "Enter Mobile Number",
            },
            {
              label: "Password",
              name: "password",
              type: "password",
              placeholder: "Enter Password",
              required: true,
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

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Division
            </label>
            <select
              name="division_id"
              value={formData.division_id}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
            >
              <option value="">Select Division</option>
              {divisions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700">
                District
              </label>
              <select
                name="district_id"
                value={formData.district_id}
                onChange={handleChange}
                className="w-full mt-1 p-2 border rounded-lg"
              >
                <option value="">Select District</option>
                {districts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upazilla
              </label>
              <select
                name="upazilla_id"
                value={formData.upazilla_id}
                onChange={handleChange}
                className="w-full mt-1 p-2 border rounded-lg"
              >
                <option value="">Select Upazilla</option>
                {upazillas?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Union
              </label>
              <select
                name="union_id"
                value={formData.union_id}
                onChange={handleChange}
                className="w-full mt-1 p-2 border rounded-lg"
              >
                <option value="">Select Union</option>
                {unions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ward
              </label>
              <input
                type="number"
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                className="w-full mt-1 p-2 border rounded-lg"
                placeholder="Enter Ward Number"
              />
            </div>
          </div>

          {/* Avatar Upload */}
          {/* <div>
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
              <img
                src={formData.avatarPreview}
                alt="Preview"
                className="mt-2 w-32 h-32 object-cover rounded-lg border"
              />
            )}
          </div> */}

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

          {/* Form */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              {typeof error === 'object' ? (
                <ul className="list-disc list-inside">
                  {Object.values(error).flat().map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              ) : (
                <span className="block sm:inline">{error}</span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
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
              Add {title}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeAddModal;
