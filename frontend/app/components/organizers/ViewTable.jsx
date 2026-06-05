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

import OrganizerAddModal from "./OrganizerAddModal";
import OrganizerEditModal from "./OrganizerEditModal";

const OrganizerViewTable = ({ data = [], title = "Organizers" }) => {
  const router = useRouter();
  const { confirmDelete } = useConfirmDelete();

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({ type: null, organizer: null });

  /* -----------------------------
     Search (name / email / phone / type)
  ------------------------------ */
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
    } else {
      const q = searchTerm.toLowerCase();
      setFilteredData(
        data.filter(
          (o) =>
            o.name?.toLowerCase().includes(q) ||
            o.email?.toLowerCase().includes(q) ||
            o.phone?.toLowerCase().includes(q) ||
            o.type?.toLowerCase().includes(q)
        )
      );
    }
  }, [searchTerm, data]);

  const handleModal = (type, organizer = null) => {
    setModal({ type, organizer });
  };

  /* -----------------------------
     Create Organizer
  ------------------------------ */
  const handleAdd = async (formData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/organizers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success(result.message || "Organizer added successfully");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to add organizer");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
      handleModal(null);
    }
  };

  /* -----------------------------
     Update Organizer
  ------------------------------ */
  const handleEdit = async (formData) => {
    if (!formData.id) return toast.error("Organizer ID missing");

    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/organizers?id=${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json().catch(() => ({}));
      console.log('response: ', res);
      
      if (res.ok) {
        toast.success(result.message || "Organizer updated successfully");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to update organizer");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
      handleModal(null);
    }
  };

  /* -----------------------------
     Delete Organizer
  ------------------------------ */
  const deleteOrganizer = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/organizers/${id}`, {
        method: "DELETE",
      });

      const result = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success(result.message || "Organizer deleted");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to delete organizer");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (organizer) => {
    confirmDelete({
      itemName: organizer.name,
      onDelete: () => deleteOrganizer(organizer.id),
    });
  };

  /* -----------------------------
     Status Badge (TINYINT → UI)
  ------------------------------ */
  const getStatusBadge = (status) =>
    status === 1 || status === true ? (
      <span className="inline-flex items-center gap-1 text-green-600">
        <FiCheckCircle /> Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-red-500">
        <FiXCircle /> Inactive
      </span>
    );

  return (
    <div className="border bg-white px-6 pt-6 pb-4 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Total {title}</p>
          <p className="text-2xl font-bold text-blue-700">{data.length}</p>
        </div>

        <div className="flex gap-3 items-center">
          <div className="relative w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search organizers..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button onClick={() => handleModal("add")} disabled={isLoading}>
            <FaPlusCircle className="mr-2" /> Add Organizer
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Name</th>
              <th className="px-6 py-3 text-left font-semibold">Type</th>
              <th className="px-6 py-3 text-left font-semibold">
                Contact Person
              </th>
              <th className="px-6 py-3 text-left font-semibold">Email</th>
              <th className="px-6 py-3 text-left font-semibold">Phone</th>
              <th className="px-6 py-3 text-center font-semibold">Status</th>
              <th className="px-6 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500">
                  <FaBoxOpen className="mx-auto mb-2 text-3xl text-gray-300" />
                  No organizers found
                </td>
              </tr>
            ) : (
              filteredData.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{o.name}</td>
                  <td className="px-6 py-4">{o.type || "-"}</td>
                  <td className="px-6 py-4">{o.contact_person || "-"}</td>
                  <td className="px-6 py-4">{o.email || "-"}</td>
                  <td className="px-6 py-4">{o.phone || "-"}</td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(o.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => handleModal("edit", o)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                        disabled={isLoading}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(o)}
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
        <OrganizerAddModal
          isOpen
          onSubmit={handleAdd}
          onClose={() => handleModal(null)}
        />
      )}

      {modal.type === "edit" && modal.organizer && (
        <OrganizerEditModal
          isOpen
          organizer={modal.organizer}
          onSubmit={handleEdit}
          onClose={() => handleModal(null)}
        />
      )}
    </div>
  );
};

export default OrganizerViewTable;