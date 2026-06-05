"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useConfirmDelete from "@/app/hooks/useConfirmDelete";
import Pagination from "../Pagination";
import ClassAddModal from "./ClassAddModal";
import ClassEditModal from "./ClassEditModal";

const ViewTable = ({ data }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(data.data || []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data.data);
    } else {
      const lower = searchTerm.toLowerCase();
      const result = data.data.filter(
        (cls) =>
          cls.name.toLowerCase().includes(lower) 
      );
      setFilteredData(result);
    }
  }, [searchTerm, data.data]);

  const [modal, setModal] = useState({ type: null, cls: null });
  const { confirmDelete } = useConfirmDelete();

  const handleModal = (type, cls = null) => {
    setModal({ type, cls });
  };

  const handleAddClass = async (formData) => {
    const res = await fetch(`/frontapi/class`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok) {
      toast.dismiss();
      toast.success(data.msg);
      router.refresh();
    } else {
      toast.dismiss();
      toast.error(data.msg);
      setError(data.msg || "Class Creation Failed!");
    }
    handleModal(null);
  };

  const handleEditClass = async (formData) => {
    const res = await fetch(`/frontapi/class`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok) {
      toast.dismiss();
      toast.success(data.msg);
      router.refresh();
    } else {
      toast.dismiss();
      toast.error(data.msg);
      setError(data.msg || "Class Creation Failed!");
    }
    handleModal(null);
  };

  const deleteClass = async (id) => {
    const res = await fetch(`/frontapi/class?id=${id}`, {
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
      setError(data.msg || "Class Deletion Failed!");
    }
    handleModal(null);
  };

  const handleDelete = async (cls) => {
    confirmDelete({
      itemName: cls.name,
      onDelete: () => deleteClass(cls.id),
      onSuccess: () => console.log("Class deleted successfully!"),
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
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-72"
        />
        <Button onClick={() => handleModal("add")}>+ Add New</Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-meta-4 text-left text-sm font-semibold uppercase">
              <th className="p-3">Name</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((cls) => (
              <tr
                key={cls.id}
                className="border-b hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <td className="p-3">{cls.name}</td>

                <td className="p-3 text-center flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleModal("edit", cls)}
                    className="text-yellow-500 hover:text-yellow-700"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(cls)}
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
        <ClassAddModal
          isOpen
          onSubmit={handleAddClass}
          onClose={() => handleModal(null)}
        />
      )}
      {modal.type === "edit" && modal.cls && (
        <ClassEditModal
          isOpen
          cls={modal.cls}
          onSubmit={handleEditClass}
          onClose={() => handleModal(null)}
        />
      )}
    </div>
  );
};

export default ViewTable;
