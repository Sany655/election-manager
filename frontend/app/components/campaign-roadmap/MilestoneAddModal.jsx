"use client";
import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";

const MilestoneAddModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        typeList: [],
    });
    const [typeList, setTypeList] = useState({
        area: "",
        type: "",
        customType: "",
        count: ""
    });
    const [eventTypes, setEventTypes] = useState([]);

    useEffect(() => {
        if (isOpen) {
            const fetchTypes = async () => {
                try {
                    const res = await fetch("/frontapi/event-types");
                    const data = await res.json();
                    if (data.success) {
                        setEventTypes(data.data);
                    }
                } catch (error) {
                    console.error("Error fetching event types:", error);
                }
            };
            fetchTypes();
        }
    }, [isOpen]);

    const customTypeInputRef = React.useRef(null);

    useEffect(() => {
        if (typeList.type === "other") {
            customTypeInputRef.current?.focus();
        }
    }, [typeList.type]);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Title is required");
            return;
        }
        if (!formData.startDate) {
            toast.error("Start Date is required");
            return;
        }
        if (!formData.endDate) {
            toast.error("End Date is required");
            return;
        }
        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
            toast.error("End Date must be after Start Date");
            return;
        }
        // Create a local copy to avoid mutating state
        let finalTypeList = [...formData.typeList];

        // If list is empty, try to use the current input values
        if (finalTypeList.length === 0) {
            const typeName = typeList.type === "other" ? typeList.customType : typeList.type;

            // Validate current inputs
            if (!typeName || !typeList.count || !typeList.area) {
                toast.error("At least one campaign type is required");
                return;
            }

            // Add to the local list for this submission
            finalTypeList.push({ ...typeList, type: typeName });
        }

        const jsonData = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            startDate: formData.startDate,
            endDate: formData.endDate,
            typeList: finalTypeList
        };

        onSubmit(jsonData);
        setFormData({
            title: "",
            description: "",
            startDate: "",
            endDate: "",
            typeList: [],
        });
        setTypeList({
            area: "",
            type: "",
            customType: "",
            count: ""
        });
        onClose();
    };

    const handleAddType = () => {
        const typeName = typeList.type === "other" ? typeList.customType : typeList.type;
        if (typeName && typeList.count && typeList.area) {
            let index = -1
            formData.typeList.forEach((item, i) => {
                if (item.type === typeName && item.area === typeList.area) {
                    index = i;
                }
            });
            let updatedTypeList = [...formData.typeList];
            if (index !== -1) {
                updatedTypeList[index].count = parseInt(updatedTypeList[index].count) + parseInt(typeList.count);
            } else {
                updatedTypeList.push({ ...typeList, type: typeName });
            }
            setFormData({
                ...formData,
                typeList: updatedTypeList
            });
            setTypeList({ type: "", customType: "", count: "", area: "" });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Add New Milestone
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Milestone Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleInputChange("title", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter milestone title"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Milestone Type *
                        </label>
                        <div className="flex flex-wrap gap-2 items-end">
                            <div className="flex-1 min-w-[150px]">
                                <select
                                    value={typeList.type}
                                    onChange={(e) => setTypeList({ ...typeList, type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Event Type</option>
                                    {eventTypes.map((t) => (
                                        <option key={t.id} value={t.name}>{t.name}</option>
                                    ))}
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {typeList.type === "other" && (
                                <div className="flex-1 min-w-[150px]">
                                    <input
                                        ref={customTypeInputRef}
                                        type="text"
                                        value={typeList.customType}
                                        onChange={(e) => setTypeList({ ...typeList, customType: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter new type"
                                    />
                                </div>
                            )}

                            <div className="w-24">
                                <input
                                    type="number"
                                    value={typeList.count}
                                    onChange={(e) => setTypeList({ ...typeList, count: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Count"
                                />
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <select
                                    value={typeList.area}
                                    onChange={(e) => setTypeList({ ...typeList, area: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select area</option>
                                    <option value="pahartali">Pahartali</option>
                                    <option value="halishahar">Halishahar</option>
                                    <option value="agrabad">Agrabad</option>
                                    <option value="patenga">Patenga</option>
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddType}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <FaPlus />
                            </button>
                        </div>
                        <div className="mt-4 space-y-2">
                            {formData.typeList.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md shadow-sm">
                                    <div className="flex items-center space-x-4">
                                        <span className="font-semibold text-gray-800 capitalize">{item.type}</span>
                                        <span className="text-gray-600">x {item.count}</span>
                                        <span className="text-sm text-gray-500 bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full capitalize">{item.area}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updatedTypeList = formData.typeList.filter((_, i) => i !== index);
                                            setFormData({ ...formData, typeList: updatedTypeList });
                                        }}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <FaTimes size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter short description"
                            rows={4}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                            type="datetime-local"
                            value={formData.startDate}
                            onChange={(e) => handleInputChange("startDate", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                            type="datetime-local"
                            value={formData.endDate}
                            onChange={(e) => handleInputChange("endDate", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
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
                            Save Milestone
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MilestoneAddModal;
