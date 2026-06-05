"use client";
import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { getAuthToken } from "../../../utils/helpers";

const TeamAddModal = ({ isOpen, onClose, onSubmit, title, initialData }) => {
  const [formData, setFormData] = useState({
    team_name: "",
    division_id: "",
    district_id: "",
    upazilla_id: "",
    union_id: "",
  });

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazillas, setUpazillas] = useState([]);
  const [unions, setUnions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchDivisions();
      if (initialData) {
        setFormData({
          team_name: initialData.name,
          division_id: initialData.division_id || "",
          district_id: initialData.district_id || "",
          upazilla_id: initialData.upazilla_id || "",
          union_id: initialData.union_id || "",
        });

        // Pre-fetch dependent dropdowns
        if (initialData.division_id) fetchDistricts(initialData.division_id);
        if (initialData.district_id) fetchUpazillas(initialData.district_id);
        if (initialData.upazilla_id) fetchUnions(initialData.upazilla_id);
      } else {
        // Reset form if adding new
        setFormData({
          team_name: "",
          division_id: "",
          district_id: "",
          upazilla_id: "",
          union_id: "",
        });
      }
    }
  }, [isOpen, initialData]);

  const fetchDivisions = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/geo/divisions`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      const data = await res.json();
      setDivisions(data);
    } catch (error) {
      console.error("Error fetching divisions:", error);
    }
  };

  const fetchDistricts = async (divisionId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/geo/districts/${divisionId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      const data = await res.json();
      setDistricts(data);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const fetchUpazillas = async (districtId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/geo/upazillas/${districtId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      const data = await res.json();
      setUpazillas(data);
    } catch (error) {
      console.error("Error fetching upazillas:", error);
    }
  };

  const fetchUnions = async (upazillaId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/geo/unions/${upazillaId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      const data = await res.json();
      setUnions(data);
    } catch (error) {
      console.error("Error fetching unions:", error);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === "work_start_time" || field === "work_end_time") {
      const [hour, minute] = value.split(":");
      value = `${hour}:${minute}:00`;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "division_id") {
      setDistricts([]);
      setUpazillas([]);
      setUnions([]);
      setFormData(prev => ({ ...prev, district_id: "", upazilla_id: "", union_id: "" }));
      if (value) fetchDistricts(value);
    } else if (field === "district_id") {
      setUpazillas([]);
      setUnions([]);
      setFormData(prev => ({ ...prev, upazilla_id: "", union_id: "" }));
      if (value) fetchUpazillas(value);
    } else if (field === "upazilla_id") {
      setUnions([]);
      setFormData(prev => ({ ...prev, union_id: "" }));
      if (value) fetchUnions(value);
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.team_name.trim()) {
      const jsonData = {
        team_name: formData.team_name.trim(),
        division_id: formData.division_id || null,
        district_id: formData.district_id || null,
        upazilla_id: formData.upazilla_id || null,
        union_id: formData.union_id || null,
      };

      if (initialData && initialData.id) {
        jsonData.id = initialData.id;
      }

      onSubmit(jsonData);
      setFormData({
        team_name: "",
        division_id: "",
        district_id: "",
        upazilla_id: "",
        union_id: "",
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
            {initialData ? "Edit" : "Add New"} {title}
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
              value={formData.team_name}
              onChange={(e) => handleInputChange("team_name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter ${title} name`}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
              <select
                value={formData.division_id}
                onChange={(e) => handleInputChange("division_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Division</option>
                {divisions.map((div) => (
                  <option key={div.id} value={div.id}>{div.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
              <select
                value={formData.district_id}
                onChange={(e) => handleInputChange("district_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!formData.division_id}
              >
                <option value="">Select District</option>
                {districts.map((dist) => (
                  <option key={dist.id} value={dist.id}>{dist.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upazilla</label>
              <select
                value={formData.upazilla_id}
                onChange={(e) => handleInputChange("upazilla_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!formData.district_id}
              >
                <option value="">Select Upazilla</option>
                {upazillas.map((upz) => (
                  <option key={upz.id} value={upz.id}>{upz.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Union</label>
              <select
                value={formData.union_id}
                onChange={(e) => handleInputChange("union_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!formData.upazilla_id}
              >
                <option value="">Select Union</option>
                {unions.map((uni) => (
                  <option key={uni.id} value={uni.id}>{uni.name}</option>
                ))}
              </select>
            </div>
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
              {initialData ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default TeamAddModal;
