"use strict";
"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
    FaEdit,
    FaTrash,
    FaMapMarkerAlt,
    FaSearch,
} from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useConfirmDelete from "@/app/hooks/useConfirmDelete";
import Pagination from "../Pagination";
import PermissionGate from "../PermissionGate";
import LocationEditModal from "./LocationEditModal";
import LocationAddModal from "./LocationAddModal";

const ViewTable = ({ data, token, title, apiPath, permissionPrefix, columns = [] }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [searchTerm, setSearchTerm] = useState("");
    const [filteredData, setFilteredData] = useState(data.data || []);
    const [isLoading, setIsLoading] = useState(false);

    const handlePageChange = (page) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page);
        router.push(`${pathname}?${params.toString()}`);
    };

    useEffect(() => {
        if (!searchTerm) {
            setFilteredData(data.data);
        } else {
            const lower = searchTerm.toLowerCase();
            const result = data.data.filter(
                (location) =>
                    location.name?.toLowerCase().includes(lower) ||
                    location.bn_name?.toLowerCase().includes(lower)
            );
            setFilteredData(result);
        }
    }, [searchTerm, data.data]);

    const [modal, setModal] = useState({ type: null, location: null });
    const { confirmDelete } = useConfirmDelete();

    const handleModal = (type, location = null) => {
        setModal({ type, location });
    };

    const handleAdd = async (jsonData) => {
        setIsLoading(true);
        try {
            const res = await fetch(apiPath, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(jsonData),
            });

            const data = await res.json();

            if (res.ok) {
                toast.dismiss();
                toast.success(data.message || `${title} added successfully`);
                router.refresh();
                handleModal(null);
            } else {
                toast.dismiss();
                toast.error(data.message || data.error || "Failed to add");
            }
        } catch (err) {
            console.error("Client error:", err);
            toast.dismiss();
            toast.error("Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = async (jsonData) => {
        if (!jsonData.id) {
            toast.error(`${title} ID is required`);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${apiPath}/${jsonData.id}`, { // Using generic API path
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(jsonData),
            });

            const data = await res.json();
            if (res.ok) {
                toast.dismiss();
                toast.success(data.message || `${title} updated successfully`);
                router.refresh();
                handleModal(null);
            } else {
                toast.dismiss();
                toast.error(data.message || data.error || "Failed to update");
            }
        } catch (err) {
            console.error("Edit error:", err);
            toast.dismiss();
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const deleteItem = async (id) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${apiPath}/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (res.ok) {
                toast.dismiss();
                toast.success(data.message || `${title} deleted successfully`);
                router.refresh();
            } else {
                toast.dismiss();
                toast.error(data.message || data.error || "Failed to delete");
            }
        } catch (err) {
            console.error("Delete error:", err);
            toast.dismiss();
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (location) => {
        confirmDelete({
            itemName: location.name,
            onDelete: () => deleteItem(location.id),
            onSuccess: () => console.log(`${title} deleted successfully!`),
        });
    };

    return (
        <div className="border border-stroke bg-white px-6 pt-6 pb-4 rounded-lg shadow-md dark:border-strokedark dark:bg-boxdark">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Search by name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full sm:w-80"
                        />
                    </div>
                </div>
                <PermissionGate permissions={[`manage-${permissionPrefix}s`]}>
                    <Button
                        onClick={() => handleModal("add")}
                        className="flex items-center gap-2 w-full sm:w-auto"
                        disabled={isLoading}
                    >
                        <FaMapMarkerAlt className="w-4 h-4" />
                        Add New {title}
                    </Button>
                </PermissionGate>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                                Total {title}
                            </p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                {filteredData?.length || 0}
                            </p>
                        </div>
                        <FaMapMarkerAlt className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800 text-left text-sm font-semibold">
                            <th className="p-4 rounded-tl-lg">{title} Name</th>
                            <th className="p-4">Bangla Name</th>
                            {columns.map((col, idx) => (
                                <th key={idx} className="p-4">{col.header}</th>
                            ))}
                            <th className="p-4 text-center rounded-tr-lg">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData?.length > 0 ? (
                            filteredData.map((location, index) => (
                                <tr
                                    key={location.id}
                                    className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${index === filteredData.length - 1 ? "border-b-0" : ""
                                        }`}
                                >
                                    <td className="p-4">
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                                            {location.name || `Unnamed ${title}`}
                                        </p>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-gray-900 dark:text-gray-100">
                                            {location.bn_name || "-"}
                                        </p>
                                    </td>
                                    {columns.map((col, idx) => (
                                        <td key={idx} className="p-4">
                                            {/* Handle nested properties essentially */}
                                            {location[col.accessor] || "-"}
                                        </td>
                                    ))}

                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <PermissionGate permissions={[`manage-${permissionPrefix}s`]}>
                                                <button
                                                    onClick={() => handleModal("edit", location)}
                                                    className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                                                    title="Edit"
                                                    disabled={isLoading}
                                                >
                                                    <FaEdit size={16} />
                                                </button>
                                            </PermissionGate>
                                            <PermissionGate permissions={[`manage-${permissionPrefix}s`]}>
                                                <button
                                                    onClick={() => handleDelete(location)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete"
                                                    disabled={isLoading}
                                                >
                                                    <FaTrash size={16} />
                                                </button>
                                            </PermissionGate>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={3 + columns.length}
                                    className="p-8 text-center text-gray-500 dark:text-gray-400"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <FaMapMarkerAlt className="w-12 h-12 text-gray-300" />
                                        <p>No {title} found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-6">
                <Pagination data={data} setPage={handlePageChange} />
            </div>

            {modal.type === "add" && (
                <LocationAddModal
                    isOpen
                    onSubmit={handleAdd}
                    onClose={() => handleModal(null)}
                    title={title}
                    apiPath={apiPath}
                    token={token}
                />
            )}
            {modal.type === "edit" && modal.location && (
                <LocationEditModal
                    isOpen
                    data={modal.location}
                    onSubmit={handleEdit}
                    onClose={() => handleModal(null)}
                    title={title}
                    apiPath={apiPath}
                    token={token}
                />
            )}
        </div>
    );
};

export default ViewTable;
