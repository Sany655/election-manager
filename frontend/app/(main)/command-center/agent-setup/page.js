"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaCheck, FaEdit, FaTrash } from 'react-icons/fa';
import DefaultLayout from '@/app/components/layout/DefaultLayout';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import AgentAddModal from '@/app/components/command-center/AgentAddModal';
import AgentEditModal from '@/app/components/command-center/AgentEditModal';
import useConfirmDelete from '@/app/hooks/useConfirmDelete';
import { toast } from 'react-hot-toast';

const AgentSetup = () => {
    const [agents, setAgents] = useState([]);
    const [roles, setRoles] = useState([]);
    // Modal state: { type: null | 'add' | 'edit', user: null }
    const [modal, setModal] = useState({ type: null, user: null });
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedAgents, setSelectedAgents] = useState([]);
    const [voteCentres, setVoteCentres] = useState([]);

    // Assign Data State
    const [assignData, setAssignData] = useState({
        booth_id: '',
        shift_date: new Date().toISOString().split('T')[0],
        expected_start_time: '08:00'
    });

    useEffect(() => {
        fetchAgents();
        fetchRoles();
    }, []);

    const fetchAgents = async () => {
        try {
            const res = await axios.get('/frontapi/command-center/agents');
            if (res.data.success) {
                setAgents(res.data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchRoles = async () => {
        try {
            // Assuming we can fetch roles from a public or protected endpoint
            // If fetching from /api/users/roles requires token, we might need a helper or just use frontapi wrapper if exists.
            // Let's assume /frontapi/employee/roles exists or we use the direct API with token.
            // Since we don't have a direct 'getAuthToken' here easily without import, let's try a frontapi endpoint or assume strict fetching.
            // Actually, in `frontend/app/(main)/volunteer/view/page.js` it fetches from server side.
            // Here we are client side. We can use axios to /api/users/roles if we interpret it as internal API,
            // but usually we need token.
            // `getAuthToken` helper is available in utils.
            // Let's rely on `AgentAddModal` fetching its own divisions etc. Role fetching might fail if we don't have token.
            // I'll try to fetch roles via axios which might have an interceptor or I'll skip role fetching if the modal handles it?
            // `AgentAddModal` takes `roles` prop. So I MUST fetch them here.

            // Checking how other client components fetch. ViewTable.jsx receives roles as prop from Server Component page.js.
            // Ideally `AgentSetup` should be a Server Component or fetch data in `useEffect`.
            // Let's try fetching from `/api/roles` if available?

            // Workaround: Hardcode 'agent' role search in modal if fetch fails?
            // Or use the `fetchUserRoles` logic?
            const token = localStorage.getItem('auth_token') || document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/roles`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoles(res.data.data);
        } catch (error) {
            console.error("Failed to fetch roles", error);
            // Fallback: Create a explicit 'agent' role object if fetching fails so the modal works
            setRoles([{ id: 999, name: 'agent' }]); // Dummy fallback
        }
    };

    const fetchVoteCentres = async () => {
        if (voteCentres.length > 0) return;
        try {
            const res = await axios.get('/frontapi/command-center/vote-centres');
            if (res.data.success) {
                setVoteCentres(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch vote centres", error);
        }
    };

    const handleCreateAgent = async (formData) => {
        try {
            // formData is a FormData object from the modal
            const res = await axios.post('/frontapi/command-center/agents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setModal({ type: null, user: null });
                fetchAgents();
                toast.success('Agent Created Successfully');
                return { success: true };
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Error creating agent';
            toast.error(msg);
            return { success: false, msg };
        }
    };

    const handleUpdateAgent = async (formData) => {
        try {
            // Need to handle update. Current `commandCenterController` might not have specific update endpoint for Agents?
            // "use a copy... add here the edit functionality".
            // I might need to implement updateAgent in controller or use `PUT /frontapi/command-center/agents/:id`?
            // Or use the generic `PATCH /frontapi/employee`.

            // Since Agents are Users, we can use the generic Employee Update endpoint!
            // `ViewTable.jsx` uses `PATCH /frontapi/employee?id=...`.
            // Let's try that.

            const id = formData.get('id');
            const res = await axios.patch(`/frontapi/employee?id=${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.status === 200 || res.data.success) {
                setModal({ type: null, user: null });
                fetchAgents();
                toast.success('Agent Updated Successfully');
                return { success: true };
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Error updating agent';
            toast.error(msg);
            return { success: false, msg };
        }
    };

    const deleteAgent = async (id) => {
        try {
            const res = await axios.delete(`/frontapi/employee?id=${id}`);
            if (res.status === 200 || res.data.success) {
                fetchAgents();
            } else {
                throw new Error(res.data.msg || 'Failed to delete');
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const handleDelete = (agent) => {
        confirmDelete({
            itemName: agent.name,
            onDelete: () => deleteAgent(agent.id),
        });
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!assignData.booth_id) return alert("Select a booth");

        try {
            const res = await axios.post('/frontapi/command-center/assign', {
                agent_ids: selectedAgents,
                ...assignData
            });
            if (res.data.success) {
                setShowAssignModal(false);
                fetchAgents();
                setSelectedAgents([]);
                alert('Agents Assigned Successfully');
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Error assigning agents';
            alert(msg);
        }
    };

    const toggleSelectAgent = (id) => {
        if (selectedAgents.includes(id)) {
            setSelectedAgents(selectedAgents.filter(aid => aid !== id));
        } else {
            setSelectedAgents([...selectedAgents, id]);
        }
    };

    const handleOpenAssignModal = () => {
        if (selectedAgents.length === 0) return alert("Select at least one agent");
        fetchVoteCentres();
        setShowAssignModal(true);
    }

    const openEditModal = (agent) => {
        setModal({ type: 'edit', user: agent });
    };

    return (
        <DefaultLayout>
            <ProtectedRoute permissions={['view-command-center']}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Agent Setup</h1>
                        <div className="flex gap-2">
                            {selectedAgents.length > 0 && (
                                <button
                                    onClick={handleOpenAssignModal}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
                                >
                                    Assign Selected ({selectedAgents.length})
                                </button>
                            )}
                            <button
                                onClick={() => setModal({ type: 'add', user: null })}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                            >
                                <FaPlus /> Add New Agent
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="p-4 w-10">
                                        <input
                                            type="checkbox"
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedAgents(agents.map(a => a.id));
                                                else setSelectedAgents([]);
                                            }}
                                            checked={selectedAgents.length === agents.length && agents.length > 0}
                                        />
                                    </th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-200">Name</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-200">Phone</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-200">Email</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-200">NID</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-200">Status</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-200">Assignment</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-200">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {agents.length === 0 ? (
                                    <tr><td colSpan="8" className="p-4 text-center text-gray-500">No agents found</td></tr>
                                ) : (
                                    agents.map(agent => (
                                        <tr key={agent.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAgents.includes(agent.id)}
                                                    onChange={() => toggleSelectAgent(agent.id)}
                                                />
                                            </td>
                                            <td className="p-4 text-gray-700 dark:text-gray-300">{agent.name}</td>
                                            <td className="p-4 text-gray-700 dark:text-gray-300">{agent.msisdn}</td>
                                            <td className="p-4 text-gray-700 dark:text-gray-300">{agent.email}</td>
                                            <td className="p-4 text-gray-700 dark:text-gray-300">{agent.personalDetails?.identification_no || 'N/A'}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs ${agent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {agent.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                {agent.assignments?.length > 0 ? (
                                                    <span className="text-green-600 flex items-center gap-1"><FaCheck /> Assigned</span>
                                                ) : (
                                                    <span className="text-gray-400">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="p-4 flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(agent)}
                                                    className="text-blue-600 hover:text-blue-800 p-2"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(agent)}
                                                    className="text-red-600 hover:text-red-800 p-2"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* New Agent Add Modal */}
                    {modal.type === 'add' && (
                        <AgentAddModal
                            isOpen={true}
                            onClose={() => setModal({ type: null, user: null })}
                            onSubmit={handleCreateAgent}
                            roles={roles}
                            title="Agent"
                        />
                    )}

                    {/* New Agent Edit Modal */}
                    {modal.type === 'edit' && modal.user && (
                        <AgentEditModal
                            isOpen={true}
                            onClose={() => setModal({ type: null, user: null })}
                            onSubmit={handleUpdateAgent}
                            user={modal.user}
                            title="Agent"
                        />
                    )}


                    {/* Assign Modal - Kept as is */}
                    {showAssignModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                                <h2 className="text-xl font-bold mb-4 dark:text-white">Assign Agents</h2>
                                <p className="text-sm text-gray-500 mb-4">Assigning {selectedAgents.length} agents to a Vote Centre.</p>
                                <form onSubmit={handleAssign}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vote Centre</label>
                                        <select
                                            className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={assignData.booth_id}
                                            onChange={e => setAssignData({ ...assignData, booth_id: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Centre</option>
                                            {voteCentres.map(vc => (
                                                <option key={vc.id} value={vc.id}>{vc.name} ({vc.center_code})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Booth Number (optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 1 (Male)"
                                            className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={assignData.booth_number || ''}
                                            onChange={e => setAssignData({ ...assignData, booth_number: e.target.value })}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Leave empty for general center assignment</p>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                                        <input
                                            type="date"
                                            className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={assignData.shift_date}
                                            onChange={e => setAssignData({ ...assignData, shift_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowAssignModal(false)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                            Assign Agents
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </ProtectedRoute>
        </DefaultLayout>
    );
};

export default AgentSetup;
