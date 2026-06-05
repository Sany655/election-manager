"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaPlusCircle,
  FaBoxOpen,
} from "react-icons/fa";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useConfirmDelete from "@/app/hooks/useConfirmDelete";

import ResourceAddModal from "./ResourceAddModal";
import ResourceEditModal from "./ResourceEditModal";

const ViewTable = ({ data, title }) => {
  const router = useRouter();
  const { confirmDelete } = useConfirmDelete();

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({ type: null, resource: null });

  /* -----------------------------
     Search
  ------------------------------ */
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
    } else {
      setFilteredData(
        data.filter(
          (r) =>
            r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.category?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, data]);

  const handleModal = (type, resource = null) => {
    setModal({ type, resource });
  };

  /* -----------------------------
     Create Resource
  ------------------------------ */
  const handleAdd = async (formData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success(result.msg || "Resource created successfully");
        router.refresh();
      } else {
        toast.error(result.msg || "Failed to create resource");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
      handleModal(null);
    }
  };

  /* -----------------------------
     Update Resource
  ------------------------------ */
  const handleEdit = async (formData) => {
    const id = formData.id;
    if (!id) return toast.error("Resource ID missing");

    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/resources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success(result.msg || "Resource updated successfully");
        router.refresh();
      } else {
        toast.error(result.msg || "Failed to update resource");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
      handleModal(null);
    }
  };

  /* -----------------------------
     Delete (Disable) Resource
  ------------------------------ */
  const deleteResource = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/resources/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (res.ok) {
        toast.success(result.msg || "Resource disabled");
        router.refresh();
      } else {
        toast.error(result.msg || "Failed to disable resource");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (resource) => {
    confirmDelete({
      itemName: resource.name,
      onDelete: () => deleteResource(resource.id),
    });
  };

  /* -----------------------------
     Status Badge
  ------------------------------ */
  const getStatusBadge = (isActive) =>
    isActive ? (
      <span className="inline-flex items-center gap-1 text-green-600">
        <FiCheckCircle /> Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-red-500">
        <FiXCircle /> Inactive
      </span>
    );

  return (
    <div className="border border-stroke bg-white px-6 pt-6 pb-4 rounded-lg shadow-md dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-sm text-indigo-600">Total {title}</p>
          <p className="text-2xl font-bold text-indigo-700">
            {data.length}
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search resource..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button onClick={() => handleModal("add")} disabled={isLoading}>
            <FaPlusCircle className="mr-2" /> Add {title}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Resource</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Rate / Day</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">
                  <FaBoxOpen className="mx-auto mb-2 text-3xl text-gray-300" />
                  No {title} found
                </td>
              </tr>
            ) : (
              filteredData.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{r.name}</td>
                  <td className="px-6 py-4">{r.category || "-"}</td>
                  <td className="px-6 py-4">৳{r.rate_per_day}</td>
                  <td className="px-6 py-4">{getStatusBadge(r.is_active)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleModal("edit", r)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                        disabled={isLoading}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(r)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        disabled={isLoading}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {modal.type === "add" && (
        <ResourceAddModal
          isOpen
          onSubmit={handleAdd}
          onClose={() => handleModal(null)}
        />
      )}

      {modal.type === "edit" && modal.resource && (
        <ResourceEditModal
          isOpen
          resource={modal.resource}
          onSubmit={handleEdit}
          onClose={() => handleModal(null)}
        />
      )}
    </div>
  );
};

export default ViewTable;