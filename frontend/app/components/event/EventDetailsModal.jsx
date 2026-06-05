"use client";
import React, { useEffect, useState } from "react";
import { FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaUsers, FaInfoCircle, FaBuilding } from "react-icons/fa";
import EventResourceSection from "./EventResourceSection";

const EventDetailsModal = ({ isOpen, onClose, event, title }) => {
  const [loading, setLoading] = useState(true);

  // Lookup states
  const [eventTypes, setEventTypes] = useState({});
  const [targetGroups, setTargetGroups] = useState({});
  const [organizers, setOrganizers] = useState({});

  // Fetch Lookups for mapping IDs to Names
  useEffect(() => {
    let mounted = true;
    const fetchLookups = async () => {
      try {
        const [etRes, tgRes, orgRes] = await Promise.all([
          fetch("/frontapi/event-types"),
          fetch("/frontapi/event-target-groups"),
          fetch("/frontapi/organizers"),
        ]);

        if (!mounted) return;

        const etJson = await etRes.json().catch(() => ({ data: [] }));
        const tgJson = await tgRes.json().catch(() => ({ data: [] }));
        const orgJson = await orgRes.json().catch(() => ({ data: [] }));

        // Convert array to object map for O(1) lookup
        const etMap = (etJson.data || []).reduce((acc, item) => ({ ...acc, [item.id]: item.name }), {});
        const tgMap = (tgJson.data || []).reduce((acc, item) => ({ ...acc, [item.id]: item.name }), {});
        const orgMap = (orgJson.data || []).reduce((acc, item) => ({ ...acc, [item.id]: item.name }), {});

        setEventTypes(etMap);
        setTargetGroups(tgMap);
        setOrganizers(orgMap);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load lookups", error);
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchLookups();
    }

    return () => { mounted = false; };
  }, [isOpen]);

  if (!isOpen || !event) return null;

  // Helper mappings
  const STATUS_MAP = {
    0: { label: "Draft", color: "bg-gray-100 text-gray-800" },
    1: { label: "Planned", color: "bg-blue-100 text-blue-800" },
    2: { label: "Ongoing", color: "bg-green-100 text-green-800" },
    3: { label: "Completed", color: "bg-purple-100 text-purple-800" },
    4: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  };

  const VISIBILITY_MAP = {
    0: "Private",
    1: "Public",
    2: "Members Only",
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString([], {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "N/A";
    return `৳${Number(amount).toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${STATUS_MAP[event.status]?.color || "bg-gray-100 text-gray-800"}`}>
              {STATUS_MAP[event.status]?.label || "Unknown"}
            </div>
            <h2 className="text-xl font-bold text-gray-900 truncate max-w-md">
              {event.name}
            </h2>
            <span className="text-sm text-gray-400">#{event.id}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left Column */}
            <div className="space-y-6">

              {/* Overview Card */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4 text-blue-600">
                  <FaInfoCircle />
                  <h3 className="font-semibold text-lg text-gray-800">Overview</h3>
                </div>
                <div className="space-y-4">
                  <DetailRow label="Objective" value={event.objective} fullWidth />
                  <div className="grid grid-cols-2 gap-4">
                    <DetailRow label="Type" value={eventTypes[event.type_id] || "Loading..."} />
                    <DetailRow label="Target Group" value={targetGroups[event.target_group_id] || "Loading..."} />
                    <DetailRow label="Visibility" value={VISIBILITY_MAP[event.visibility]} />
                    <DetailRow label="Capacity" value={event.capacity ? `${event.capacity} Attendees` : "N/A"} />
                  </div>
                </div>
              </div>

              {/* Organization Card */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4 text-purple-600">
                  <FaUsers />
                  <h3 className="font-semibold text-lg text-gray-800">Organization</h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailRow label="Organized By" value={organizers[event.organized_by] || "Loading..."} />
                    <DetailRow label="Created By (User)" value={event.created_by} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Teams</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {event.volunteer_teams && event.volunteer_teams.length > 0 ? (
                        event.volunteer_teams.map(team => (
                          <span key={team.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {team.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 italic text-sm">No teams assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="space-y-6">

              {/* Location Card */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4 text-red-500">
                  <FaMapMarkerAlt />
                  <h3 className="font-semibold text-lg text-gray-800">Location</h3>
                </div>
                <div className="space-y-4">
                  <DetailRow label="Address" value={event.location} fullWidth />

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="text-xs font-medium text-gray-400 uppercase mb-2">Hierarchical Location</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <LocationItem label="Division" value={event.division?.name} />
                      <LocationItem label="District" value={event.district?.name} />
                      <LocationItem label="Upazilla" value={event.upazilla?.name} />
                      <LocationItem label="Union" value={event.union?.name} />
                      <LocationItem label="Ward" value={event.ward ? `Ward ${event.ward}` : null} highlight />
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule & Budget Card */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <FaCalendarAlt />
                    <h3 className="font-semibold text-lg text-gray-800">Schedule</h3>
                  </div>
                  <div className="flex items-center gap-2 text-amber-600">
                    <FaMoneyBillWave />
                    <h3 className="font-semibold text-lg text-gray-800">Budget</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Schedule Column */}
                  <div className="space-y-3 border-r pr-4">
                    <DateItem label="Expected Start" date={event.expected_start_datetime} />
                    <DateItem label="Expected End" date={event.expected_end_datetime} />
                    <div className="my-2 border-t border-dashed"></div>
                    <DateItem label="Actual Start" date={event.actual_start_datetime} secondary />
                    <DateItem label="Actual End" date={event.actual_end_datetime} secondary />
                  </div>

                  {/* Budget Column */}
                  <div className="space-y-3">
                    <BudgetRow label="Est. Budget" amount={event.est_budget} />
                    <BudgetRow label="Est. Spending" amount={event.est_spending} />

                    {/* Simple visual bar for spending vs budget */}
                    {(event.est_budget > 0 && event.est_spending > 0) && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Utilization</span>
                          <span>{Math.round((event.est_spending / event.est_budget) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${event.est_spending > event.est_budget ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min((event.est_spending / event.est_budget) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Resources Section */}
          <div className="mt-8">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <FaBuilding className="text-indigo-500" /> Resources
              </h3>
              <EventResourceSection eventId={event.id} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 font-medium hover:bg-gray-50 hover:text-gray-900 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-components for cleaner code
const DetailRow = ({ label, value, fullWidth = false }) => (
  <div className={fullWidth ? "col-span-full" : ""}>
    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
      {label}
    </label>
    <div className="text-sm text-gray-900 font-medium break-words">
      {value || <span className="text-gray-400 italic">N/A</span>}
    </div>
  </div>
);

const LocationItem = ({ label, value, highlight = false }) => {
  if (!value) return null;
  return (
    <div className={`flex flex-col ${highlight ? 'col-span-2 mt-2 pt-2 border-t border-dashed' : ''}`}>
      <span className="text-[10px] text-gray-400 uppercase">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-indigo-600' : 'text-gray-700'}`}>{value}</span>
    </div>
  );
}

const DateItem = ({ label, date, secondary = false }) => (
  <div>
    <span className={`text-[10px] uppercase tracking-wider block mb-0.5 ${secondary ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
    <span className={`text-sm ${secondary ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
      {date ? new Date(date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '---'}
    </span>
  </div>
);

const BudgetRow = ({ label, amount }) => (
  <div>
    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">{label}</span>
    <span className="text-lg font-bold text-gray-800 font-mono tracking-tight">
      {amount ? `৳${Number(amount).toLocaleString()}` : '৳0'}
    </span>
  </div>
);


export default EventDetailsModal;