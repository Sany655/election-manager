"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  FaEdit,
  FaEye,
  FaTrash,
  FaUser,
  FaSearch,
  FaPlusCircle,
} from "react-icons/fa";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useConfirmDelete from "@/app/hooks/useConfirmDelete";
import Image from "next/image";
import noImg from "@/app/public/images/no-image.png";
import { MdOutlineLocalPolice } from "react-icons/md";
import HolidayAddModal from "./HolidayAddModal";
import HolidayEditModal from "./HolidayEditModal";
import AssignHolidayModal from "./HolidaySetModal";

const ViewTable = ({ data, users }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [modal, setModal] = useState({ type: null, user: null });
  const { confirmDelete } = useConfirmDelete();

  const handleModal = (type, user = null) => {
    setModal({ type, user });
  };

  const handleSetholiday = async (formData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/holiday/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg || "holiday set successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.msg || "Failed to set holiday");
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

  const handleAddHoliday = async (formData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/holiday`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg || "holiday added successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.msg || "Failed to add holiday");
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

  const handleEditUser = async (formData) => {
    const employeeId = formData.get("employee_id");

    if (!employeeId) {
      toast.error("Employee ID is required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/users/employee/${employeeId}`, {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg || "Employee updated successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.msg || "Failed to update employee");
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

  const deleteHoliday = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/holiday?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg || "Holiday deleted successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.msg || "Failed to delete holiday");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.dismiss();
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (user) => {
    confirmDelete({
      itemName: user.name,
      onDelete: () => deleteHoliday(user.id),
      onSuccess: () => console.log("holiday deleted successfully!"),
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 < 12 ? "AM" : "PM";
    return `${hour12}:${minutes.padStart(2, "0")} ${ampm}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDaysList = (days) => {
    return days?.join(", ");
  };

  return (
    <div className="border border-stroke bg-white px-6 pt-6 pb-4 rounded-lg shadow-md dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Total Set Holidays
              </p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {data.length}
              </p>
            </div>
            <MdOutlineLocalPolice className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={() => handleModal("set")}
            className="flex items-center gap-2 w-full sm:w-auto"
            disabled={isLoading}
          >
            <FaPlusCircle className="w-4 h-4" />
            Assign holiday
          </Button>
          <Button
            onClick={() => handleModal("add")}
            className="flex items-center gap-2 w-full sm:w-auto"
            disabled={isLoading}
          >
            <FaPlusCircle className="w-4 h-4" />
            Add New holiday
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Off Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scope
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 text-center rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center">
                    <p className="text-lg font-medium mb-2">No Holiday found</p>
                    <p className="text-sm">
                      Create your first holiday to get started
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((holiday, index) => (
                <tr key={holiday.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {holiday.name}
                    </div>
                    {holiday.id && (
                      <div className="text-xs text-gray-500">
                        ID: {holiday.id}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {holiday.description}
                    </div>
                   
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatDate(holiday.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{holiday.type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{holiday.scope}</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {holiday.updatedAt
                      ? formatDate(holiday.updatedAt)
                      : "Just created"}
                  </td>
                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* <button
                        onClick={() => router.push(`/region/view/${location.id}`)}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FaEye size={16} />
                      </button> */}
                      {/* <button
                        onClick={() => handleModal("edit", location)}
                        className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                        title="Edit Location"
                        disabled={isLoading}
                      >
                        <FaEdit size={16} />
                      </button> */}
                      <button
                        onClick={() => handleDelete(holiday)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Location"
                        disabled={isLoading}
                      >
                        <FaTrash size={16} />
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
      {modal.type === "set" && (
        <AssignHolidayModal
          isOpen
          onSubmit={handleSetholiday}
          onClose={() => handleModal(null)}
          users={users}
          holidays={data}
        />
      )}
      {modal.type === "add" && (
        <HolidayAddModal
          isOpen
          onSubmit={handleAddHoliday}
          onClose={() => handleModal(null)}
        />
      )}
      {modal.type === "edit" && modal.user && (
        <HolidayEditModal
          isOpen
          user={modal.user}
          onSubmit={handleEditUser}
          onClose={() => handleModal(null)}
        />
      )}
    </div>
  );
};

export default ViewTable;
