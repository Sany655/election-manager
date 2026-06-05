"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useConfirmDelete from "@/app/hooks/useConfirmDelete";
import Pagination from "../Pagination";
import UserAddModal from "./UserAddModal";
import UserEditModal from "./UserEditModal";
import Image from "next/image";
import noImg from '@/app/public/images/no-image.png';

const ViewTable = ({ data, roles, policies }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(data.data || []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data.data);
    } else {
      const lower = searchTerm.toLowerCase();
      const result = data.data.filter(
        (user) =>
          user.name.toLowerCase().includes(lower) ||
          user.email?.toLowerCase().includes(lower) ||
          user.msisdn?.toString().includes(lower) ||
          user.roles.some((role) => role.name.toLowerCase().includes(lower))
      );
      setFilteredData(result);
    }
  }, [searchTerm, data.data]);

  const [modal, setModal] = useState({ type: null, user: null });
  const { confirmDelete } = useConfirmDelete();

  const handleModal = (type, user = null) => {
    setModal({ type, user });
  };

  const handleAddUser = async (formData) => {
    try {
      const res = await fetch(`/frontapi/user`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg);
        router.refresh();
        handleModal(null);
        return { success: true };
      } else {
        toast.dismiss();
        // toast.error(data.msg); // Let modal show error
        return { success: false, msg: data.msg || "User Creation Failed!" };
      }
    } catch (err) {
      console.error(err);
      return { success: false, msg: err.message || "Something went wrong!" };
    }
  };

  const handleEditUser = async (formData) => {
    try {
      const res = await fetch(`/frontapi/user`, {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg);
        router.refresh();
        handleModal(null);
        return { success: true };
      } else {
        toast.dismiss();
        // toast.error(data.msg);
        return { success: false, msg: data.msg || "User Update Failed!" };
      }
    } catch (err) {
      console.error(err);
      return { success: false, msg: err.message || "Something went wrong!" };
    }
  };

  const deleteUser = async (id) => {
    const res = await fetch(`/frontapi/user?id=${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (res.ok) {
      toast.dismiss();
      toast.success(data.msg);
      router.refresh();
    } else {
      toast.dismiss();
      toast.error(data.msg);
      setError(data.msg || "User Deletion Failed!");
    }
    handleModal(null);
  };


  const handleDelete = async (user) => {
    confirmDelete({
      itemName: user.firstName,
      onDelete: () => deleteUser(user.id),
      onSuccess: () => console.log("User deleted successfully!"),
    });
  };

  //   if (isLoading || isFetching) return <Loader />;
  //   if (isError) return <ErrorMessage />;

  return (
    <div className="border border-stroke bg-white px-6 pt-6 pb-4 rounded-lg shadow-md dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Input
          type="text"
          placeholder="Search by name, email, msisdn or role"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-72"
        />
        <Button onClick={() => handleModal("add")}>+ Add New</Button>
      </div>

      {/* <Breadcrumb pageName="users" /> */}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-meta-4 text-left text-sm font-semibold uppercase">
              <th className="p-3">Name</th>
              <th className="p-3 text-center">Msisdn</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Email</th>
              <th className="p-3 text-center">Roles</th>
              <th className="p-3 text-center">Avatar</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((user) => (
              <tr
                key={user.id}
                className="border-b hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <td className="p-3">{user.firstName}</td>
                <td className="p-3 text-center">
                  {user.msisdn ?? "Not provided"}
                </td>
                <td
                  className={`p-3 text-center font-medium ${user.isActive ? "text-green-500" : "text-red-500"
                    }`}
                >
                  {user.isActive ? "Active" : "Disabled"}
                </td>
                <td className="p-3 text-center">
                  {user.email ?? "Not Provided"}
                </td>
                <td className="p-3 text-center">
                  {user.roles.map((role) => role.name).join(" | ")}
                </td>
                <td className="p-3 text-center">
                  <Image
                    src={
                      user.avatar
                        ? `${process.env.NEXT_PUBLIC_BASE_URL}/${user.avatar}`
                        : noImg
                    }
                    alt={user.firstName || "User Avatar"}
                    height={80}
                    width={60}
                  />
                </td>

                <td className="p-3 text-center flex items-center justify-center gap-3">
                  <button
                    onClick={() => router.push(`/user/view/${user.id}`)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEye size={18} />
                  </button>
                  <button
                    onClick={() => handleModal("edit", user)}
                    className="text-yellow-500 hover:text-yellow-700"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination data={data} />

      {/* Modals */}
      {modal.type === "add" && (
        <UserAddModal
          isOpen
          onSubmit={handleAddUser}
          onClose={() => handleModal(null)}
          roles={roles}
          policies={policies}
        />
      )}
      {modal.type === "edit" && modal.user && (
        <UserEditModal
          isOpen
          user={modal.user}
          onSubmit={handleEditUser}
          onClose={() => handleModal(null)}
          roles={roles}
          policies={policies}
        />
      )}
    </div>
  );
};

export default ViewTable;
