"use client";
import React, { useState, useEffect } from "react";
import { FaTimes, FaBuilding } from "react-icons/fa";
import {
    divisions,
    fetchDistricts as fetchDistrictsApi,
    fetchUpazillas as fetchUpazillasApi,
    fetchUnions as fetchUnionsApi
} from "@/app/utils/locationApi";

const CenterAddModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: "",
        centerNumber: "",
        availableFemaleVoters: "",
        availableMaleVoters: "",
        division: "",
        district: "",
        upazilla: "",
        union: "",
    });

    const [districts, setDistricts] = useState([]);
    const [upazillas, setUpazillas] = useState([]);
    const [unions, setUnions] = useState([]);
    const [loading, setLoading] = useState({
        districts: false,
        upazillas: false,
        unions: false,
    });

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
        if (isOpen) {
            // Reset form when modal opens
            setFormData({
                name: "",
                centerNumber: "",
                availableFemaleVoters: "",
                availableMaleVoters: "",
                division: "",
                district: "",
                upazilla: "",
                union: "",
            });
            setDistricts([]);
            setUpazillas([]);
            setUnions([]);
        }
    }, [isOpen]);

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

    const handleSubmit = (e) => {
        e.preventDefault();

        const centerData = {
            name: formData.name.trim(),
            centerNumber: formData.centerNumber.trim(),
            availableFemaleVoters: parseInt(formData.availableFemaleVoters) || 0,
            availableMaleVoters: parseInt(formData.availableMaleVoters) || 0,
            totalVoters: (parseInt(formData.availableFemaleVoters) || 0) + (parseInt(formData.availableMaleVoters) || 0),
            division_id: formData.division,
            district_id: formData.district,
            upazilla_id: formData.upazilla,
            union_id: formData.union,
        };

        onSubmit(centerData);
    };

    const handleClose = () => {
        // Resetting is handled by useEffect when isOpen changes
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <FaBuilding className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Add New Center</h2>
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
                    {/* Center Information Section */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Center Information</h3>

                        {/* Center Name */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Center Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Enter center name (e.g., Central Community Hall)"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>

                        {/* Center Number */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Center Number *
                            </label>
                            <input
                                type="text"
                                name="centerNumber"
                                value={formData.centerNumber}
                                onChange={handleChange}
                                required
                                placeholder="Enter center number (e.g., 001, 002)"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Voter Statistics Section */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Voter Statistics</h3>

                        {/* Female and Male Voters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Available Female Voters */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Available Female Voters *
                                </label>
                                <input
                                    type="number"
                                    name="availableFemaleVoters"
                                    value={formData.availableFemaleVoters}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter number"
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>

                            {/* Available Male Voters */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Available Male Voters *
                                </label>
                                <input
                                    type="number"
                                    name="availableMaleVoters"
                                    value={formData.availableMaleVoters}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter number"
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Total Voters Display */}
                        {(formData.availableFemaleVoters || formData.availableMaleVoters) && (
                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Total Voters:
                                    </span>
                                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                        {(parseInt(formData.availableFemaleVoters) || 0) + (parseInt(formData.availableMaleVoters) || 0)}
                                    </span>
                                </div>
                            </div>
                        )}
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
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 cursor-pointer"
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
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Union *
                            </label>
                            <select
                                name="union"
                                value={formData.union}
                                onChange={handleChange}
                                required
                                disabled={!formData.upazilla || loading.unions}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                                !formData.name.trim() ||
                                !formData.centerNumber.trim() ||
                                !formData.availableFemaleVoters ||
                                !formData.availableMaleVoters ||
                                !formData.division ||
                                !formData.district ||
                                !formData.upazilla ||
                                !formData.union
                            }
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                        >
                            Add Center
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CenterAddModal;
