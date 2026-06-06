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
import TeamAddModal from "./TeamAddModal";
import TeamEditModal from "./TeamEditModal";
import AssignTeamMemberModal from "./AssignTeamMemberModal";
import PermissionGate from "../../PermissionGate";

const ViewTable = ({ data, users, title }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [modal, setModal] = useState({ type: null, user: null });
  const { confirmDelete } = useConfirmDelete();

  const handleModal = (type, user = null) => {
    setModal({ type, user });
  };

  const handleSetPolicy = async (formData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/employee/volunteer-team/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg || "Set successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.msg || "Failed to set");
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

  const handleAdd = async (formData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/employee/volunteer-team`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg || "Added successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.msg || "Failed to add!");
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

  const handleEdit = async (formData) => {
    setIsLoading(true);
    try {
      // formData here is JSON object, not FormData object, because TeamAddModal passes JSON
      // But verify: TeamAddModal passes jsonData.

      const res = await fetch(`/frontapi/employee/volunteer-team`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg || "Updated successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.msg || "Failed to update");
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

  const deleteUser = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/employee/volunteer-team?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg || "Deleted successfully");
        router.refresh();
      } else {
        toast.dismiss();
        toast.error(data.msg || "Failed to delete");
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
      itemName: user.name || user.team_name,
      onDelete: () => deleteUser(user.id),
      onSuccess: () => console.log("Deleted successfully!"),
    });
  };

  // Original deleteUser was:
  // const res = await fetch(`/frontapi/user?id=${id}`, {...});

  // ...

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
            <MdOutlineLocalPolice className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <PermissionGate permissions={["add-teams"]}>
            <Button
              onClick={() => handleModal("set")}
              className="flex items-center gap-2 w-full sm:w-auto"
              disabled={isLoading}
            >
              <FaPlusCircle className="w-4 h-4" />
              Assign {title} Memeber
            </Button>
          </PermissionGate>
          <PermissionGate permissions={["add-teams"]}>
            <Button
              onClick={() => handleModal("add")}
              className="flex items-center gap-2 w-full sm:w-auto"
              disabled={isLoading}
            >
              <FaPlusCircle className="w-4 h-4" />
              Add New {title}
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {title} Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team Members
              </th>
              <th className="px-6 text-center rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr><td colSpan="4" className="text-center p-6">No Team Found</td></tr>
            ) : (
              data.map((policy, index) => (
                <tr key={policy.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {policy.name || policy.policy_name}
                      {/* Debug: <span className="text-xs text-red-500">{JSON.stringify(policy)}</span> */}
                    </div>
                    {policy.id && (
                      <div className="text-xs text-gray-500">
                        ID: {policy.id}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {[
                        policy.division?.name,
                        policy.district?.name,
                        policy.upazilla?.name,
                        policy.union?.name
                      ].filter(Boolean).join(' > ') || 'N/A'}
                    </div>
                  </td>

                  {/* Members List */}
                  <td className="px-6 py-4">
                    {policy.members && policy.members.length > 0 ? (
                      <ul className="list-disc ml-4 space-y-1">
                        {policy.members.map((member) => (
                          <li key={member.id} className="text-sm text-gray-700">
                            {member.user ? (
                              <>
                                <span className="font-medium">
                                  ID: {member.user.id}
                                </span>{" "}
                                — <span>{member.user.name}</span>
                              </>
                            ) : (
                              <span className="text-gray-400 italic">
                                User not found
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400">No Members</span>
                    )}
                  </td>
                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGate permissions={["edit-teams"]}>
                        <button
                          onClick={() => handleModal("edit", policy)}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          disabled={isLoading}
                        >
                          <FaEdit size={16} />
                        </button>
                      </PermissionGate>
                      <PermissionGate permissions={["delete-teams"]}>
                        <button
                          onClick={() => handleDelete(policy)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={isLoading}
                        >
                          <FaTrash size={16} />
                        </button>
                      </PermissionGate>
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
        <AssignTeamMemberModal
          isOpen
          onSubmit={handleSetPolicy}
          onClose={() => handleModal(null)}
          users={users}
          teams={data}
          title={title}
        />
      )}

      {modal.type === "add" && (
        <TeamAddModal
          isOpen
          onSubmit={handleAdd}
          onClose={() => handleModal(null)}
          title={title}
        />
      )}

      {modal.type === "edit" && (
        <TeamEditModal
          isOpen
          onSubmit={handleEdit}
          onClose={() => handleModal(null)}
          title={title}
          initialData={modal.user}
          users={users}
        />
      )}
    </div>
  );
};

export default ViewTable;
