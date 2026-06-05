"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

const EventResourceSection = ({ eventId }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/frontapi/events/${eventId}/resources`);
      const json = await res.json();
      setResources(json.data || []);
    } catch (err) {
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) loadResources();
  }, [eventId]);

  const removeResource = async (id) => {
    if (!confirm("Remove this resource?")) return;

    try {
      await fetch(`/frontapi/event-resources/${id}`, {
        method: "DELETE",
      });
      toast.success("Resource removed");
      loadResources();
    } catch {
      toast.error("Delete failed");
    }
  };

  const totalCost = resources.reduce(
    (sum, r) => sum + Number(r.total_cost || 0),
    0
  );

  return (
    <div className="mt-8 border rounded-lg p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Allocated Resources</h3>
                {showAdd && (
          <AddResourceToEventModal
            isOpen={showAdd}
            eventId={eventId}
            onClose={() => setShowAdd(false)}
            onSuccess={loadResources}
          />
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Resource</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Rate</th>
              <th className="p-2">Days</th>
              <th className="p-2">Total</th>
              <th className="p-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {resources.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No resources allocated
                </td>
              </tr>
            )}

            {resources.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.resource?.name}</td>
                <td className="p-2 text-center">{r.quantity}</td>
                <td className="p-2 text-center">৳{r.rate}</td>
                <td className="p-2 text-center">{r.days}</td>
                <td className="p-2 text-center font-semibold">
                  ৳{r.total_cost}
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => removeResource(r.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 text-right font-bold text-lg">
        Total Resource Cost: ৳{totalCost}
      </div>
    </div>
  );
};

export default EventResourceSection;