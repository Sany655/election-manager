'use client';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaPlusCircle,
} from 'react-icons/fa';
import { AiOutlineAntDesign } from 'react-icons/ai';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useConfirmDelete from '@/app/hooks/useConfirmDelete';
import Pagination from '../Pagination';
import EventTargetGroupEditModal from './EventTargetGroupEditModal';
import EventTargetGroupAddModal from './EventTargetGroupAddModal';

const ViewTable = ({ data = [], users = [] }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // FILTER (no useEffect, no re-render loops)
  const filteredData = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    if (!searchTerm) return list;

    const lower = searchTerm.toLowerCase();
    return list.filter(
      (d) =>
        (d.name || '').toLowerCase().includes(lower) ||
        (d.description || '').toLowerCase().includes(lower)
    );
  }, [data, searchTerm]);

  const [modal, setModal] = useState({ type: null, item: null });
  const { confirmDelete } = useConfirmDelete();

  const handleModal = (type, item = null) => {
    setModal({ type, item });
  };

  // CREATE
  const handleAddEventTargetGroup = async (jsonData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/event-target-groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });

      const resData = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success(resData.message || 'Event Target Group added successfully');
        router.refresh();
      } else {
        toast.error(resData.message || 'Failed to add Event Target Group');
      }
    } catch (err) {
      console.error('Add error:', err);
      toast.error('Something went wrong.');
    } finally {
      setIsLoading(false);
      handleModal(null);
    }
  };

  // UPDATE
  const handleEditEventTargetGroup = async (jsonData) => {
    const id = jsonData.id || jsonData._id;
    if (!id) return toast.error('Event Target Group ID missing');

    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/event-target-groups?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });

      const resData = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success(resData.message || 'Updated successfully');
        router.refresh();
      } else {
        toast.error(resData.message || 'Failed to update Event Target Group');
      }
    } catch (err) {
      console.error('Edit error:', err);
      toast.error('Something went wrong.');
    } finally {
      setIsLoading(false);
      handleModal(null);
    }
  };

  // DELETE
  const deleteEventTargetGroup = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/event-target-groups?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const resData = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success(resData.message || 'Event Target Group deleted');
        router.refresh();
      } else {
        toast.error(resData.message || 'Failed to delete');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (item) => {
    confirmDelete({
      itemName: item.name,
      onDelete: () => deleteEventTargetGroup(item.id || item._id),
    });
  };

  return (
    <div className="border border-stroke bg-white px-6 pt-6 pb-4 rounded-lg shadow-md dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search target group..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-80"
            />
          </div>
        </div>

        <Button
          onClick={() => handleModal('add')}
          className="flex items-center gap-2 w-full sm:w-auto"
          disabled={isLoading}
        >
          <FaPlusCircle className="w-4 h-4" />
          Add Event Target Group
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">Total Target Groups</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {filteredData.length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-left text-sm font-semibold">
              <th className="p-4 rounded-tl-lg">Target Group</th>
              <th className="p-4 text-center rounded-tr-lg">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => {
                const id = item.id || item._id || index;

                return (
                  <tr
                    key={id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <AiOutlineAntDesign className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleModal('edit', item)}
                          className="p-2 text-yellow-500 hover:text-yellow-700"
                        >
                          <FaEdit size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  No Target Groups found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Pagination data={data} />
      </div>

      {/* Modals */}
      {modal.type === 'add' && (
        <EventTargetGroupAddModal
          isOpen
          onSubmit={handleAddEventTargetGroup}
          onClose={() => handleModal(null)}
        />
      )}

      {modal.type === 'edit' && modal.item && (
        <EventTargetGroupEditModal
          isOpen
          eventtargetgroup={modal.item}
          onSubmit={handleEditEventTargetGroup}
          onClose={() => handleModal(null)}
        />
      )}
    </div>
  );
};

export default ViewTable;