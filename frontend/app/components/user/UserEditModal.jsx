import React, { useEffect, useState } from "react";

const UserEditModal = ({ isOpen, onClose, onSubmit, roles = [], user, locations }) => {
  const [formData, setFormData] = useState({
    role: "",
    firstName: "",
    lastName: "",
    email: "",
    msisdn:"",
    password: "",
    status: true,
    avatar: null,
    avatarPreview: null,
  });

  // Populate form data when editing an existing user
  useEffect(() => {
    if (user) {
      setFormData({
        role: user.role|| "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        msisdn: user.msisdn || "",
        password: user.password || "",
        status: user.isActive,
        avatar: null, // Reset image selection
        imagePreview: user.avatar ? `${process.env.NEXT_PUBLIC_BASE_URL}/${user.avatar}` : "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file" && files?.[0]) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let formDataToSend = new FormData();
    formDataToSend.append('employee_id',user.employee_id);
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "imagePreview") return; 
      if (value) formDataToSend.append(key, value);
    });

    onSubmit(formDataToSend);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit user</h2>
        <form onSubmit={handleSubmit}>
          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="role"
              value={formData.role || ""}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg cursor-pointer"
              required
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {[
            { label: "First Name", name: "firstName", type: "text", placeholder: `Enter First Name`, required: true },
            { label: "Last Name", name: "lastName", type: "text", placeholder: `Enter Last Name` },
            { label: "Email", name: "email", type: "email", placeholder: `Enter Email`, required: true },
            { label: "Mobile", name: "msisdn", type: "text", placeholder: `Enter msisdn`},
            { label: "Password", name: "password", type: "text", placeholder: `Enter Password`, required: true },
          ].map(({ label, name, type, placeholder, required }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700">{label}</label>
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


          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">user Image</label>
            <input
              type="file"
              name="image"
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
              accept="image/*"
            />
            {formData.imagePreview && (
              <img src={formData.imagePreview} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
            )}
          </div>

          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="status"
              name="status"
              checked={formData.status}
              onChange={handleChange}
              className="h-4 w-4"
              
            />
            <label htmlFor="status" className="text-sm font-medium text-gray-700">Active</label>
          </div>

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

export default UserEditModal;
