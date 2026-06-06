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
  FaClock,
} from "react-icons/fa";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useConfirmDelete from "@/app/hooks/useConfirmDelete";
import EventAddModal from "./EventAddModal";
import EventEditModal from "./EventEditModal";
import EventDetailsModal from "./EventDetailsModal";
import AssignTeamModal from "./AssignTeamModal";
import { MdGroups } from "react-icons/md";

const ViewTable = ({ data, title, volunteer_teams = [] }) => {
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

  const handleAssignTeam = async (formData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/event/teams/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.dismiss();
        toast.success(data.message || "Teams assigned successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to assign teams");
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

  const handleView = async (formData) => {
    const eventId = formData.id;

    if (!eventId) {
      toast.error("Event ID is required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/event/${eventId}`, {
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

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { label: "Draft", color: "bg-gray-100 text-gray-800" },
      1: { label: "Planned", color: "bg-blue-100 text-blue-800" },
      2: { label: "Ongoing", color: "bg-green-100 text-green-800" },
      3: { label: "Completed", color: "bg-purple-100 text-purple-800" },
      4: { label: "Cancelled", color: "bg-red-100 text-red-800" },
    };
    const statusInfo = statusMap[status] || statusMap[0];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
      >
        {statusInfo.label}
      </span>
    );
  };

  const getVisibilityBadge = (visibility) => {
    const visibilityMap = {
      0: { label: "Private", color: "bg-gray-100 text-gray-800" },
      1: { label: "Public", color: "bg-green-100 text-green-800" },
      2: { label: "Members Only", color: "bg-blue-100 text-blue-800" },
    };
    const visibilityInfo = visibilityMap[visibility] || visibilityMap[0];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${visibilityInfo.color}`}
      >
        {visibilityInfo.label}
      </span>
    );
  };

  // Get event type name (you can replace with actual lookup)
  const getEventTypeName = (typeId) => {
    const types = {
      1: "Conference",
      2: "Community Service",
      3: "Workshop",
      4: "Fundraiser",
      5: "Social Gathering",
    };
    return types[typeId] || `Type ${typeId}`;
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

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-lg shadow">
            <div className="flex flex-col items-center">
              <FaCalendarAlt className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-lg font-medium mb-2">
                {searchTerm ? "No activities found" : `No ${title} found`}
              </p>
              <p className="text-sm">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : `Create your first ${title} to get started`}
              </p>
            </div>
          </div>
        ) : (
          filteredData.map((event, index) => {
            const startDate = event.expected_start_datetime || event.actual_start_datetime;
            const endDate = event.expected_end_datetime || event.actual_end_datetime;
            
            const month = startDate ? new Date(startDate).toLocaleString("en-US", { month: "short" }).toUpperCase() : "TBA";
            const day = startDate ? new Date(startDate).toLocaleString("en-US", { day: "2-digit" }) : "--";
            const year = startDate ? new Date(startDate).getFullYear() : "----";
            
            const formatTime = (d) => new Date(d).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
            const timeString = startDate ? (endDate ? `${formatTime(startDate)} - ${formatTime(endDate)}` : formatTime(startDate)) : "Time TBA";

            const statusMap = {
              0: { label: "Draft", color: "bg-gray-100 text-gray-800" },
              1: { label: "Planned", color: "bg-blue-100 text-blue-800" },
              2: { label: "Ongoing", color: "bg-green-100 text-green-800" },
              3: { label: "Completed", color: "bg-green-100 text-green-800" },
              4: { label: "Cancelled", color: "bg-red-100 text-red-800" },
            };
            const statusInfo = statusMap[event.status] || statusMap[0];

            return (
              <div key={event.id || index} className="flex flex-col bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    {/* Date Box */}
                    <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl px-4 py-2 min-w-[70px]">
                      <span className="text-blue-600 font-semibold text-xs tracking-wider">{month}</span>
                      <span className="text-2xl font-bold text-gray-900 leading-tight my-0.5">{day}</span>
                      <span className="text-gray-400 text-xs">{year}</span>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col justify-center">
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-1 pr-16">{event.name}</h3>
                      <div className="flex items-center text-gray-500 text-sm mt-1 gap-1.5">
                        <FaMapMarkerAlt className="flex-shrink-0" />
                        <span className="line-clamp-1">{event.location || 'Location TBA'}</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm mt-1 gap-1.5">
                        <FaClock className="flex-shrink-0" />
                        <span>{timeString}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge - Absolute positioned so it doesn't squish title */}
                  <span className={`absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleModal("view", event)}
                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <FaEye size={16} />
                  </button>
                  <button
                    onClick={() => handleModal("edit", event)}
                    className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="Edit Activity"
                    disabled={isLoading}
                  >
                    <FaEdit size={16} />
                  </button>
                  <button
                    onClick={() => handleModal("assign", event)}
                    className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Assign Team"
                    disabled={isLoading}
                  >
                    <MdGroups size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(event)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Activity"
                    disabled={isLoading}
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {modal.type === "add" && (
        <EventAddModal
          isOpen
          onSubmit={handleAdd}
          onClose={() => handleModal(null)}
          title={title}
        />
      )}
      {modal.type === "edit" && modal.event && (
        <EventEditModal
          isOpen
          event={modal.event}
          onSubmit={handleEdit}
          onClose={() => handleModal(null)}
          title={title}
        />
      )}
      {modal.type === "view" && modal.event && (
        <EventDetailsModal
          isOpen
          event={modal.event}
          onSubmit={handleView}
          onClose={() => handleModal(null)}
          title={title}
        />
      )}
      {modal.type === "assign" && modal.event && (
        <AssignTeamModal
          isOpen
          event={modal.event}
          teams={volunteer_teams}
          onSubmit={handleAssignTeam}
          onClose={() => handleModal(null)}
        />
      )}
    </div>
  );
};

export default ViewTable;