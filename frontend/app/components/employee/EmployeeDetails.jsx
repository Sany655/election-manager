"use client";
import React from "react";
import dayjs from "dayjs";

// Icons
import {
  FiCheckCircle,
  FiDownload,
  FiEye,
  FiUser,
  FiMapPin,
  FiBuilding,
  FiUsers,
  FiFileText,
  FiDownloadCloud,
  FiUserPlus,
  FiMap,
  FiClock,
  FiHome,
  FiPhone,
  FiCreditCard,
} from "react-icons/fi";
import {
  FaTimesCircle,
  FaIdCard,
  FaGraduationCap,
  FaUserShield,
  FaParents,
  FaHandshake,
  FaAccessibleIcon,
  FaBriefcase,
  FaRing,
  FaBirthdayCake,
} from "react-icons/fa";
import {
  MdLocationCity,
  MdBusiness,
  MdOutlineLocationCity,
  MdBusinessCenter,
  MdAccountBalance,
  MdBloodtype,
} from "react-icons/md";
import toast from "react-hot-toast";
import Breadcrumb from "../Breadcrumb";
import Image from "next/image";
import noImg from "@/app/public/images/no-image.png";
import { AiFillBuild, AiFillEye } from "react-icons/ai";
import { BASE_URL_FOR_CLIENT } from "@/app/utils/constants";

const EmployeeDetails = ({ user }) => {
  const handleDocumentView = (docUrl, docType) => {
    if (docUrl) {
      const fullUrl = `${BASE_URL_FOR_CLIENT}/${docUrl}`;
      window.open(fullUrl, "_blank");
    } else {
      toast.error(`${docType} not available`);
    }
  };

  const handleDocumentDownload = (docUrl, docType, fileName) => {
    if (docUrl) {
      const fullUrl = `${BASE_URL_FOR_CLIENT}/${docUrl}`;
      const link = document.createElement("a");
      link.href = fullUrl;
      link.download = fileName || `${user.name}_${docType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${docType} download started`);
    } else {
      toast.error(`${docType} not available`);
    }
  };
  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <Breadcrumb pageName="Volunteer Details" />

        {/* Basic Information */}
        <div className="mb-6">
          <h5 className="text-lg font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-t-lg flex items-center gap-2">
            <FiUser className="w-5 h-5" />
            Basic Information
          </h5>
          <div className="bg-gray-50 p-4 rounded-b-lg dark:bg-gray-800 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Full Name:</strong> {user.name || "Not provided"}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Employee ID:</strong>{" "}
                {user.employee_id || "Not provided"}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Status:</strong>
                <span
                  className={`ml-2 inline-flex items-center gap-1 font-medium ${user.isActive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                    }`}
                >
                  {user.isActive ? (
                    <>
                      <FiCheckCircle className="w-4 h-4" />
                      Active
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="w-4 h-4" />
                      Inactive
                    </>
                  )}
                </span>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Gender:</strong> {user.gender || "Not specified"}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Joining Date:</strong>{" "}
                {user.joining_date
                  ? dayjs(user.joining_date).format("MMM DD, YYYY")
                  : "Not provided"}
              </p>

            </div>
          </div>
        </div>

        {/* Personal Details */}
        {user.personalDetails && (
          <div className="mb-6">
            <h5 className="text-lg font-medium bg-gradient-to-r from-pink-500 to-pink-600 text-white p-3 rounded-t-lg flex items-center gap-2">
              <FaBirthdayCake className="w-5 h-5" />
              Personal Details
            </h5>
            <div className="bg-gray-50 p-4 rounded-b-lg dark:bg-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <FaBirthdayCake className="w-4 h-4 text-pink-500" />
                  <div>
                    <strong>Date of Birth:</strong>
                    <div className="mt-1">
                      <span className="text-sm">
                        {user.personalDetails.dob
                          ? dayjs(user.personalDetails.dob).format(
                            "MMM DD, YYYY"
                          )
                          : "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <MdBloodtype className="w-4 h-4 text-red-500" />
                  <div>
                    <strong>Blood Group:</strong>
                    <div className="mt-1">
                      <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-sm dark:bg-red-900 dark:text-red-200">
                        {user.personalDetails.blood_group || "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <FaRing className="w-4 h-4 text-purple-500" />
                  <div>
                    <strong>Marital Status:</strong>
                    <div className="mt-1">
                      <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm dark:bg-purple-900 dark:text-purple-200 capitalize">
                        {user.personalDetails.marital_status || "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <FaBriefcase className="w-4 h-4 text-blue-500" />
                  <div>
                    <strong>Total Experience:</strong>
                    <div className="mt-1">
                      <span className="text-sm">
                        {user.personalDetails.total_experience
                          ? `${user.personalDetails.total_experience} years`
                          : "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <FaIdCard className="w-4 h-4 text-green-500" />
                  <div>
                    <strong>ID Type:</strong>
                    <div className="mt-1">
                      <span className="text-sm capitalize">
                        {user.personalDetails.identification_type ||
                          "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <FaIdCard className="w-4 h-4 text-green-600" />
                  <div>
                    <strong>ID Number:</strong>
                    <div className="mt-1">
                      <span className="text-sm">
                        {user.personalDetails.identification_no ||
                          "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <FaAccessibleIcon className="w-4 h-4 text-orange-500" />
                  <div>
                    <strong>Disability:</strong>
                    <div className="mt-1">
                      <span className="text-sm capitalize">
                        {user.personalDetails.disability || "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <MdAccountBalance className="w-4 h-4 text-indigo-500" />
                  <div>
                    <strong>Account Number:</strong>
                    <div className="mt-1">
                      <span className="text-sm">
                        {user.personalDetails.account_no || "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>



                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <FiPhone className="w-4 h-4 text-green-500" />
                  <div>
                    <strong>Emergency Contact:</strong>
                    <div className="mt-1">
                      <span className="text-sm">
                        {user.personalDetails.emergency_contact_phone ||
                          "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              {(user.personalDetails.present_address ||
                user.personalDetails.permanent_address) && (
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <h6 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                      <FiHome className="w-4 h-4" />
                      Address Information
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <strong className="text-gray-700 dark:text-gray-300">
                          Present Address:
                        </strong>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {user.personalDetails.present_address || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <strong className="text-gray-700 dark:text-gray-300">
                          Permanent Address:
                        </strong>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {user.personalDetails.permanent_address ||
                            "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Organizational Information */}
        <div className="mb-6">
          <h5 className="text-lg font-medium bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-t-lg flex items-center gap-2">
            <MdBusinessCenter className="w-5 h-5" />
            Organizational Information
          </h5>
          <div className="bg-gray-50 p-4 rounded-b-lg dark:bg-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <AiFillBuild className="w-4 h-4 text-blue-500" />
                <div>
                  <strong>Designation:</strong>
                  <div className="mt-1">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm dark:bg-blue-900 dark:text-blue-200">
                      {user.designation_name || "Not assigned"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FiMap className="w-4 h-4 text-green-500" />
                <div>
                  <strong>Division:</strong>
                  <div className="mt-1">
                    <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm dark:bg-green-900 dark:text-green-200">
                      {user.division_name || "Not assigned"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <MdOutlineLocationCity className="w-4 h-4 text-purple-500" />
                <div>
                  <strong>District:</strong>
                  <div className="mt-1">
                    <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm dark:bg-purple-900 dark:text-purple-200">
                      {user.district_name || "Not assigned"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FiUserPlus className="w-4 h-4 text-orange-500" />
                <div>
                  <strong>Upazilla:</strong>
                  <div className="mt-1">
                    <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm dark:bg-orange-900 dark:text-orange-200">
                      {user.upazilla_name || "Not assigned"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <div>
                  <strong>Union:</strong>
                  <div className="mt-1">
                    <span className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm dark:bg-indigo-900 dark:text-indigo-200">
                      {user.union_name || "Not assigned"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <div>
                  <strong>Ward:</strong>
                  <div className="mt-1">
                    <span className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm dark:bg-indigo-900 dark:text-indigo-200">
                      {user.ward || "Not assigned"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Policy */}
        {user.attendance?.attendence_policy && (
          <div className="mb-6">
            <h5 className="text-lg font-medium bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-3 rounded-t-lg flex items-center gap-2">
              <FiClock className="w-5 h-5" />
              Attendance Policy
            </h5>
            <div className="bg-gray-50 p-4 rounded-b-lg dark:bg-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <strong className="text-gray-700 dark:text-gray-300">
                    Policy Name:
                  </strong>
                  <p className="text-sm mt-1">
                    <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded dark:bg-yellow-900 dark:text-yellow-200">
                      {user.attendance.attendence_policy.name}
                    </span>
                  </p>
                </div>
                <div>
                  <strong className="text-gray-700 dark:text-gray-300">
                    Working Days:
                  </strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.attendance.attendence_policy.working_days.map(
                      (day, index) => (
                        <span
                          key={index}
                          className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs dark:bg-green-900 dark:text-green-200"
                        >
                          {day}
                        </span>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <strong className="text-gray-700 dark:text-gray-300">
                    Off Days:
                  </strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.attendance.attendence_policy.off_days.map(
                      (day, index) => (
                        <span
                          key={index}
                          className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs dark:bg-red-900 dark:text-red-200"
                        >
                          {day}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile & Authorization */}
        <div className="mb-6">
          <h5 className="text-lg font-medium bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 rounded-t-lg flex items-center gap-2">
            <FaUserShield className="w-5 h-5" />
            Profile & Authorization
          </h5>
          <div className="bg-gray-50 p-4 rounded-b-lg dark:bg-gray-800">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <Image
                    src={
                      user.avatar
                        ? `${BASE_URL_FOR_CLIENT}/${user.avatar}`
                        : noImg
                    }
                    alt={user.name || "Employee Avatar"}
                    height={120}
                    width={120}
                    className="rounded-lg object-cover border-2 border-gray-200 dark:border-gray-600 shadow-md"
                  />
                  <div className="absolute -bottom-2 -right-2">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                      {user.isActive ? (
                        <FiCheckCircle className="w-3 h-3 text-white" />
                      ) : (
                        <FaTimesCircle className="w-3 h-3 text-white" />
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Role Information */}
              <div className="flex-1">
                <div className="mb-3">
                  <strong className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FaUserShield className="w-4 h-4" />
                    Assigned Roles:
                  </strong>
                  <div className="mt-2">
                    {user?.roles?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.roles.map((role) => (
                          <span
                            key={role.id}
                            className=" bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1"
                          >
                            <FaUserShield className="w-3 h-3" />
                            {role.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">
                        No roles assigned
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-6">
          <h5 className="text-lg font-medium bg-gray-200 p-3 rounded-t-lg dark:bg-gray-700 dark:text-white">
            Contact Information
          </h5>
          <div className="bg-gray-50 p-4 rounded-b-lg dark:bg-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong> {user.email || "Not provided"}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Mobile (MSISDN):</strong>{" "}
                {user.msisdn || "Not provided"}
              </p>
            </div>
          </div>
        </div>

        {user.documents && (
          <div className="mb-6">
            <h5 className="text-lg font-medium bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-3 rounded-t-lg flex items-center gap-2">
              <FiFileText className="w-5 h-5" />
              Employee Documents
            </h5>
            <div className="bg-gray-50 p-4 rounded-b-lg dark:bg-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Profile Image */}
                <div className="border rounded-lg p-3 bg-white dark:bg-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FiUser className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-sm">Profile Image</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleDocumentView(
                          user.documents.image,
                          "Profile Image"
                        )
                      }
                      disabled={!user.documents.image}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${user.documents.image
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <FiEye className="w-3 h-3" />
                      View
                    </button>
                    <button
                      onClick={() =>
                        handleDocumentDownload(
                          user.documents.image,
                          "Profile_Image",
                          `${user.name}_profile_image`
                        )
                      }
                      disabled={!user.documents.image}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${user.documents.image
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <FiDownloadCloud className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                  {!user.documents.image && (
                    <p className="text-xs text-gray-500 mt-1">Not uploaded</p>
                  )}
                </div>

                {/* CV */}
                <div className="border rounded-lg p-3 bg-white dark:bg-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FiFileText className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-sm">CV/Resume</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleDocumentView(user.documents.cv, "CV")
                      }
                      disabled={!user.documents.cv}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${user.documents.cv
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <FiEye className="w-3 h-3" />
                      View
                    </button>
                    <button
                      onClick={() =>
                        handleDocumentDownload(
                          user.documents.cv,
                          "CV",
                          `${user.name}_cv`
                        )
                      }
                      disabled={!user.documents.cv}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${user.documents.cv
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <FiDownload className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                  {!user.documents.cv && (
                    <p className="text-xs text-gray-500 mt-1">Not uploaded</p>
                  )}
                </div>

                {/* NID */}
                <div className="border rounded-lg p-3 bg-white dark:bg-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FaIdCard className="w-4 h-4 text-purple-500" />
                    <span className="font-medium text-sm">National ID</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleDocumentView(user.documents.nid, "National ID")
                      }
                      disabled={!user.documents.nid}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${user.documents.nid
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <FiEye className="w-3 h-3" />
                      View
                    </button>
                    <button
                      onClick={() =>
                        handleDocumentDownload(
                          user.documents.nid,
                          "NID",
                          `${user.name}_nid`
                        )
                      }
                      disabled={!user.documents.nid}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${user.documents.nid
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <FiDownload className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                  {!user.documents.nid && (
                    <p className="text-xs text-gray-500 mt-1">Not uploaded</p>
                  )}
                </div>

                {/* Job Clearance */}
                <div className="border rounded-lg p-3 bg-white dark:bg-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FaUserShield className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-sm">Job Clearance</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleDocumentView(
                          user.documents.job_clearance,
                          "Job Clearance"
                        )
                      }
                      disabled={!user.documents.job_clearance}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${user.documents.job_clearance
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <FiEye className="w-3 h-3" />
                      View
                    </button>
                    <button
                      onClick={() =>
                        handleDocumentDownload(
                          user.documents.job_clearance,
                          "Job_Clearance",
                          `${user.name}_job_clearance`
                        )
                      }
                      disabled={!user.documents.job_clearance}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${user.documents.job_clearance
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <FiDownload className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                  {!user.documents.job_clearance && (
                    <p className="text-xs text-gray-500 mt-1">Not uploaded</p>
                  )}
                </div>

                {/* Educational Documents */}
                <div className="border rounded-lg p-3 bg-white dark:bg-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FaGraduationCap className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium text-sm">
                      Educational Docs
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleDocumentView(
                          user.documents.educational_docs,
                          "Educational Documents"
                        )
                      }
                      disabled={!user.documents.educational_docs}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${user.documents.educational_docs
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <FiEye className="w-3 h-3" />
                      View
                    </button>
                    <button
                      onClick={() =>
                        handleDocumentDownload(
                          user.documents.educational_docs,
                          "Educational_Documents",
                          `${user.name}_educational_docs`
                        )
                      }
                      disabled={!user.documents.educational_docs}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${user.documents.educational_docs
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <FiDownload className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                  {!user.documents.educational_docs && (
                    <p className="text-xs text-gray-500 mt-1">Not uploaded</p>
                  )}
                </div>

                {/* Guarantor Documents */}
                <div className="border rounded-lg p-3 bg-white dark:bg-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FaHandshake className="w-4 h-4 text-teal-500" />
                    <span className="font-medium text-sm">Guarantor Docs</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleDocumentView(
                          user.documents.guarantor_docs,
                          "Guarantor Documents"
                        )
                      }
                      disabled={!user.documents.guarantor_docs}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${user.documents.guarantor_docs
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <FiEye className="w-3 h-3" />
                      View
                    </button>
                    <button
                      onClick={() =>
                        handleDocumentDownload(
                          user.documents.guarantor_docs,
                          "Guarantor_Documents",
                          `${user.name}_guarantor_docs`
                        )
                      }
                      disabled={!user.documents.guarantor_docs}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${user.documents.guarantor_docs
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <FiDownload className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                  {!user.documents.guarantor_docs && (
                    <p className="text-xs text-gray-500 mt-1">Not uploaded</p>
                  )}
                </div>

                {/* Parents NID */}
                <div className="border rounded-lg p-3 bg-white dark:bg-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    {/* <FaParents className="w-4 h-4 text-pink-500" /> */}
                    <span className="font-medium text-sm">Parents NID</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleDocumentView(
                          user.documents.parents_nid,
                          "Parents NID"
                        )
                      }
                      disabled={!user.documents.parents_nid}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${user.documents.parents_nid
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <AiFillEye className="w-3 h-3" />
                      View
                    </button>
                    <button
                      onClick={() =>
                        handleDocumentDownload(
                          user.documents.parents_nid,
                          "Parents_NID",
                          `${user.name}_parents_nid`
                        )
                      }
                      disabled={!user.documents.parents_nid}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${user.documents.parents_nid
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <FiDownload className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                  {!user.documents.parents_nid && (
                    <p className="text-xs text-gray-500 mt-1">Not uploaded</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Information */}
        <div className="mb-6">
          <h5 className="text-lg font-medium bg-gradient-to-r from-gray-500 to-gray-600 text-white p-3 rounded-t-lg flex items-center gap-2">
            <FiFileText className="w-5 h-5" />
            System Information
          </h5>
          <div className="bg-gray-50 p-4 rounded-b-lg dark:bg-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>User ID:</strong> {user.id}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Created At:</strong>{" "}
                {user.createdAt
                  ? dayjs(user.createdAt).format("MMM DD, YYYY [at] hh:mm A")
                  : "Not available"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeDetails;
