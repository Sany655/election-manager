"use client";
import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { getAuthToken } from "../../utils/helpers";

const AgentEditModal = ({
    isOpen,
    onClose,
    onSubmit,
    user,
    title = "Agent"
}) => {
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        email: "",
        msisdn: "",
        password: "", // Optional update
        nid: "",
        division_id: "",
        district_id: "",
        upazilla_id: "",
        union_id: "",
        ward: "",
        status: true,
    });

    const [divisions, setDivisions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [upazillas, setUpazillas] = useState([]);
    const [unions, setUnions] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                id: user.id,
                name: user.name || "",
                email: user.email || "",
                msisdn: user.msisdn || "",
                nid: user.personalDetails?.identification_no || "",
                division_id: user.division_id || "",
                district_id: user.district_id || "",
                upazilla_id: user.upazilla_id || "",
                union_id: user.union_id || "",
                ward: user.ward || "",
                status: user.isActive,
                password: "" // Reset password field
            }));
        }
    }, [user]);

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
            });
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
            });
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
        const { name, value, type, checked } = e.target;
        setFormData((prev) => {
            const newData = {
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            };

            if (name === "division_id") {
                newData.district_id = "";
                newData.upazilla_id = "";
                newData.union_id = "";
            } else if (name === "district_id") {
                newData.upazilla_id = "";
                newData.union_id = "";
            } else if (name === "upazilla_id") {
                newData.union_id = "";
            }

            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const formDataToSend = new FormData();

        // Append fields
        Object.entries(formData).forEach(([key, value]) => {
            // mapping if needed (name -> full_name not needed if backend supports name, but let's send both or consistent)
            // Standardize to `name` since User model uses name.

            if (value !== null && value !== "") {
                if (typeof value === "boolean") {
                    formDataToSend.append(key, value ? "1" : "0");
                } else {
                    formDataToSend.append(key, value);
                }
            }
        });

        // Explicit mappings for controller compatibility if needed
        // createAgent/updateAgent might look for `full_name`, `phone`
        formDataToSend.append('full_name', formData.name);
        formDataToSend.append('phone', formData.msisdn);

        const result = await onSubmit(formDataToSend);
        if (result && !result.success) {
            setError(result.msg || result.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Edit {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Text Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full mt-1 p-2 border rounded-lg"
                                placeholder="Enter Full Name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="text"
                                name="msisdn"
                                value={formData.msisdn}
                                onChange={handleChange}
                                required
                                className="w-full mt-1 p-2 border rounded-lg"
                                placeholder="Enter Phone Number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">NID</label>
                            <input
                                type="text"
                                name="nid"
                                value={formData.nid}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 border rounded-lg"
                                placeholder="Enter NID"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 border rounded-lg"
                                placeholder="Enter Email"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Passsword (Leave blank to keep current)</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 border rounded-lg"
                                placeholder="New Password"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Division</label>
                            <select
                                name="division_id"
                                value={formData.division_id}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 border rounded-lg"
                            >
                                <option value="">Select Division</option>
                                {divisions.map((item) => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">District</label>
                            <select
                                name="district_id"
                                value={formData.district_id}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 border rounded-lg"
                            >
                                <option value="">Select District</option>
                                {districts.map((item) => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Upazilla</label>
                            <select
                                name="upazilla_id"
                                value={formData.upazilla_id}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 border rounded-lg"
                            >
                                <option value="">Select Upazilla</option>
                                {upazillas?.map((item) => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Union</label>
                            <select
                                name="union_id"
                                value={formData.union_id}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 border rounded-lg"
                            >
                                <option value="">Select Union</option>
                                {unions.map((item) => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ward</label>
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

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="status"
                            name="status"
                            checked={formData.status}
                            onChange={handleChange}
                            className="h-4 w-4"
                        />
                        <label htmlFor="status" className="text-sm font-medium text-gray-700">Active Status</label>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                            {error}
                        </div>
                    )}

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
                            Update {title}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AgentEditModal;
