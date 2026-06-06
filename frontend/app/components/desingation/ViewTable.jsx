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
  FaPlusCircle,
} from "react-icons/fa";
import { AiOutlineAntDesign } from "react-icons/ai";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useConfirmDelete from "@/app/hooks/useConfirmDelete";
import Pagination from "../Pagination";
import DesignationEditModal from "./DesignationEditModal";
import DesignationAddModal from "./DesignationAddModal";
import DesignationSetModal from "./DesignationSetModal";
import PermissionGate from "../PermissionGate";

const ViewTable = ({ data = [], users = [] }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(data || []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data);
    } else {
      const lower = searchTerm.toLowerCase();
      const result = data.filter(
        (d) =>
          d.name?.toLowerCase().includes(lower) ||
          d.description?.toLowerCase().includes(lower)
      );
      setFilteredData(result);
    }
  }, [searchTerm, data]);

  const [modal, setModal] = useState({ type: null, designation: null });
  const { confirmDelete } = useConfirmDelete();

  const handleModal = (type, designation = null) => {
    setModal({ type, designation });
  };

  const handleAddDesignation = async (jsonData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/designation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.dismiss();
        toast.success(data.message || "Designation added successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to add designation");
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

  const handleEditDesingation = async (jsonData) => {
    if (!jsonData.id) {
      toast.error("Designation ID is required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/designation?id=${jsonData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.dismiss();
        toast.success(data.message || "Designation updated successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to update designation");
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

  const deleteDesingation = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/designation?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        // toast.dismiss();
        // toast.success(data.message || "Designation deleted successfully");
        router.refresh();
      } else {
        // toast.dismiss();
        // toast.error(data.message || "Failed to delete designation");
        throw new Error(data.message || "Failed to delete designation");
      }
    } catch (err) {
      console.error("Delete error:", err);
      // toast.dismiss();
      // toast.error("Something went wrong");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (designation) => {
    confirmDelete({
      itemName: designation.name,
      onDelete: () => deleteDesingation(designation.id),
      onSuccess: () => console.log("Designation deleted successfully!"),
    });
  };

  const handleSetDesignation = async (formData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/designation/set`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg || "Designation set successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.msg || "Failed to set Designation");
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
        <div className="flex items-center justify-end gap-2">
          <PermissionGate permissions={["add-designations"]}>
            <Button
              onClick={() => handleModal("set")}
              className="flex items-center gap-2 w-full sm:w-auto"
              disabled={isLoading}
            >
              <FaPlusCircle className="w-4 h-4" />
              Assign Designation
            </Button>
          </PermissionGate>
          <PermissionGate permissions={["add-designations"]}>
            <Button
              onClick={() => handleModal("add")}
              className="flex items-center gap-2 w-full sm:w-auto"
              disabled={isLoading}
            >
              <AiOutlineAntDesign className="w-4 h-4" />
              Add New Designation
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Total designations
              </p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {filteredData.length}
              </p>
            </div>
            <AiOutlineAntDesign className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        {/* <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Active</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {filteredData.filter(designation => designation.isActive !== false).length}
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
                {filteredData.filter(designation => designation.isActive === false).length}
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
              <th className="p-4 rounded-tl-lg">Designations Name</th>
              <th className="p-4 text-center rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((designation, index) => (
                <tr
                  key={designation.id}
                  className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${index === filteredData.length - 1 ? "border-b-0" : ""
                    }`}
                >
                  {/* designation Details */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${designation.isActive !== false
                            ? "bg-green-100 dark:bg-green-900/20"
                            : "bg-red-100 dark:bg-red-900/20"
                          }`}
                      >
                        <AiOutlineAntDesign
                          className={`w-6 h-6 ${designation.isActive !== false
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                            }`}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {designation.name || "Unnamed designation"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {designation.description || "No description"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* <button
                        onClick={() => router.push(`/designation/view/${designation.id}`)}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FaEye size={16} />
                      </button> */}
                      <PermissionGate permissions={["edit-designations"]}>
                        <button
                          onClick={() => handleModal("edit", designation)}
                          className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                          title="Edit designation"
                          disabled={isLoading}
                        >
                          <FaEdit size={16} />
                        </button>
                      </PermissionGate>
                      <PermissionGate permissions={["delete-designations"]}>
                        <button
                          onClick={() => handleDelete(designation)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete designation"
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
                    <AiOutlineAntDesign className="w-12 h-12 text-gray-300" />
                    <p>No designations found</p>
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
      {modal.type === "set" && (
        <DesignationSetModal
          isOpen
          onSubmit={handleSetDesignation}
          onClose={() => handleModal(null)}
          users={users}
          designations={data}
        />
      )}
      {modal.type === "add" && (
        <DesignationAddModal
          isOpen
          onSubmit={handleAddDesignation}
          onClose={() => handleModal(null)}
        />
      )}
      {modal.type === "edit" && modal.designation && (
        <DesignationEditModal
          isOpen
          designation={modal.designation}
          onSubmit={handleEditDesingation}
          onClose={() => handleModal(null)}
        />
      )}
    </div>
  );
};

export default ViewTable;
