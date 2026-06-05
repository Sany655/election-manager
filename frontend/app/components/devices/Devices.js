"use client";
import { BASE_URL_FOR_CLIENT } from "@/app/utils/constants";
import React, { useState, useEffect } from "react";
import {
  FaWifi,
  FaUser,
  FaMapMarkerAlt,
  FaClock,
  FaCircle,
  FaSync,
} from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import { MdSignalWifiOff } from "react-icons/md";
import PermissionGate from "../PermissionGate";
import useConfirmDelete from "@/app/hooks/useConfirmDelete";
import { formatDateTime, formatLastSeen } from "@/app/utils/helpers";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { confirmDelete } = useConfirmDelete();
  const router = useRouter();

  const token =
    typeof localStorage !== "undefined" && localStorage.getItem("token")
      ? JSON.parse(localStorage.getItem("token"))
      : null;

  // Fetch devices from API
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL_FOR_CLIENT}/api/devices`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }); // Replace with your actual API endpoint
      const data = await response.json();

      if (data.success) {
        setDevices(data.data);
      } else {
        setError(data.msg || "Failed to fetch devices");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteDevice = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/device?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.dismiss();
        toast.success(data.message || "Device deleted successfully");
        fetchDevices();
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to delete device");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.dismiss();
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (device) => {
    confirmDelete({
      itemName: `Device ${device.id}`,
      onDelete: () => deleteDevice(device.id),
      onSuccess: () => console.log("Device deleted successfully!"),
    });
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 30000);
    return () => clearInterval(interval);
  }, []);

  // if (loading) {
  //   return (
  //     <div className="p-6">
  //       <h1 className="text-2xl font-bold mb-6">Devices</h1>
  //       <div className="flex items-center justify-center py-12">
  //         <FaSync className="animate-spin h-5 w-5 text-blue-600" />
  //         <span className="ml-2 text-gray-600">Loading devices...</span>
  //       </div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Devices</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <MdSignalWifiOff className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 font-medium">
              Error loading devices
            </span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={fetchDevices}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors flex items-center"
          >
            <FaSync className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const activeDevices = devices.filter((device) => device.color === "green");
  const inactiveDevices = devices.filter((device) => device.color === "red");

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
          Device Status Dashboard
        </h1>
        <button
          onClick={fetchDevices}
          className="flex items-center justify-center px-3 py-2 sm:px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          <FaSync className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <FaWifi className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Total Devices
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {devices.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <FaCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Active Devices
              </p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {activeDevices.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-red-500 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <MdSignalWifiOff className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 mr-2 sm:mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Inactive Devices
              </p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">
                {inactiveDevices.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Devices List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            All Devices
          </h2>
        </div>

        {devices.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <MdSignalWifiOff className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-500 text-base sm:text-lg">
              No devices found
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {devices.map((device, index) => (
              <div
                key={device.mac_address || index}
                className="p-3 sm:p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    {/* Status Indicator */}
                    <div className="flex items-center flex-shrink-0 pt-1 sm:pt-0">
                      {device.color === "green" ? (
                        <FaWifi className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                      ) : (
                        <MdSignalWifiOff className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                      )}
                      <FaCircle
                        className={`h-2 w-2 sm:h-3 sm:w-3 ml-1 sm:ml-2 ${
                          device.color === "green"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      />
                    </div>

                    {/* Device Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                        {/* <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          {device.device_name || "Unknown Device"}
                        </h3> */}
                        {/* <span
                          className={`px-2 py-1 rounded-full text-xs font-medium self-start sm:self-auto ${
                            device.color === "green"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {device.color === "green" ? "Active" : "Inactive"}
                        </span> */}
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 mt-1 font-mono break-all">
                        MAC: {device.mac_address}
                      </p>

                      {/* User Info */}
                      {device.user ? (
                        <div className="flex flex-col sm:flex-row sm:items-center mt-2 space-y-1 sm:space-y-0 sm:space-x-4">
                          <div className="flex items-center text-xs sm:text-sm text-gray-600 min-w-0">
                            <FaUser className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">
                              {device.user.name} ({device.user.employee_id})
                            </span>
                          </div>
                          {device.user.rffPoint && (
                            <div className="flex items-center text-xs sm:text-sm text-gray-600 min-w-0">
                              <FaMapMarkerAlt className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                {device.user.rffPoint.name}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center mt-2 text-xs sm:text-sm text-gray-500">
                          <FaUser className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                          <span>No user assigned</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Time Info */}
                  <div className="text-left sm:text-right flex-shrink-0 ml-8 sm:ml-0">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-1">
                      <FaClock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                      <span className="whitespace-nowrap">
                        {formatLastSeen(device.lastSeenMin)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 break-words sm:break-normal">
                      {formatDateTime(device.last_ping)}
                    </p>
                  </div>
                  <PermissionGate permissions={["delete-device"]}>
                    <div className="flex-shrink-0 ml-4">
                      <button
                        onClick={() => handleDelete(device)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        <FaTrashCan />
                      </button>
                    </div>
                  </PermissionGate>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Devices;
