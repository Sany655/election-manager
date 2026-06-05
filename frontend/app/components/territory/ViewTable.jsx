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
import PermissionGate from "../PermissionGate";
import TerritoryAddModal from "./TerritoryAddModal";
import TerritoryEditModal from "./TerritoryEditModal";
import { FaTowerObservation } from "react-icons/fa6";

const ViewTable = ({ data, areas }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(data.data || []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data.data);
    } else {
      const lower = searchTerm.toLowerCase();
      const result = data.data.filter(
        (location) =>
          location.name?.toLowerCase().includes(lower) 
      );
      setFilteredData(result);
    }
  }, [searchTerm, data.data]);

  const [modal, setModal] = useState({ type: null, location: null });
  const { confirmDelete } = useConfirmDelete();

  const handleModal = (type, location = null) => {
    setModal({ type, location });
  };

  const handleAddLocation = async (jsonData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/territory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.dismiss();
        toast.success(data.message || "Territory added successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to add territory");
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

  const handleEditLocation = async (jsonData) => {
    if (!jsonData.id) {
      toast.error("Territory ID is required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/territory?id=${jsonData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.dismiss();
        toast.success(data.message || "Territory updated successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to update territory");
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

  const deleteTerritory = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/territory?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        toast.dismiss();
        toast.success(data.message || "Territory deleted successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to delete territory");
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
      onDelete: () => deleteTerritory(location.id),
      onSuccess: () => console.log("Territory deleted successfully!"),
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
        <PermissionGate permissions={["add-territories"]}>
          <Button
            onClick={() => handleModal("add")}
            className="flex items-center gap-2 w-full sm:w-auto"
            disabled={isLoading}
          >
            <FaTowerObservation className="w-4 h-4" />
            Add New territory
          </Button>
        </PermissionGate>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Total territorys
              </p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {filteredData.length}
              </p>
            </div>
            <FaTowerObservation className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-left text-sm font-semibold">
              <th className="p-4 rounded-tl-lg">Area </th>
              <th className="p-4 rounded-tl-lg">Territory </th>
              <th className="p-4 text-center rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((location, index) => (
                <tr
                  key={location.id}
                  className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    index === filteredData.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  {/* Location Details */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          location.isActive !== false
                            ? "bg-green-100 dark:bg-green-900/20"
                            : "bg-red-100 dark:bg-red-900/20"
                        }`}
                      >
                        <FaMapMarkerAlt
                          className={`w-6 h-6 ${
                            location.isActive !== false
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {location.area['area_name'] || "Unnamed Area"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          location.isActive !== false
                            ? "bg-green-100 dark:bg-green-900/20"
                            : "bg-red-100 dark:bg-red-900/20"
                        }`}
                      >
                        <FaTowerObservation
                          className={`w-6 h-6 ${
                            location.isActive !== false
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {location.name || "Unnamed territory"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {location.description || "No description"}
                        </p>
                      </div>
                    </div>
                  </td>


                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGate permissions={["edit-territories"]}>
                        <button
                          onClick={() => handleModal("edit", location)}
                          className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                          title="Edit Location"
                          disabled={isLoading}
                        >
                          <FaEdit size={16} />
                        </button>
                      </PermissionGate>
                      <PermissionGate permissions={["delete-territories"]}>
                        <button
                          onClick={() => handleDelete(location)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete Location"
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
                    <FaTowerObservation className="w-12 h-12 text-gray-300" />
                    <p>No territorys found</p>
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
        <TerritoryAddModal
          isOpen
          onSubmit={handleAddLocation}
          onClose={() => handleModal(null)}
          areas={areas}
        />
      )}
      {modal.type === "edit" && modal.location && (
        <TerritoryEditModal
          isOpen
          territory={modal.location}
          onSubmit={handleEditLocation}
          onClose={() => handleModal(null)}
          areas={areas}
        />
      )}
    </div>
  );
};

export default ViewTable;
