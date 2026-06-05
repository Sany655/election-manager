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
import Pagination from "../../Pagination";
import PermissionAddModal from "./PermissionsAddModal";
import PermissionEditModal from "./PermissionEditModal";
import ProtectedRoute from "../../ProtectedRoute";
import PermissionGate from "../../PermissionGate";

const ViewTable = ({ data }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(data || []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data);
    } else {
      const lower = searchTerm.toLowerCase();
      const result = data.filter((location) =>
        location.name?.toLowerCase().includes(lower)
      );
      setFilteredData(result);
    }
  }, [searchTerm, data]);

  const [modal, setModal] = useState({ type: null, location: null });
  const { confirmDelete } = useConfirmDelete();

  const handleModal = (type, location = null) => {
    setModal({ type, location });
  };

  const handleAddLocation = async (jsonData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/employee/permission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.dismiss();
        toast.success(data.message || "Permission added successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to add Permission");
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
      toast.error("permission ID is required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/employee/permission?id=${jsonData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.dismiss();
        toast.success(data.message || "Permission updated successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to update Permission");
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

  const deleteLocation = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/employee/permission?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        toast.dismiss();
        toast.success(data.message || "Permission deleted successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to delete permission");
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
      onDelete: () => deleteLocation(location.id),
      onSuccess: () => console.log("Permission deleted successfully!"),
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
        <PermissionGate permissions={["add-permissions"]}>
          <Button
            onClick={() => handleModal("add")}
            className="flex items-center gap-2 w-full sm:w-auto"
            disabled={isLoading}
          >
            <FaMapMarkerAlt className="w-4 h-4" />
            Add New
          </Button>
        </PermissionGate>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Total</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {filteredData?.length}
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
                {filteredData.filter(location => location.isActive !== false).length}
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
                {filteredData.filter(location => location.isActive === false).length}
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
              <th className="p-4 rounded-tl-lg">Permission</th>

              <th className="p-4 text-center rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData?.length > 0 ? (
              filteredData?.map((location, index) => (
                <tr
                  key={location.id}
                  className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    index === filteredData.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  {/* Location Code */}
                  <td className="p-4 text-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-mono">
                      {location.name || "N/A"}
                    </span>
                  </td>

                  {/* Actions */}
                  <PermissionGate permissions={["delete-permissions"]}>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDelete(location)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete Location"
                          disabled={isLoading}
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </PermissionGate>
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
                    <p>No Permission found</p>
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
      {/* <div className="mt-6">
        <Pagination data={data} />
      </div> */}

      {/* Modals */}
      {modal.type === "add" && (
        <PermissionAddModal
          isOpen
          onSubmit={handleAddLocation}
          onClose={() => handleModal(null)}
        />
      )}
      {/* {modal.type === "edit" && modal.location && (
        <PermissionEditModal
          isOpen
          location={modal.location}
          onSubmit={handleEditLocation}
          onClose={() => handleModal(null)}
        />
      )} */}
    </div>
  );
};

export default ViewTable;
