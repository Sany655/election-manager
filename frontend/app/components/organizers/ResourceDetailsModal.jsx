"use client";

import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

const ResourceDetailsModal = ({ isOpen, onClose, resource }) => {
  const [data, setData] = useState({});

  useEffect(() => {
    if (resource) {
      setData({
        name: resource.name || "",
        category: resource.category || "",
        unit: resource.unit || "",
        daily_rate: resource.daily_rate || "",
        description: resource.description || "",
        status: resource.status ?? "",
        createdAt: resource.createdAt || "",
        updatedAt: resource.updatedAt || "",
      });
    }
  }, [resource]);

  if (!isOpen || !resource) return null;

  const ReadOnlyInput = ({ label, value }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        disabled
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
      />
    </div>
  );

  const formatDate = (date) =>
    date ? new Date(date).toLocaleString() : "—";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            Resource Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <section>
            <h3 className="text-lg font-medium border-b pb-2 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadOnlyInput label="Resource Name" value={data.name} />
              <ReadOnlyInput label="Category" value={data.category} />
              <ReadOnlyInput label="Unit" value={data.unit} />
              <ReadOnlyInput
                label="Daily Hire Rate (৳)"
                value={data.daily_rate}
              />
            </div>
          </section>

          {/* Description */}
          <section>
            <h3 className="text-lg font-medium border-b pb-2 mb-4">
              Description
            </h3>
            <textarea
              value={data.description}
              disabled
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
            />
          </section>

          {/* Status */}
          <section>
            <h3 className="text-lg font-medium border-b pb-2 mb-4">
              Status
            </h3>
            <ReadOnlyInput
              label="Status"
              value={data.status === 1 ? "Active" : "Inactive"}
            />
          </section>

          {/* Meta */}
          <section>
            <h3 className="text-lg font-medium border-b pb-2 mb-4">
              Metadata
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadOnlyInput
                label="Created At"
                value={formatDate(data.createdAt)}
              />
              <ReadOnlyInput
                label="Last Updated"
                value={formatDate(data.updatedAt)}
              />
            </div>
          </section>

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailsModal;