"use client";

import React, { useState, useEffect } from "react";
import DefaultLayout from "@/app/components/layout/DefaultLayout";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Loader from "@/app/components/Loader";
import toast from "react-hot-toast";
import { FaUserTie, FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await fetch("/frontapi/candidates");
      if (res.ok) {
        const result = await res.json();
        setCandidates(result.data || []);
      } else {
        toast.error("Failed to load candidates");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;
    try {
      const res = await fetch(`/frontapi/candidates/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Candidate deleted successfully");
        fetchCandidates();
      } else {
        toast.error("Failed to delete candidate");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting candidate");
    }
  };

  const handleToggleStatus = async (candidate) => {
    try {
      const newStatus = !candidate.isActive;
      const data = new FormData();
      data.append('isActive', newStatus ? 1 : 0);

      const res = await fetch(`/frontapi/candidates/${candidate.id}`, {
        method: "PUT",
        body: data,
      });

      if (res.ok) {
        toast.success(`Candidate ${newStatus ? 'activated' : 'deactivated'} successfully`);
        fetchCandidates();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating status");
    }
  };

  return (
    <DefaultLayout title="Candidates Management">
      <ProtectedRoute permissions={["view-candidates"]}>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <FaUserTie className="text-blue-600" />
                Candidates Management
              </h1>
              <p className="text-gray-600">Manage election candidates and their profiles</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                href="/candidates/add"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
              >
                <FaPlus />
                Add Candidate
              </Link>
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Candidate</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Position</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Organization</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Approval Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {candidates.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          No candidates found.
                        </td>
                      </tr>
                    ) : (
                      candidates.map((candidate) => (
                        <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                {candidate.photo ? (
                                  <img 
                                    src={`${process.env.NEXT_PUBLIC_BASE_URL}/${candidate.photo}`} 
                                    alt={candidate.name} 
                                    className="w-full h-full object-cover" 
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                                    {candidate.name?.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{candidate.name}</p>
                                <p className="text-xs text-gray-500">{candidate.email}</p>
                                <p className="text-xs text-gray-500">{candidate.msisdn}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {candidate.election_position || "N/A"}
                            {candidate.candidate_category && <div className="text-xs text-gray-500 mt-1">{candidate.candidate_category}</div>}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {candidate.organization || "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="sr-only peer" 
                                  checked={candidate.isActive} 
                                  onChange={() => handleToggleStatus(candidate)} 
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                              <span className={`text-xs font-semibold ${candidate.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                                {candidate.isActive ? 'Approved' : 'Pending'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <Link
                                href={`/candidates/edit/${candidate.id}`}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="Edit Candidate"
                              >
                                <FaEdit />
                              </Link>
                              <button
                                onClick={() => handleDelete(candidate.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Delete Candidate"
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
            </div>
          )}
        </div>
      </ProtectedRoute>
    </DefaultLayout>
  );
}
