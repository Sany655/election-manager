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
import PolicyAddModal from "./PolicyAddModal";
import PolicyEditModal from "./PolicyEditModal";
import { MdOutlineLocalPolice } from "react-icons/md";
import SetPolicyModal from "./SetPolicyModal";
import { formatDateTime } from "@/app/utils/helpers";
import { FaMessage } from "react-icons/fa6";
import MessageModal from "./MessageModal";

const ViewTable = ({ data = [], users = [], volunteer_teams = [], title }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [modal, setModal] = useState({ type: null, user: null });
  const { confirmDelete } = useConfirmDelete();

  const handleModal = (type, user = null) => {
    setModal({ type, user });
  };

  const handleSendMessage = async (formData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/messages/team`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg || "Message sent successfully");
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to send message");
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

  const sendMessage = (task) => {
    setModal({ type: "message", user: task });
  };

  const handleAssignTask = async (formData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/tasks/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg || "Task assigned successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.msg || "Failed to assign task");
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

  const handleAddTask = async (formData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg || "Policy added successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.msg || "Failed to add policy");
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

  const handleEditTask = async (formData) => {
    const taskId = formData.get("task_id");

    if (!taskId) {
      toast.error("Task ID is required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/users/policy/${taskId}`, {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg || "Updated successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.msg || "Failed to update task");
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

  const deleteTask = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/task?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg || "Task deleted successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.msg || "Failed to delete task");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.dismiss();
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (task) => {
    confirmDelete({
      itemName: task.name,
      onDelete: () => deleteTask(task.id),
      onSuccess: () => console.log("Task deleted successfully!"),
    });
  };

  const handleStatusChange = async (taskId, newStatus) => {

    if (!taskId) {
      toast.error("Task ID is required");
      return;
    }

    try {
      const res = await fetch(`/frontapi/policy/status`, {
        method: "PATCH",
        body: JSON.stringify({ taskId, status: newStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus(newStatus)
        toast.dismiss();
        toast.success(data.message || "Updated successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to update task");
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


  return (
    <div className="border border-stroke bg-white px-6 pt-6 pb-4 rounded-lg shadow-md dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Total Tasks
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
            Assign Task
          </Button>
          <Button
            onClick={() => handleModal("add")}
            className="flex items-center gap-2 w-full sm:w-auto"
            disabled={isLoading}
          >
            <FaPlusCircle className="w-4 h-4" />
            Add New Task
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned Team
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
                    <p className="text-lg font-medium mb-2">No Task found</p>
                    <p className="text-sm">
                      Create your first task to get started
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((task, index) => (
                <tr key={task.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {task.title}
                    </div>
                    {task.id && (
                      <div className="text-xs text-gray-500">
                        ID: {task.id}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {task.description || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500">
                      {task.priority === 3
                        ? "High"
                        : task.priority === 2
                          ? "Medium"
                          : "Low"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500">
                      {formatDateTime(task.duetime) || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={task.status}
                      disabled={task.status === "Completed"}
                      onChange={(e) =>
                        handleStatusChange(task.id, e.target.value)
                      }
                      className={`text-xs rounded-md border px-2 py-1 outline-none
      ${task.status === "Completed"
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:border-blue-400"
                        }
    `}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In-Progress">In-Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500">
                      {task.volunteer_teams.length > 0 && task.volunteer_teams.map(team => <ul><li>{team.name}</li></ul>)}
                    </div>
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
                        onClick={() => sendMessage(task)}
                        className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                        title="Send Message to Assigned Team"
                        disabled={isLoading}
                      >
                        <FaMessage size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(task)}
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
        <SetPolicyModal
          isOpen
          onSubmit={handleAssignTask}
          onClose={() => handleModal(null)}
          users={volunteer_teams}
          tasks={data}
          volunteer_teams={volunteer_teams}
          title={title}
        />
      )}
      {modal.type === "add" && (
        <PolicyAddModal
          isOpen
          onSubmit={handleAddTask}
          onClose={() => handleModal(null)}
          title={title}
        />
      )}
      {modal.type === "edit" && modal.user && (
        <PolicyEditModal
          isOpen
          user={modal.user}
          onSubmit={handleEditTask}
          onClose={() => handleModal(null)}
          title={title}
        />
      )}
      {modal.type === "message" && modal.user && (
        <MessageModal
          isOpen
          task={modal.user}
          onSubmit={handleSendMessage}
          onClose={() => handleModal(null)}
        />
      )}
    </div>
  );
};

export default ViewTable;
