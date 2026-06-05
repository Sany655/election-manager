'use client';

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import {
  FaBoxOpen,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaChartBar,
  FaPlus,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';
import ResourceAddModal from "./ResourceAddModal";
import ResourceEditModal from "./ResourceEditModal";
import useConfirmDelete from "@/app/hooks/useConfirmDelete";

const Overview = ({ resources: all = [] }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({ type: null, resource: null });
  const { confirmDelete } = useConfirmDelete();

  /* -----------------------------
     Mock stats (replace later)
  ------------------------------ */
  const stats = [
    {
      title: 'Total Resources',
      value: all.length || 12,
      icon: FaBoxOpen,
      bg: 'bg-blue-50',
      text: 'text-blue-600'
    },
    {
      title: 'Active Resources',
      value: all.filter(r => r.is_active).length || 9,
      icon: FaCheckCircle,
      bg: 'bg-green-50',
      text: 'text-green-600'
    },
    {
      title: 'Inactive Resources',
      value: all.filter(r => !r.is_active).length || 3,
      icon: FaTimesCircle,
      bg: 'bg-red-50',
      text: 'text-red-600'
    },
    {
      title: 'Avg Rate / Day',
      value: '৳ 450',
      icon: FaMoneyBillWave,
      bg: 'bg-purple-50',
      text: 'text-purple-600'
    }
  ];

  /* -----------------------------
     Chart data (mock)
  ------------------------------ */
  const rateChartData = all.length
    ? all.map(r => ({
        name: r.name,
        rate: Number(r.rate_per_day)
      }))
    : [
        { name: 'Chair', rate: 50 },
        { name: 'Table', rate: 150 },
        { name: 'Mic', rate: 300 },
        { name: 'Speaker', rate: 800 }
      ];

  /* -----------------------------
     Filtering
  ------------------------------ */
  const filteredResources = all.filter(r => {
    const matchesSearch =
      r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && r.is_active) ||
      (statusFilter === 'inactive' && !r.is_active);

    return matchesSearch && matchesStatus;
  });

   const handleModal = (type, resource = null) => {
    setModal({ type, resource });
  };

  /* ================================
   CREATE RESOURCE
================================ */
const handleAddResource = async (jsonData) => {
  setIsLoading(true);
  try {
    const res = await fetch(`/frontapi/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonData),
    });

    const resData = await res.json().catch(() => ({}));

    if (res.ok) {
      toast.success(resData.message || "Resource added successfully");
      router.refresh();
    } else {
      toast.error(resData.message || "Failed to add Resource");
    }
  } catch (err) {
    console.error("Add Resource error:", err);
    toast.error("Something went wrong.");
  } finally {
    setIsLoading(false);
    handleModal(null);
  }
};

/* ================================
   UPDATE RESOURCE
================================ */
const handleEditResource = async (jsonData) => {
  const id = jsonData.id || jsonData._id;
  if (!id) return toast.error("Resource ID missing");

  setIsLoading(true);
  try {
    const res = await fetch(`/frontapi/resources?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonData),
    });

    const resData = await res.json().catch(() => ({}));

    if (res.ok) {
      toast.success(resData.message || "Resource updated successfully");
      router.refresh();
    } else {
      toast.error(resData.message || "Failed to update Resource");
    }
  } catch (err) {
    console.error("Edit Resource error:", err);
    toast.error("Something went wrong.");
  } finally {
    setIsLoading(false);
    handleModal(null);
  }
};

/* ================================
   DELETE RESOURCE
================================ */
const handleDelete = async (id) => {
  if (!id) return toast.error("Resource ID missing");

  setIsLoading(true);
  try {
    const res = await fetch(`/frontapi/resources?id=${id}`, {
      method: "DELETE",
    });

    const resData = await res.json().catch(() => ({}));

    if (res.ok) {
      toast.success(resData.message || "Resource deleted successfully");
      router.refresh();
    } else {
      toast.error(resData.message || "Failed to delete Resource");
    }
  } catch (err) {
    console.error("Delete Resource error:", err);
    toast.error("Something went wrong.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Resource Management
          </h1>
          <p className="text-gray-600">
            Manage event resources, rates, and availability
          </p>
        </div>
        <button
           onClick={() => handleModal("add")} disabled={isLoading}
          className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus />
          Add Resource
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white border rounded-xl p-6 shadow-sm"
            >
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
            Resource Rate Comparison
          </h2>
          <FaChartBar className="text-gray-400" />
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={rateChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="rate" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            {['all', 'active', 'inactive'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold">Category</th>
              <th className="px-6 py-4 text-left text-xs font-semibold">Rate / Day</th>
              <th className="px-6 py-4 text-left text-xs font-semibold">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredResources.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{r.name}</td>
                <td className="px-6 py-4">{r.category || '-'}</td>
                <td className="px-6 py-4">৳{r.rate_per_day}</td>
                <td className="px-6 py-4">
                  {r.is_active ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-red-500">Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleModal("edit", r)} disabled={isLoading}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(r)} disabled={isLoading}
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

        {filteredResources.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No resources found
          </div>
        )}
      </div>
      
      {/* Modals */}
      {modal.type === "add" && (
        <ResourceAddModal
          isOpen
          onSubmit={handleAddResource}
          onClose={() => handleModal(null)}
        />
      )}

      {modal.type === "edit" && modal.resource && (
        <ResourceEditModal
          isOpen
          resource={modal.resource}
          onSubmit={handleEditResource}
          onClose={() => handleModal(null)}
        />
      )}

    </div>
  );
};

export default Overview;