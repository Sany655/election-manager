"use client";
import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { getAuthToken } from "../../utils/helpers";

const AgentAddModal = ({
    isOpen,
    onClose,
    onSubmit,
    roles = [],
    title = "Agent",
}) => {
    const [divisions, setDivisions] = useState([]);
    const [error, setError] = useState(null);
    const [districts, setDistricts] = useState([]);
    const [upazillas, setUpazillas] = useState([]);
    const [unions, setUnions] = useState([]);

    // Find agent role ID
    const agentRole = roles.find(r => r.name === 'agent')?.id || "";

    const [formData, setFormData] = useState({
        role: agentRole,
        employee_id: "", // Will be generated or entered? Backend generates if not provided, but form has it. Let's keep it optional or hidden if auto-generated.
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
        ward: "",
        nid: "" // Add NID for agents
    });

    // Update role if roles load later
    useEffect(() => {
        if (roles.length > 0 && !formData.role) {
            setFormData(prev => ({ ...prev, role: roles.find(r => r.name === 'agent')?.id || "" }));
        }
    }, [roles]);


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
            // Optional: Default to a specific division if needed
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

        // Map fields to match what backend expects (createAgent controller uses: full_name, phone, nid, photo_url, home_geo_location, email, assigned_union_id)
        // Wait, the new backend `createAgent` expects: full_name, phone, nid, photo_url, home_geo_location, email, assigned_union_id
        // But this component logic comes from EmployeeAddModal which sends to `POST /api/users`.
        // The AgentSetup page calls `/frontapi/command-center/agents`.
        // I need to ensure the onSubmit passed from page.js handles the API call, and this modal just returns the data.
        // OR, I conform this modal to return a FormData that the page.js expects, OR I update page.js to handle the form data.

        // User asked to "use a copy of volunteer add modal". Volunteer add modal calls `onSubmit` with `formDataToSend`.
        // In `ViewTable`, `handleAddUser` calls `/frontapi/employee`.

        // For Agent, we should use the `createAgent` endpoint or `POST /frontapi/command-center/agents`.
        // So the `onSubmit` prop passed to this modal should handle the API call.
        // I will simply prepare the FormData here.

        // Append all form fields
        Object.entries(formData).forEach(([key, value]) => {
            // mapping: name -> full_name, msisdn -> phone
            if (key === 'name') formDataToSend.append('full_name', value);
            else if (key === 'msisdn') formDataToSend.append('phone', value);
            else if (key !== "avatarPreview" && value !== null && value !== "") {
                if (typeof value === "boolean") {
                    // agent status logic might differ, keeping as is for now
                    formDataToSend.append(key, value ? "1" : "0");
                } else {
                    formDataToSend.append(key, value);
                }
            }
            // If standard keys like name/msisdn are also needed directly (depends on backend)
            // The new `createAgent` reads: `full_name`, `phone`, `nid`, `email`.
            // So I appended mappings above.
        });

        // Also append the original keys just in case
        formDataToSend.append('name', formData.name);
        formDataToSend.append('msisdn', formData.msisdn);
        // ensure NID is sent (it's in formData)

        const result = await onSubmit(formDataToSend);
        if (result && !result.success) {
            setError(result.msg || result.message);
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

                    {/* We don't need Role Selection if it's fixed for Agent */}
                    <input type="hidden" name="role" value={formData.role} />

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
                            <label className="block text-sm font-medium text-gray-700">NID (Optional)</label>
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
                                required
                            />
                        </div>
                        {/* <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full mt-1 p-2 border rounded-lg"
                placeholder="Enter Password"
              />
            </div> */}
                    </div>

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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

                    {/* Form Error */}
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
                            {title === 'Agent' ? 'Create Agent' : `Add ${title}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AgentAddModal;
