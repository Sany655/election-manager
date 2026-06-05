"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  FaEdit,
  FaEye,
  FaTrash,
  FaMapMarkerAlt,
  FaSearch,
  FaBuilding,
} from "react-icons/fa";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useConfirmDelete from "@/app/hooks/useConfirmDelete";
import Pagination from "../Pagination";
import AreaAddModal from "./AreaAddModal";
import AreaEditModal from "./AreaEditModal";
import PermissionGate from "../PermissionGate";
import { useAuthContext } from "@/app/context/auth_context";

const ViewTable = ({ data, token, locations = [] }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(data.data || []);
  const [isLoading, setIsLoading] = useState(false);
  const {user} = useAuthContext();

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data.data);
    } else {
      const lower = searchTerm.toLowerCase();
      const result = data.data.filter(
        (area) =>
          area.area_name?.toLowerCase().includes(lower) ||
          area.area_code?.toLowerCase().includes(lower) ||
          area.address?.toLowerCase().includes(lower) ||
          area.description?.toLowerCase().includes(lower)
      );
      setFilteredData(result);
    }
  }, [searchTerm, data.data]);

  const [modal, setModal] = useState({ type: null, area: null });
  const { confirmDelete } = useConfirmDelete();

  const handleModal = (type, area = null) => {
    setModal({ type, area });
  };

  const handleAddarea = async (jsonData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/area`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.dismiss();
        toast.success(data.message || "Area added successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to add area");
      }
    } catch (err) {
      console.error("Client error:", err);
      toast.dismiss();
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
      handleModal(null);
    }
  };

  const handleEditarea = async (jsonData) => {
    if (!jsonData.id) {
      toast.error("area ID is required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/area?id=${jsonData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.dismiss();
        toast.success(data.message || "area updated successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to update area");
      }
    } catch (err) {
      console.error("Edit error:", err);
      toast.dismiss();
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
      handleModal(null);
    }
  };

  const deletearea = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/area?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        toast.dismiss();
        toast.success(data.message || "area deleted successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to delete area");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.dismiss();
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (area) => {
    confirmDelete({
      itemName: area.area_name,
      onDelete: () => deletearea(area.id),
      onSuccess: () => console.log("area deleted successfully!"),
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
              placeholder="Search by name, code, or address"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-80"
            />
          </div>
        </div>
        <PermissionGate permissions={["add-areas"]}>
          <Button
            onClick={() => handleModal("add")}
            className="flex items-center gap-2 w-full sm:w-auto"
            disabled={isLoading}
          >
            <FaMapMarkerAlt className="w-4 h-4" />
            Add New Area
          </Button>
        </PermissionGate>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Total Areas
              </p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {filteredData.length}
              </p>
            </div>
            <FaBuilding className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        {/* <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Active</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {filteredData.filter(area => area.isActive !== false).length}
              </p>
            </div>
            <FiCheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 dark:text-red-400">Inactive</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {filteredData.filter(area => area.isActive === false).length}
              </p>
            </div>
            <FiXCircle className="w-8 h-8 text-red-500" />
          </div>
        </div> */}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-left text-sm font-semibold">
              <th className="p-4 rounded-tl-lg">Region</th>
              <th className="p-4 rounded-tl-lg">Area Details</th>
              <th className="p-4 text-center rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((area, index) => (
                <tr
                  key={area.id}
                  className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    index === filteredData.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  {/* area Details */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          area.isActive !== false
                            ? "bg-green-100 dark:bg-green-900/20"
                            : "bg-red-100 dark:bg-red-900/20"
                        }`}
                      >
                        <FaMapMarkerAlt
                          className={`w-6 h-6 ${
                            area.isActive !== false
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {area.location?.location_name|| "Unnamed region"}
                        </p>
                       
                      </div>
                    </div>
                  </td>

                  {/* area Details */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          area.isActive !== false
                            ? "bg-green-100 dark:bg-green-900/20"
                            : "bg-red-100 dark:bg-red-900/20"
                        }`}
                      >
                        <FaMapMarkerAlt
                          className={`w-6 h-6 ${
                            area.isActive !== false
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {area.area_name || "Unnamed area"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {area.description || "No description"}
                        </p>
                      </div>
                    </div>
                  </td>




                  {/* Status */}
                  {/* <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      area.isActive !== false
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    }`}>
                      {area.isActive !== false ? (
                        <>
                          <FiCheckCircle className="w-3 h-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <FiXCircle className="w-3 h-3" />
                          Inactive
                        </>
                      )}
                    </span>
                  </td> */}

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* <button
                        onClick={() => router.push(`/area/view/${area.id}`)}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FaEye size={16} />
                      </button> */}
                      <PermissionGate permissions={["edit-areas"]}>
                        <button
                          onClick={() => handleModal("edit", area)}
                          className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                          title="Edit area"
                          disabled={isLoading}
                        >
                          <FaEdit size={16} />
                        </button>
                      </PermissionGate>
                      <PermissionGate permissions={["delete-areas"]}>
                        <button
                          onClick={() => handleDelete(area)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete area"
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
                  colSpan="5"
                  className="p-8 text-center text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <FaMapMarkerAlt className="w-12 h-12 text-gray-300" />
                    <p>No areas found</p>
                    {searchTerm && (
                      <p className="text-sm">Try adjusting your search terms</p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <Pagination data={data} />
      </div>

      {/* Modals */}
      {modal.type === "add" && (
        <AreaAddModal
          isOpen
          onSubmit={handleAddarea}
          onClose={() => handleModal(null)}
          locations={locations}
        />
      )}
      {modal.type === "edit" && modal.area && (
        <AreaEditModal
          isOpen
          area={modal.area}
          onSubmit={handleEditarea}
          onClose={() => handleModal(null)}
          locations={locations}
        />
      )}
    </div>
  );
};

export default ViewTable;
