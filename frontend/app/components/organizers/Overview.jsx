"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaBuilding,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaChartBar,
  FaPlus,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";
import OrganizerAddModal from "./OrganizerAddModal";
import OrganizerEditModal from "./OrganizerEditModal";
import useConfirmDelete from "@/app/hooks/useConfirmDelete";

const OrganizerOverview = ({ organizers: all = [] }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({ type: null, organizer: null });
  const { confirmDelete } = useConfirmDelete();

  /* ==============================
      STATS
  ============================== */
  const stats = [
    {
      title: "Total Organizers",
      value: all.length,
      icon: FaBuilding,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      title: "Active Organizers",
      value: all.filter((o) => o.status === true).length,
      icon: FaCheckCircle,
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      title: "Inactive Organizers",
      value: all.filter((o) => o.status === false).length,
      icon: FaTimesCircle,
      bg: "bg-red-50",
      text: "text-red-600",
    },
    {
      title: "Total Events",
      value: all.reduce((sum, o) => sum + (o.event_count || 0), 0),
      icon: FaUsers,
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
  ];

  /* ==============================
      CHART DATA (Events per organizer)
  ============================== */
  const chartData =
    all.length > 0
      ? all.map((o) => ({
          name: o.name,
          events: o.event_count || 0,
        }))
      : [
          { name: "Main Office", events: 12 },
          { name: "Community Branch", events: 7 },
          { name: "Partner Org", events: 4 },
        ];

  /* ==============================
      FILTERING
  ============================== */
  const filteredOrganizers = all.filter((o) => {
    const matchesSearch =
      o.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && o.status === true) ||
      (statusFilter === "inactive" && o.status === false);

    return matchesSearch && matchesStatus;
  });

  const handleModal = (type, organizer = null) => {
    setModal({ type, organizer });
  };

  /* ==============================
      CREATE
  ============================== */
  const handleAddOrganizer = async (jsonData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/organizers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      });

      const resData = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success(resData.message || "Organizer added successfully");
        router.refresh();
      } else {
        toast.error(resData.message || "Failed to add Organizer");
      }
    } catch (err) {
      console.error("Add organizer error:", err);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
      handleModal(null);
    }
  };

  /* ==============================
      UPDATE
  ============================== */
  const handleEditOrganizer = async (jsonData) => {
    const id = jsonData.id || jsonData._id;
    if (!id) return toast.error("Organizer ID missing");

    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/organizers?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      });

      const resData = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success(resData.message || "Organizer updated successfully");
        router.refresh();
      } else {
        toast.error(resData.message || "Failed to update Organizer");
      }
    } catch (err) {
      console.error("Edit organizer error:", err);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
      handleModal(null);
    }
  };

  /* ==============================
      DELETE
  ============================== */
  const handleDelete = (organizer) => {
    confirmDelete({
      itemName: organizer.name,
      onDelete: async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/frontapi/organizers?id=${organizer.id}`, {
            method: "DELETE",
          });

          const resData = await res.json().catch(() => ({}));

          if (res.ok) {
            toast.success(resData.message || "Organizer deleted");
            router.refresh();
          } else {
            toast.error(resData.message || "Failed to delete Organizer");
          }
        } catch (err) {
          console.error("Delete organizer error:", err);
          toast.error("Something went wrong.");
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Organizer Management
          </h1>
          <p className="text-gray-600">
            Manage event organizers and their activities
          </p>
        </div>
        <button
          onClick={() => handleModal("add")}
          disabled={isLoading}
          className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus />
          Add Organizer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white border rounded-xl p-6 shadow-sm">
              <div className={`${stat.bg} p-3 rounded-lg inline-block mb-4`}>
                <Icon className={`${stat.text} text-2xl`} />
              </div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Events by Organizer
          </h2>
          <FaChartBar className="text-gray-400" />
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="events" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:max-w-md">
              <div className="absolute">
                <FaSearch className="absolute inset-y-0 left-3 flex items-center text-gray-400" />
              <input
                type="text"
                placeholder="Search organizers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              </div>
            </div>


          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            {["all", "active", "inactive"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  statusFilter === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold">
                Phone
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredOrganizers.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{o.name}</td>
                <td className="px-6 py-4">{o.email || "-"}</td>
                <td className="px-6 py-4">{o.phone || "-"}</td>
                <td className="px-6 py-4">
                  {o.status ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-red-500">Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleModal("edit", o)}
                      disabled={isLoading}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(o)}
                      disabled={isLoading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrganizers.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No organizers found
          </div>
        )}
      </div>

      {/* Modals */}
      {modal.type === "add" && (
        <OrganizerAddModal
          isOpen
          onSubmit={handleAddOrganizer}
          onClose={() => handleModal(null)}
        />
      )}

      {modal.type === "edit" && modal.organizer && (
        <OrganizerEditModal
          isOpen
          organizer={modal.organizer}
          onSubmit={handleEditOrganizer}
          onClose={() => handleModal(null)}
        />
      )}
    </div>
  );
};

export default OrganizerOverview;