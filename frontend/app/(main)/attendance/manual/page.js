"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaCheckCircle,
  FaExclamationCircle,
  FaSave,
  FaSpinner,
  FaSearch,
  FaChevronDown,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BASE_URL_FOR_CLIENT } from "@/app/utils/constants";
import DefaultLayout from "@/app/components/layout/DefaultLayout";

const ManualAttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    employeeId: "",
    location: "",
    action: "in", // 'in' or 'out'
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Employee search states
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const token =
    typeof localStorage !== "undefined" && localStorage.getItem("token")
      ? JSON.parse(localStorage.getItem("token"))
      : null;

  const fetchUsers = useCallback(
    async (searchQuery = "") => {
      setIsLoadingUsers(true);
      try {
        let url = `${BASE_URL_FOR_CLIENT}/api/users?role=user`;

        // Add search parameter if provided
        if (searchQuery.trim()) {
          url += `&search=${encodeURIComponent(searchQuery.trim())}`;
        }

        const res = await fetch(url, {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorBody = await res.text();
          console.error("Error fetching user:", res.status, errorBody);
          throw new Error("Failed to fetch user data");
        }

        const data = await res.json();
        setUsers(data.data || data || []); // Adjust based on your API response structure
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    },
    [token]
  );

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() || showDropdown) {
        fetchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchUsers, showDropdown]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (field, value) => {
    setAttendanceData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEmployeeSearch = (value) => {
    setSearchQuery(value);
    setShowDropdown(true);
    if (!value.trim()) {
      setSelectedEmployee(null);
      handleInputChange("employeeId", "");
    }
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setSearchQuery(`${employee.name} (${employee.employee_id})`);
    handleInputChange("employeeId", employee.employee_id);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let response;
      if (attendanceData.action === "in") {
        response = await fetch(
          `${BASE_URL_FOR_CLIENT}/api/attendance/clock-in`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              employee_id: attendanceData.employeeId,
              isManual: 1,
              clock_in: `${attendanceData.date} ${attendanceData.time}:00.0`,
              location: attendanceData.location,
              notes: attendanceData.notes,
            }),
          }
        );
      } else {
        response = await fetch(
          `${BASE_URL_FOR_CLIENT}/api/attendance/clock-out`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              employee_id: attendanceData.employeeId,
              isManual: 1,
              clock_out: `${attendanceData.date} ${attendanceData.time}:00.0`,
              location: attendanceData.location,
              notes: attendanceData.notes,
            }),
          }
        );
      }
      const responseData = await response.json();
      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message:
            responseData.msg ||
            `Clock ${attendanceData.action} recorded successfully!`,
        });
        // Reset form
        setAttendanceData({
          date: new Date().toISOString().split("T")[0],
          time: "",
          employeeId: "",
          location: "",
          action: "in",
          notes: "",
        });
        setSelectedEmployee(null);
        setSearchQuery("");
      } else {
        setSubmitStatus({
          type: "error",
          message:
            responseData.msg ||
            "Failed to record attendance. Please try again.",
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  return (
    <DefaultLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <FaUsers className="h-8 w-8 text-blue-600" />
          Manual Attendance
        </h1>
        <p className="text-gray-600">
          Record attendance manually for employees
        </p>
      </div>

      {submitStatus && (
        <Alert
          className={`mb-6 ${
            submitStatus.type === "success"
              ? "border-green-500 bg-green-50"
              : "border-red-500 bg-red-50"
          }`}
        >
          {submitStatus.type === "success" ? (
            <FaCheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <FaExclamationCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription
            className={
              submitStatus.type === "success"
                ? "text-green-800"
                : "text-red-800"
            }
          >
            {submitStatus.message}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaCalendarAlt className="h-5 w-5" />
            Attendance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date and Action Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <FaCalendarAlt className="h-4 w-4" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={attendanceData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action" className="flex items-center gap-2">
                  Type
                </Label>
                <Select
                  value={attendanceData.action}
                  onValueChange={(value) => handleInputChange("action", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Clock In</SelectItem>
                    <SelectItem value="out">Clock Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Employee Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId" className="flex items-center gap-2">
                  <FaUsers className="h-4 w-4" />
                  Employee
                </Label>
                <div className="relative" ref={dropdownRef}>
                  <div className="relative">
                    <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search employee by name or ID..."
                      value={searchQuery}
                      onChange={(e) => handleEmployeeSearch(e.target.value)}
                      onFocus={() => setShowDropdown(true)}
                      className="pr-10"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {isLoadingUsers ? (
                        <FaSpinner className="h-4 w-4 animate-spin text-gray-400" />
                      ) : (
                        <FaSearch className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {isLoadingUsers ? (
                        <div className="p-3 text-center text-gray-500">
                          <FaSpinner className="h-4 w-4 animate-spin mx-auto mb-2" />
                          Loading employees...
                        </div>
                      ) : users.length > 0 ? (
                        users.map((user) => (
                          <div
                            key={user.id}
                            className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                            onClick={() => handleEmployeeSelect(user)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {user.employee_id}
                                </div>
                              </div>
                              <FaChevronDown className="h-3 w-3 text-gray-400 rotate-270" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-gray-500">
                          {searchQuery
                            ? "No employees found"
                            : "Start typing to search employees"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Enter location"
                  value={attendanceData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            {/* Time Section */}
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <FaClock className="h-4 w-4" />
                {attendanceData.action === "in"
                  ? "Clock In Time"
                  : "Clock Out Time"}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="time"
                  type="time"
                  value={attendanceData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleInputChange("time", getCurrentTime())}
                >
                  Now
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Remarks (Optional)</Label>
              <Textarea
                id="notes"
                placeholder={`Add any additional notes about the clock ${attendanceData.action}...`}
                value={attendanceData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !attendanceData.employeeId}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                  Recording{" "}
                  {attendanceData.action === "in" ? "Clock In" : "Clock Out"}...
                </>
              ) : (
                <>
                  <FaSave className="h-4 w-4 mr-2" />
                  Record{" "}
                  {attendanceData.action === "in" ? "Clock In" : "Clock Out"}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </DefaultLayout>
  );
};

export default ManualAttendancePage;
