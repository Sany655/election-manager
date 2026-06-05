"use client";
import React, { useState, useEffect } from "react";
import { FaTimes, FaTrash, FaUserPlus, FaUsers, FaInfoCircle } from "react-icons/fa";
import { getAuthToken } from "../../../utils/helpers";
import AssignTeamMemberModal from "./AssignTeamMemberModal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const TeamEditModal = ({ isOpen, onClose, onSubmit, title, initialData, users }) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("info");
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [members, setMembers] = useState([]);

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
        if (isOpen && initialData) {
            setFormData({
                team_name: initialData.name || initialData.team_name,
                division_id: initialData.division_id || "",
                district_id: initialData.district_id || "",
                upazilla_id: initialData.upazilla_id || "",
                union_id: initialData.union_id || "",
            });

            setMembers(initialData.members || []);

            // Pre-fetch dependent dropdowns
            fetchDivisions();
            if (initialData.division_id) fetchDistricts(initialData.division_id);
            if (initialData.district_id) fetchUpazillas(initialData.district_id);
            if (initialData.upazilla_id) fetchUnions(initialData.upazilla_id);
        }
    }, [isOpen, initialData]);

    const fetchDivisions = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/geo/divisions`, {
                headers: { Authorization: `Bearer ${getAuthToken()}` },
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
                headers: { Authorization: `Bearer ${getAuthToken()}` },
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
                headers: { Authorization: `Bearer ${getAuthToken()}` },
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
                headers: { Authorization: `Bearer ${getAuthToken()}` },
            });
            const data = await res.json();
            setUnions(data);
        } catch (error) {
            console.error("Error fetching unions:", error);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (field === "division_id") {
            setDistricts([]); setUpazillas([]); setUnions([]);
            setFormData(prev => ({ ...prev, district_id: "", upazilla_id: "", union_id: "" }));
            if (value) fetchDistricts(value);
        } else if (field === "district_id") {
            setUpazillas([]); setUnions([]);
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
                id: initialData.id,
            };
            onSubmit(jsonData);
            // We don't close here, wait for parent to handle or just close manually
            onClose();
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!confirm("Are you sure you want to remove this member?")) return;

        try {
            const res = await fetch(`/frontapi/employee/volunteer-team/remove-member`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    volunteer_team_id: initialData.id,
                    user_ids: [userId]
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Member removed");
                setMembers(prev => prev.filter(m => m.user?.id !== userId));
                router.refresh();
            } else {
                toast.error(data.message || "Failed to remove member");
            }
        } catch (err) {
            toast.error("Something went wrong");
        }
    };

    const handleAssignSubmit = async (assignmentData) => {
        // This function is passed to AssignTeamMemberModal
        // AssignTeamMemberModal does NOT call API itself, it calls onSubmit prop.
        // In ViewTable, handleSetPolicy calls the API. 
        // We need to implement the API call here.

        try {
            const res = await fetch(`/frontapi/employee/volunteer-team/set`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(assignmentData),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Member assigned successfully");
                // Refresh members list - tricky because we need to know WHICH users were added to add them to local state
                // Ideally we re-fetch the team, but we don't have that endpoint handy in frontend easily without full page reload
                // But we can guess or just reload page
                router.refresh();

                // Rudimentary local update if possible, otherwise rely on refresh
                // Since assignmentData has user_ids, and we have `users` prop, we can find them
                const newMembers = users.filter(u => assignmentData.user_ids.includes(u.id)).map(u => ({
                    id: Math.random(), // Temporary ID
                    user: u
                }));

                // Filter out duplicates if any
                setMembers(prev => {
                    const existingIds = prev.map(m => m.user?.id);
                    const uniqueNew = newMembers.filter(nm => !existingIds.includes(nm.user.id));
                    return [...prev, ...uniqueNew];
                });

            } else {
                toast.error(data.msg || "Failed to assign");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            Edit {title}
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <FaTimes size={24} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b">
                        <button
                            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === "info"
                                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                            onClick={() => setActiveTab("info")}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <FaInfoCircle /> Team Info
                            </div>
                        </button>
                        <button
                            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === "members"
                                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                            onClick={() => setActiveTab("members")}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <FaUsers /> Members ({members.length})
                            </div>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === "info" ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{title} Name *</label>
                                    <input
                                        type="text"
                                        value={formData.team_name}
                                        onChange={(e) => handleInputChange("team_name", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                            {divisions.map((div) => <option key={div.id} value={div.id}>{div.name}</option>)}
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
                                            {districts.map((dist) => <option key={dist.id} value={dist.id}>{dist.name}</option>)}
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
                                            {upazillas.map((upz) => <option key={upz.id} value={upz.id}>{upz.name}</option>)}
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
                                            {unions.map((uni) => <option key={uni.id} value={uni.id}>{uni.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                                    >
                                        Update Info
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-gray-700">Team Members</h3>
                                    <button
                                        onClick={() => setShowAssignModal(true)}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition"
                                    >
                                        <FaUserPlus /> Add Member
                                    </button>
                                </div>

                                {members.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                        No members in this team yet.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {members.map((member) => (
                                            <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-sm transition">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                                        {member.user?.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{member.user?.name || "Unknown User"}</p>
                                                        <p className="text-xs text-gray-500">{member.user?.msisdn || member.user?.email || "No contact info"}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveMember(member.user?.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                                                    title="Remove Member"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Assign Member Modal */}
            {showAssignModal && (
                <AssignTeamMemberModal
                    isOpen={showAssignModal}
                    onClose={() => setShowAssignModal(false)}
                    users={users}
                    teams={[initialData]} // Pass only current team to force selection
                    title={title}
                    onSubmit={handleAssignSubmit}
                    initialData={{ volunteer_team_id: initialData.id }}
                />
            )}
        </>
    );
};

export default TeamEditModal;
