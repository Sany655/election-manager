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
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
} from "react-icons/fa";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useConfirmDelete from "@/app/hooks/useConfirmDelete";
import EventTypeAddModal from "./EventTypeAddModal";
import EventTypeEditModal from "./EventTypeEditModal";


const ViewTable = ({ data, title }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filteredData, setFilteredData] = useState(data);

  const [modal, setModal] = useState({ type: null, event: null });
  const { confirmDelete } = useConfirmDelete();

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter(
        (event) =>
          event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.objective?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, data]);

  const handleModal = (type, event = null) => {
    setModal({ type, event });
  };

  const handleAdd = async (formData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg || "Event created successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.msg || "Failed to create event");
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

  const handleEdit = async (formData) => {
    const eventId = formData.id;

    if (!eventId) {
      toast.error("Event ID is required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/event?id=${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg || "Event updated successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.msg || "Failed to update event");
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

  const deleteEvent = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/event?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg || "Event deleted successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.msg || "Failed to delete event");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.dismiss();
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (event) => {
    confirmDelete({
      itemName: event.name,
      onDelete: () => deleteEvent(event.id),
      onSuccess: () => console.log("Event deleted successfully!"),
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };




  return (
    <div className="border border-stroke bg-white px-6 pt-6 pb-4 rounded-lg shadow-md dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Total {title}
              </p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {data.length}
              </p>
            </div>
            <FaCalendarAlt className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          {/* Add Button */}
          <Button
            onClick={() => handleModal("add")}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
            disabled={isLoading}
          >
            <FaPlusCircle className="w-4 h-4" />
            Add New {title}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type & Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Schedule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacity & Budget
              </th>
              <th className="px-6 text-center rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center">
                    <FaCalendarAlt className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-lg font-medium mb-2">
                      {searchTerm ? "No events found" : `No ${title} found`}
                    </p>
                    <p className="text-sm">
                      {searchTerm
                        ? "Try adjusting your search criteria"
                        : `Create your first ${title} to get started`}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((event, index) => (
                <tr key={event.id || index} className="hover:bg-gray-50">
                  {/* Event Details */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {event.name}
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-2 max-w-xs">
                      {event.objective}
                    </div>
                    {event.id && (
                      <div className="text-xs text-gray-400 mt-1">
                        ID: {event.id}
                      </div>
                    )}
                  </td>

                  {/* Type & Status */}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-900">
                        {getEventTypeName(event.type_id)}
                      </div>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(event.status)}
                        {getVisibilityBadge(event.visibility)}
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-900 line-clamp-2 max-w-xs">
                          {event.location}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Division: {event.division_id} | District:{" "}
                          {event.district_id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Schedule */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">Expected:</div>
                      <div className="text-sm text-gray-900">
                        {formatDate(event.expected_start_datetime)}
                      </div>
                      {event.actual_start_datetime && (
                        <>
                          <div className="text-xs text-gray-500 mt-2">
                            Actual:
                          </div>
                          <div className="text-sm text-green-600">
                            {formatDate(event.actual_start_datetime)}
                          </div>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Capacity & Budget */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      {event.capacity && (
                        <div className="flex items-center gap-2">
                          <FaUsers className="text-gray-400 text-xs" />
                          <span className="text-sm text-gray-900">
                            {event.capacity} people
                          </span>
                        </div>
                      )}
                      {event.est_budget && (
                        <div className="text-sm text-gray-900">
                          Budget: ৳{event.est_budget.toLocaleString()}
                        </div>
                      )}
                      {event.est_spending && (
                        <div className="text-xs text-gray-500">
                          Spending: ৳{event.est_spending.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          router.push(`/event/view/${event.id}`)
                        }
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FaEye size={16} />
                      </button>
                      <button
                        onClick={() => handleModal("edit", event)}
                        className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                        title="Edit Event"
                        disabled={isLoading}
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(event)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Event"
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
      {modal.type === "add" && (
        <EventTypeAddModal
          isOpen
          onSubmit={handleAdd}
          onClose={() => handleModal(null)}
          title={title}
        />
      )}
      {modal.type === "edit" && modal.event && (
        <EventTypeEditModal
          isOpen
          event={modal.event}
          onSubmit={handleEdit}
          onClose={() => handleModal(null)}
          title={title}
        />
      )}
    </div>
  );
};

export default ViewTable;