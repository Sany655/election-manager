"use client";
import React, { useState, useEffect } from "react";
import { FaTimes, FaUser } from "react-icons/fa";
import {
  divisions,
  fetchDistricts as fetchDistrictsApi,
  fetchUpazillas as fetchUpazillasApi,
  fetchUnions as fetchUnionsApi
} from "@/app/utils/locationApi";

const VoterAddModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    nid: "",
    phone: "",
    profession: "",
    division: "",
    district: "",
    upazilla: "",
    union: "",
    ward: "",
    voterCenter: "",
  });

  const [districts, setDistricts] = useState([]);
  const [upazillas, setUpazillas] = useState([]);
  const [unions, setUnions] = useState([]);
  const [loading, setLoading] = useState({
    districts: false,
    upazillas: false,
    unions: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const genderOptions = ["Male", "Female", "Other"];

  const wardOptions = [
    { id: 1, name: "Ward 1" },
    { id: 2, name: "Ward 2" },
    { id: 3, name: "Ward 3" },
    { id: 4, name: "Ward 4" },
    { id: 5, name: "Ward 5" },
  ];

  const voterCenterOptions = [
    { id: 1, name: "Central Community Hall" },
    { id: 2, name: "Government Primary School" },
    { id: 3, name: "Municipal Corporation Office" },
    { id: 4, name: "District Sports Complex" },
    { id: 5, name: "City College Auditorium" },
    { id: 6, name: "Public Library Building" },
    { id: 7, name: "Community Center North" },
    { id: 8, name: "Community Center South" },
  ];

  const fetchDistricts = async (divisionId) => {
    try {
      setLoading((prev) => ({ ...prev, districts: true }));
      const data = await fetchDistrictsApi(divisionId);
      setDistricts(data);
    } catch (error) {
      console.error("Error fetching districts:", error);
      setDistricts([]);
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }));
    }
  };

  const fetchUpazillas = async (districtId) => {
    try {
      setLoading((prev) => ({ ...prev, upazillas: true }));
      const data = await fetchUpazillasApi(districtId);
      setUpazillas(data);
    } catch (error) {
      console.error("Error fetching upazillas:", error);
      setUpazillas([]);
    } finally {
      setLoading((prev) => ({ ...prev, upazillas: false }));
    }
  };

  const fetchUnions = async (upazillaId) => {
    try {
      setLoading((prev) => ({ ...prev, unions: true }));
      const data = await fetchUnionsApi(upazillaId);
      setUnions(data);
    } catch (error) {
      console.error("Error fetching unions:", error);
      setUnions([]);
    } finally {
      setLoading((prev) => ({ ...prev, unions: false }));
    }
  };

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name || "",
        age: initialData.age || "",
        gender: initialData.gender || "",
        nid: initialData.nid || "",
        phone: initialData.phone || "",
        profession: initialData.profession || "",
        division: initialData.division_id || "",
        district: initialData.district_id || "",
        upazilla: initialData.upazilla_id || "",
        union: initialData.union_id || "",
        ward: initialData.ward || "",
        voterCenter: initialData.voter_center || "",
      });

      if (initialData.division_id) fetchDistricts(initialData.division_id);
      if (initialData.district_id) fetchUpazillas(initialData.district_id);
      if (initialData.upazilla_id) fetchUnions(initialData.upazilla_id);
    } else if (isOpen) {
      setFormData({
        name: "",
        age: "",
        gender: "",
        nid: "",
        phone: "",
        profession: "",
        division: "",
        district: "",
        upazilla: "",
        union: "",
        ward: "",
        voterCenter: "",
      });
      setDistricts([]);
      setUpazillas([]);
      setUnions([]);
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "division") {
      setFormData(prev => ({
        ...prev,
        district: "",
        upazilla: "",
        union: ""
      }));
      setUpazillas([]);
      setUnions([]);
      fetchDistricts(value);
    } else if (name === "district") {
      setFormData(prev => ({
        ...prev,
        upazilla: "",
        union: ""
      }));
      setUnions([]);
      fetchUpazillas(value);
    } else if (name === "upazilla") {
      setFormData(prev => ({
        ...prev,
        union: ""
      }));
      fetchUnions(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const voterData = {
      name: formData.name.trim(),
      age: parseInt(formData.age),
      gender: formData.gender,
      nid: formData.nid.trim(),
      phone: formData.phone.trim() || null,
      profession: formData.profession.trim() || null,
      division_id: formData.division,
      district_id: formData.district,
      upazilla_id: formData.upazilla,
      union_id: formData.union,
      ward: formData.ward,
      voter_center: formData.voterCenter
    };

    try {
      await onSubmit(voterData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Resetting is handled by useEffect when isOpen changes or when reopening
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FaUser className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">{initialData ? "Edit Voter" : "Add New Voter"}</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Personal Information Section */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter voter's full name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Age and Gender Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Age */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  placeholder="Enter age"
                  min="18"
                  max="120"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                >
                  <option value="">Select Gender</option>
                  {genderOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* NID and Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  NID (National ID) *
                </label>
                <input
                  type="text"
                  name="nid"
                  value={formData.nid}
                  onChange={handleChange}
                  required
                  placeholder="Enter NID number"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Profession (Optional) */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Profession <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                placeholder="Enter profession (e.g., Teacher, Engineer)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Location Information Section */}
          <div className="pb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Location Information</h3>

            {/* Division */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Division *
              </label>
              <select
                name="division"
                value={formData.division}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
              >
                <option value="">Select Division</option>
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name} ({division.bn_name})
                  </option>
                ))}
              </select>
            </div>

            {/* District and Upazilla Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* District */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  District *
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  disabled={!formData.division || loading.districts}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loading.districts ? "Loading..." : "Select District"}
                  </option>
                  {Array.isArray(districts) &&
                    districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Upazilla */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Upazilla *
                </label>
                <select
                  name="upazilla"
                  value={formData.upazilla}
                  onChange={handleChange}
                  required
                  disabled={!formData.district || loading.upazillas}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loading.upazillas ? "Loading..." : "Select Upazilla"}
                  </option>
                  {Array.isArray(upazillas) &&
                    upazillas.map((upazilla) => (
                      <option key={upazilla.id} value={upazilla.id}>
                        {upazilla.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Union */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Union *
                </label>
                <select
                  name="union"
                  value={formData.union || ""}
                  onChange={handleChange}
                  required
                  disabled={!formData.upazilla || loading.unions}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loading.unions ? "Loading..." : "Select Union"}
                  </option>
                  {Array.isArray(unions) &&
                    unions.map((union) => (
                      <option key={union.id} value={union.id}>
                        {union.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Ward and Voter Center Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Ward */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ward *
                </label>
                <select
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                >
                  <option value="">Select Ward</option>
                  {wardOptions.map((ward) => (
                    <option key={ward.id} value={ward.name}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Voter Center */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Voter Center *
                </label>
                <select
                  name="voterCenter"
                  value={formData.voterCenter}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                >
                  <option value="">Select Voter Center</option>
                  {voterCenterOptions.map((center) => (
                    <option key={center.id} value={center.name}>
                      {center.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.name.trim() ||
                !formData.age ||
                !formData.gender ||
                !formData.nid.trim() ||
                !formData.division ||
                !formData.district ||
                !formData.upazilla ||
                !formData.union ||
                !formData.ward ||
                !formData.voterCenter
              }
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                initialData ? "Update Voter" : "Add Voter"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoterAddModal;