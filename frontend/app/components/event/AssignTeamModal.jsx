"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IoClose } from "react-icons/io5";

const AssignTeamModal = ({ isOpen, onClose, onSubmit, event, teams }) => {
    const [selectedTeams, setSelectedTeams] = useState([]);

    useEffect(() => {
        if (event?.volunteer_teams) {
            setSelectedTeams(event.volunteer_teams.map(t => t.id));
        } else {
            setSelectedTeams([]);
        }
    }, [event]);

    if (!isOpen) return null;

    const handleCheckboxChange = (teamId) => {
        setSelectedTeams((prev) =>
            prev.includes(teamId)
                ? prev.filter((id) => id !== teamId)
                : [...prev, teamId]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Calculate added and removed teams if necessary, or just send the new list.
        // The backend implementation currently does 'addVolunteer_teams', which might append.
        // If we want to *replace* or *set* the teams, the backend logic might need adjustment or we handle "remove" separately.
        // For now, let's assume this modal is for "Assigning" (Adding) new teams.
        // But looking at the backend `assignTeam` implementation: `await event.addVolunteer_teams(team_ids);`
        // It appends.

        // To strictly follow the "Assign" (potentially overwrite) or minimal "Add" logic, let's just send the selected ones.
        // However, the backend adds. So if I select already selected ones, it might be fine (Sequelize handles duplicates).
        // But for a better UX, we might want to differentiate.
        // For this task, let's treat it as "Add selected teams".

        onSubmit({ event_id: event.id, team_ids: selectedTeams });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-boxdark rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b dark:border-strokedark">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Assign Volunteer Teams
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Teams
                        </label>
                        <div className="max-h-60 overflow-y-auto border rounded-md p-2 dark:border-strokedark">
                            {teams.length > 0 ? (
                                teams.map((team) => (
                                    <div key={team.id} className="flex items-center gap-2 py-1">
                                        <input
                                            type="checkbox"
                                            id={`team-${team.id}`}
                                            checked={selectedTeams.includes(team.id)}
                                            onChange={() => handleCheckboxChange(team.id)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label
                                            htmlFor={`team-${team.id}`}
                                            className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                                        >
                                            {team.name}
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No volunteer teams available.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="px-4 py-2"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white">
                            Save Assignments
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignTeamModal;
