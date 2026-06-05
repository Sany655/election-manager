"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

const AddResourceToEventModal = ({ isOpen, onClose, eventId, onSuccess }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    resource_id: "",
    quantity: 1,
    days: 1,
  });

  const selectedResource = resources.find(
    (r) => r.id === Number(form.resource_id)
  );

  const estimatedCost =
    selectedResource && form.quantity && form.days
      ? selectedResource.rate_per_day * form.quantity * form.days
      : 0;

  /* ----------------------------
     Load resources
  ----------------------------- */
  useEffect(() => {
    if (!isOpen) return;

    async function loadResources() {
      try {
        const res = await fetch("/frontapi/resources?status=active");
        const json = await res.json();
        setResources(json.data || []);
      } catch {
        toast.error("Failed to load resources");
      }
    }

    loadResources();
  }, [isOpen]);

  /* ----------------------------
     Handlers
  ----------------------------- */
  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.resource_id || form.quantity <= 0 || form.days <= 0) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/frontapi/events/${eventId}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resource_id: Number(form.resource_id),
          quantity: Number(form.quantity),
          days: Number(form.days),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.msg || "Failed");
      }

      toast.success("Resource added to event");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Add Resource</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Resource */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Resource *
            </label>
            <select
              value={form.resource_id}
              onChange={(e) =>
                handleChange("resource_id", e.target.value)
              }
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="">Select resource</option>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (৳{r.rate_per_day}/day)
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) =>
                handleChange("quantity", e.target.value)
              }
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          {/* Days */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Days *
            </label>
            <input
              type="number"
              min="1"
              value={form.days}
              onChange={(e) =>
                handleChange("days", e.target.value)
              }
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          {/* Cost Preview */}
          <div className="bg-gray-100 rounded p-3 text-sm">
            <p>
              <strong>Estimated Cost:</strong>{" "}
              ৳{estimatedCost || 0}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              {loading ? "Saving..." : "Add Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddResourceToEventModal;