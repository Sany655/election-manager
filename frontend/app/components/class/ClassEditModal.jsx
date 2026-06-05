import React, { useEffect, useState } from "react";

const ClassEditModal = ({ isOpen, onClose, onSubmit, cls }) => {
  const [formData, setFormData] = useState({
    name: "",
  });

  // Populate form data when editing an existing cls
  useEffect(() => {
    if (cls) {
      setFormData({
        name: cls.name || "",
      });
    }
  }, [cls]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, id:cls.id });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit cls</h2>
        <form onSubmit={handleSubmit}>
          {[
            {
              label: "Class Name",
              name: "name",
              type: "text",
              placeholder: `Enter Class Name`,
              required: true,
            },
          ].map(({ label, name, type, placeholder, required }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required={required}
                className="w-full mt-1 p-2 border rounded-lg"
                placeholder={placeholder}
              />
            </div>
          ))}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassEditModal;
