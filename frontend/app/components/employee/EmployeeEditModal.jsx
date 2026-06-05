"use client";
import React, { useEffect, useState } from "react";
import { FaTimes, FaUpload, FaEye, FaTrash } from "react-icons/fa";
// import { BASE_URL_FOR_CLIENT } from "@/app/utils/constants";

const EmployeeEditModal = ({
  isOpen,
  onClose,
  onSubmit,
  roles = [],
  user,
  token,
  designations = [],
  title
}) => {
  const [formData, setFormData] = useState({
    // Mandatory fields
    employee_id: "",
    name: "",
    firstName: "",
    lastName: "",
    navName: "",
    email: "",
    password: "",
    role: "",

    // Optional fields
    designation_id: "",
    department_id: "",
    division_id: "",
    district_id: "",
    upazilla_id: "",
    union_id: "",
    ward: "",
    joining_date: "",
    msisdn: "",
    blood_group: "",
    dob: "",
    marital_status: "",
    total_experience: "",
    identification_type: "",
    identification_no: "",
    disability: "",
    account_type: "",
    account_no: "",
    status: true,

    // File fields
    image: null,
    cv: null,
    nid: null,
    job_clearance: null,
    educational_docs: null,
    guarantor_docs: null,
    parents_nid: null,

    // Preview URLs
    imagePreview: null,
    cvPreview: null,
    nidPreview: null,
    jobClearancePreview: null,
    educationalDocsPreview: null,
    guarantorDocsPreview: null,
    parentsNidPreview: null,
  });

  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("basic");
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazillas, setUpazillas] = useState([]);
  const [unions, setUnions] = useState([]);

  // Populate form data when editing an existing user
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        // Mandatory fields
        employee_id: user.employee_id || "",
        name: user.name || "",
        firstName: user.name ? user.name.split(' ')[0] : "",
        lastName: user.name ? user.name.split(' ').slice(1).join(' ') : "",
        navName: user.name || "",
        email: user.email || "", // Populate email
        password: "", // Don't pre-fill password for security
        role: user.roles?.[0]?.id || "",

        // Optional fields
        designation_id: user.designation_id || "",
        department_id: user.department_id || "",
        division_id: user.division_id || "",
        district_id: user.district_id || "",
        upazilla_id: user.upazilla_id || "",
        union_id: user.union_id || "",
        ward: user.ward || "",
        joining_date: user.joining_date ? user.joining_date.split("T")[0] : "",
        msisdn: user.msisdn || "",
        blood_group: user.blood_group || "",
        dob: user.dob ? user.dob.split("T")[0] : "",
        marital_status: user.marital_status || "",
        total_experience: user.total_experience || "",
        identification_type: user.identification_type || "",
        identification_no: user.identification_no || "",
        disability: user.disability || "",
        account_type: user.account_type || "",
        account_no: user.account_no || "",
        status: user.isActive !== undefined ? user.isActive : true,

        // Set preview URLs for existing files
        imagePreview: user.image
          ? `${process.env.NEXT_PUBLIC_BASE_URL_FOR_CLIENT}/${user.image}`
          : null,
        cvPreview: user.cv
          ? `${process.env.NEXT_PUBLIC_BASE_URL_FOR_CLIENT}/${user.cv}`
          : null,
        nidPreview: user.nid
          ? `${process.env.NEXT_PUBLIC_BASE_URL_FOR_CLIENT}/${user.nid}`
          : null,
        jobClearancePreview: user.job_clearance
          ? `${process.env.NEXT_PUBLIC_BASE_URL_FOR_CLIENT}/${user.job_clearance}`
          : null,
        educationalDocsPreview: user.educational_docs
          ? `${process.env.NEXT_PUBLIC_BASE_URL_FOR_CLIENT}/${user.educational_docs}`
          : null,
        guarantorDocsPreview: user.guarantor_docs
          ? `${process.env.NEXT_PUBLIC_BASE_URL_FOR_CLIENT}/${user.guarantor_docs}`
          : null,
        parentsNidPreview: user.parents_nid
          ? `${process.env.NEXT_PUBLIC_BASE_URL_FOR_CLIENT}/${user.parents_nid}`
          : null,
      }));
    }
  }, [user]);

  //functions calls for Divisions
  const fetchDivisions = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/geo/divisions`, {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();

      if (!res.ok) {
        setDivisions([]);
        return;
      }

      setDivisions(data);
    } catch (error) {
      console.error("Fetch failed:", error);
      setDivisions([]);
    }
  };

  useEffect(() => {
    fetchDivisions();
  }, []);

  //functions calls for Districts
  const fetchDistricts = async (division_id) => {
    if (!division_id) {
      setDistricts([]);
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/geo/districts/${division_id}`, {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
      );

      const data = await res.json();

      if (!res.ok) {
        setDistricts([]);
        return;
      }

      setDistricts(data);
    } catch (error) {
      console.error("Fetch failed:", error);
      setDistricts([]);
    }
  };

  useEffect(() => {
    fetchDistricts(formData.division_id);
  }, [formData.division_id]);

  //functions calls for Upazillas
  const fetchUpazillas = async (district_id) => {
    if (!district_id) {
      setUpazillas([]);
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/geo/upazillas/${district_id}`, {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
      );

      const data = await res.json();

      if (!res.ok) {
        setUpazillas([]);
        return;
      }

      setUpazillas(data);
    } catch (error) {
      console.error("Fetch failed:", error);
      setUpazillas([]);
    }
  };

  useEffect(() => {
    fetchUpazillas(formData.district_id);
  }, [formData.district_id]);

  //functions calls for Unions
  const fetchUnions = async (upazilla_id) => {
    if (!upazilla_id) {
      setUnions([]);
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/geo/unions/${upazilla_id}`, {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
      );

      const data = await res.json();

      if (!res.ok) {
        setUnions([]);
        return;
      }

      setUnions(data);
    } catch (error) {
      console.error("Fetch failed:", error);
      setUnions([]);
    }
  };

  useEffect(() => {
    fetchUnions(formData.upazilla_id);
  }, [formData.upazilla_id]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      const file = files?.[0];
      if (file) {
        const previewName = `${name}Preview`;
        setFormData((prev) => ({
          ...prev,
          [name]: file,
          [previewName]: URL.createObjectURL(file),
        }));
      }
    } else {
      setFormData((prev) => {
        const newData = {
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        };

        // Reset child fields when parent changes
        if (name === "division_id") {
          newData.district_id = "";
          newData.upazilla_id = "";
          newData.union_id = "";
        } else if (name === "district_id") {
          newData.upazilla_id = "";
          newData.union_id = "";
        } else if (name === "upazilla_id") {
          newData.union_id = "";
        }

        return newData;
      });
    }
  };

  const handleFileRemove = (fieldName) => {
    const previewName = `${fieldName}Preview`;
    if (formData[previewName] && formData[previewName].startsWith("blob:")) {
      URL.revokeObjectURL(formData[previewName]);
    }
    setFormData((prev) => ({
      ...prev,
      [fieldName]: null,
      [previewName]: null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const formDataToSend = new FormData();

    // Construct name from parts
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    if (fullName) {
      formDataToSend.append('name', fullName);
    } else {
      formDataToSend.append('name', formData.name); // Fallback
    }

    // Always append the user ID for updates
    if (user?.id) {
      formDataToSend.append("id", user.id);
    }

    // Append all form fields (excluding preview fields)
    Object.entries(formData).forEach(([key, value]) => {
      if (key.endsWith("Preview")) return; // Skip preview fields

      // Skip split fields as they are combined into 'name'
      if (key === 'firstName' || key === 'lastName' || key === 'navName' || key === 'name') return;

      if (value !== null && value !== "") {
        // Convert boolean to string for FormData
        if (typeof value === "boolean") {
          formDataToSend.append(key, value ? "1" : "0");
        } else {
          formDataToSend.append(key, value);
        }
      }
    });

    const result = await onSubmit(formDataToSend);
    if (result && !result.success) {
      setError(result.msg);
    }
  };

  const handleClose = () => {
    // Clean up object URLs to prevent memory leaks
    Object.keys(formData).forEach((key) => {
      if (
        key.endsWith("Preview") &&
        formData[key] &&
        formData[key].startsWith("blob:")
      ) {
        URL.revokeObjectURL(formData[key]);
      }
    });
    onClose();
  };

  const renderFileUpload = (fieldName, label, accept = "*/*") => {
    const previewName = `${fieldName}Preview`;
    const hasFile = formData[fieldName] || formData[previewName];

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            name={fieldName}
            onChange={handleChange}
            className="flex-1 p-2 border rounded-lg text-sm"
            accept={accept}
          />
          {hasFile && (
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={() => window.open(formData[previewName], "_blank")}
                className="p-2 text-blue-600 hover:text-blue-800"
                title="View file"
              >
                <FaEye size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleFileRemove(fieldName)}
                className="p-2 text-red-600 hover:text-red-800"
                title="Remove file"
              >
                <FaTrash size={14} />
              </button>
            </div>
          )}
        </div>
        {formData[previewName] && (
          <div className="text-xs text-green-600">
            File attached: {formData[fieldName]?.name || "Existing file"}
          </div>
        )}
      </div>
    );
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {user ? `Edit ${title}` : `Add ${title}`}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <FaTimes />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          {[
            { id: "basic", label: "Basic Info" },
            // { id: "work", label: "Work Details" },
            // { id: "personal", label: "Personal Info" },
            // { id: "documents", label: "Documents" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              {typeof error === 'object' ? (
                <ul className="list-disc list-inside">
                  {Object.values(error).flat().map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              ) : (
                <span className="block sm:inline">{error}</span>
              )}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {title} ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 p-2 border rounded-lg"
                    placeholder={`Enter ${title} ID`}
                  />
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 p-2 border rounded-lg"
                    placeholder="Enter First Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 p-2 border rounded-lg"
                    placeholder="Enter Last Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="navName"
                    value={formData.navName}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                    placeholder="Name shown in navigation"
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 p-2 border rounded-lg"
                    placeholder="Enter Full Name"
                  />
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                    placeholder="Enter Email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!user} // Only required for new users
                    className="w-full mt-1 p-2 border rounded-lg"
                    placeholder={
                      user
                        ? "Leave blank to keep current password"
                        : "Enter Password"
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 p-2 border rounded-lg"
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    name="msisdn"
                    value={formData.msisdn}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                    placeholder="Enter Mobile Number"
                  />
                </div> */}

                {/* <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="status"
                    name="status"
                    checked={formData.status}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />
                  <label
                    htmlFor="status"
                    className="text-sm font-medium text-gray-700"
                  >
                    Active Status
                  </label>
                </div> */}
              </div>
            )}

            {/* Work Details Tab */}
            {/* Work Details Tab */}
            {false && activeTab === "work" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Designation
                  </label>
                  <select
                    name="designation_id"
                    value={formData.designation_id}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                  >
                    <option value="">Select Designation</option>
                    {designations.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Division
                  </label>
                  <select
                    name="division_id"
                    value={formData.division_id}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                  >
                    <option value="">Select Division</option>
                    {divisions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    District
                  </label>
                  <select
                    name="district_id"
                    value={formData.district_id}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                  >
                    <option value="">Select District</option>
                    {districts.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Upazilla
                  </label>
                  <select
                    name="upazilla_id"
                    value={formData.upazilla_id}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                  >
                    <option value="">Select Upazilla</option>
                    {upazillas?.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Union
                  </label>
                  <select
                    name="union_id"
                    value={formData.union_id}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                  >
                    <option value="">Select Union</option>
                    {unions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ward
                  </label>
                  <input
                    type="number"
                    name="ward"
                    value={formData.ward}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                    placeholder="Enter Ward Number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total Experience
                  </label>
                  <input
                    type="text"
                    name="total_experience"
                    value={formData.total_experience}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                    placeholder="e.g., 3 years"
                  />
                </div>
              </div>
            )}

            {/* Personal Info Tab */}
            {/* Personal Info Tab */}
            {/* {activeTab === "personal" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Blood Group
                  </label>
                  <select
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Marital Status
                  </label>
                  <select
                    name="marital_status"
                    value={formData.marital_status}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                  >
                    <option value="">Select Marital Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Identification Type
                  </label>
                  <select
                    name="identification_type"
                    value={formData.identification_type}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                  >
                    <option value="">Select ID Type</option>
                    <option value="nid">National ID</option>
                    <option value="passport">Passport</option>
                    <option value="driving_license">Driving License</option>
                    <option value="birth_certificate">Birth Certificate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Identification Number
                  </label>
                  <input
                    type="text"
                    name="identification_no"
                    value={formData.identification_no}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                    placeholder="Enter ID Number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Disability
                  </label>
                  <select
                    name="disability"
                    value={formData.disability}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                  >
                    <option value="">Select Disability Status</option>
                    <option value="none">None</option>
                    <option value="physical">Physical</option>
                    <option value="visual">Visual</option>
                    <option value="hearing">Hearing</option>
                    <option value="intellectual">Intellectual</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Account Type
                  </label>
                  <select
                    name="account_type"
                    value={formData.account_type}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                  >
                    <option value="">Select Account Type</option>
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                    <option value="salary">Salary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="account_no"
                    value={formData.account_no}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                    placeholder="Enter Account Number"
                  />
                </div>
              </div>
            )} */}

            {/* Documents Tab */}
            {/* Documents Tab */}
            {/* {activeTab === "documents" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFileUpload("image", "Profile Image", "image/*")}
                {renderFileUpload("cv", "CV/Resume", ".pdf,.doc,.docx")}
                {renderFileUpload("nid", "National ID", "image/*,.pdf")}
                {renderFileUpload(
                  "job_clearance",
                  "Job Clearance",
                  ".pdf,.jpg,.jpeg,.png"
                )}
                {renderFileUpload(
                  "educational_docs",
                  "Educational Documents",
                  ".pdf,.jpg,.jpeg,.png"
                )}
                {renderFileUpload(
                  "guarantor_docs",
                  "Guarantor Documents",
                  ".pdf,.jpg,.jpeg,.png"
                )}
                {renderFileUpload(
                  "parents_nid",
                  "Parents' NID",
                  "image/*,.pdf"
                )}
              </div>
            )} */}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {user ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div >
    </div >
  );
};

export default EmployeeEditModal;
