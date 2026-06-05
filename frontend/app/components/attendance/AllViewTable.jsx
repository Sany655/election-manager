"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaEdit,
  FaEye,
  FaTrash,
  FaSearch,
  FaCalendarAlt,
  FaUsers,
  FaChartBar,
  FaDownload,
  FaFilter,
  FaTimes,
  FaClock,
  FaUserCheck,
  FaUserTimes,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaLayerGroup,
  FaBuilding,
  FaBriefcase,
  FaSpinner,
  FaSortAmountUp,
} from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useConfirmDelete from "@/app/hooks/useConfirmDelete";
import Pagination from "../Pagination";
import Image from "next/image";
import noImg from "@/app/public/images/no-image.png";
import { convertMinutesToHrMin } from "@/app/utils/helpers";
import { DatePicker, DatePickerWithRange } from "./DatePicker";
import { addDays, format } from "date-fns";
import { BASE_URL_FOR_CLIENT } from "@/app/utils/constants";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

const ViewTable = ({ renderFrom = "", token, locations = [], users = [] }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [date, setDate] = useState(() => {
    if (renderFrom === "daily") {
      // For daily reports, use single date
      return new Date();
    } else {
      // For custom reports, use date range
      return {
        from: new Date(),
        to: new Date(),
      };
    }
  });
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [summaryStats, setSummaryStats] = useState(null);

  // Dynamic filter states
  const [areas, setAreas] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [rffs, setRffs] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingTerritories, setLoadingTerritories] = useState(false);
  const [loadingRffs, setLoadingRffs] = useState(false);
  const [loadingDesignations, setLoadingDesignations] = useState(false);

  const [filters, setFilters] = useState({
    start_date: format(new Date(), "yyyy-MM-dd 00:00:00"),
    end_date: format(new Date(), "yyyy-MM-dd 23:59:59"),
    user_id: searchParams.get("user_id") || "",
    designation_id: searchParams.get("designation_id") || "",
    location_id: searchParams.get("location_id") || "",
    area_id: searchParams.get("area_id") || "",
    territory_id: searchParams.get("territory_id") || "",
    rff_id: searchParams.get("rff_id") || "",
    page: 1,
    status: "",
  });

  // Fetch areas based on selected location
  const fetchAreas = async (locationId) => {
    if (!locationId) {
      setAreas([]);
      return;
    }

    setLoadingAreas(true);
    try {
      const response = await fetch(
        `${BASE_URL_FOR_CLIENT}/api/areas?location_id=${locationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setAreas(result.data || []);
      } else {
        console.error("Failed to fetch areas");
        setAreas([]);
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
      setAreas([]);
    } finally {
      setLoadingAreas(false);
    }
  };

  // Fetch areas based on selected location
  const fetchTerritories = async (areaId) => {
    if (!areaId) {
      setTerritories([]);
      return;
    }

    setLoadingTerritories(true);
    try {
      const response = await fetch(
        `${BASE_URL_FOR_CLIENT}/api/territories?area_id=${areaId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setTerritories(result.data || []);
      } else {
        console.error("Failed to fetch territories");
        setTerritories([]);
      }
    } catch (error) {
      console.error("Error fetching territories:", error);
      setTerritories([]);
    } finally {
      setLoadingTerritories(false);
    }
  };

  // Fetch areas based on selected location
  const fetchRffs = async (tId='') => {
    // if (!tId) {
    //   setRffs([]);
    //   return;
    // }

    setLoadingRffs(true);
    try {
      const response = await fetch(
        `${BASE_URL_FOR_CLIENT}/api/rff-points?territory_id=${tId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setRffs(result.data || []);
      } else {
        console.error("Failed to fetch rff");
        setRffs([]);
      }
    } catch (error) {
      console.error("Error fetching rff:", error);
      setRffs([]);
    } finally {
      setLoadingRffs(false);
    }
  };

  // Fetch designations
  const fetchDesignations = async () => {
    setLoadingDesignations(true);
    try {
      const response = await fetch(`${BASE_URL_FOR_CLIENT}/api/designations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setDesignations(result.data || []);
      } else {
        console.error("Failed to fetch designations");
        setDesignations([]);
      }
    } catch (error) {
      console.error("Error fetching designations:", error);
      setDesignations([]);
    } finally {
      setLoadingDesignations(false);
    }
  };

  // Load designations on component mount
  useEffect(() => {
    fetchDesignations();
  }, []);

  // Load areas when location changes
  useEffect(() => {
    fetchAreas(filters.location_id);
  }, [filters.location_id]);

  // Load territories when area changes
  useEffect(() => {
    fetchTerritories(filters.area_id);
  }, [filters.area_id]);

  // Load rffs when territory changes
  useEffect(() => {
    fetchRffs(filters.territory_id);
  }, [filters.territory_id]);

  const fetchReport = async (exportFormat = "json") => {
    setLoading(true);
    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        start_date: filters.start_date,
        end_date: filters.end_date,
        format: exportFormat,
        page: filters.page.toString(),
      });

      // Add optional filters
      if (filters.location_id)
        queryParams.append("location_id", filters.location_id);
      if (filters.area_id) queryParams.append("area_id", filters.area_id);
      if (filters.territory_id)
        queryParams.append("territory_id", filters.territory_id);
      if (filters.rff_id) queryParams.append("rff_point_id", filters.rff_id);
      if (filters.user_id) queryParams.append("user_id", filters.user_id);
      if (filters.designation_id)
        queryParams.append("designation_id", filters.designation_id);
      if (filters.status) queryParams.append("status", filters.status);

      const res = await fetch(
        `${BASE_URL_FOR_CLIENT}/api/attendance/report?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        setData([]);
        setSummaryStats(null);
        return;
      }

      if (exportFormat === "json") {
        const json = await res.json();

        if (json.data && json.data.length === 0) {
          toast.info("No data found for the selected criteria");
        }

        setData(json.data || []);
        setSummaryStats(json.summary || null);
      } else {
        // For Excel or PDF file download
        const blob = await res.blob();
        const contentDisposition = res.headers.get("Content-Disposition");
        const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
        const filename = filenameMatch
          ? filenameMatch[1]
          : `attendance_report.${exportFormat}`;

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success(`Report exported as ${exportFormat.toUpperCase()}`);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setData([]);
      setSummaryStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Apply search filter to data
  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data);
    } else {
      const lower = searchTerm.toLowerCase();
      const result = data.filter(
        (user) =>
          user.user_name?.toLowerCase().includes(lower) ||
          user.location_name?.toLowerCase().includes(lower) ||
          user.area_name?.toLowerCase().includes(lower) ||
          user.name?.toLowerCase().includes(lower)
      );
      setFilteredData(result);
    }
  }, [searchTerm, data]);

  // Fetch data when filters change
  useEffect(() => {
    fetchReport();
  }, [filters]);

  // Handle date range change and update filters
  const handleDateChange = (newDate) => {
    setDate(newDate);

    // Auto-apply filters for daily reports when date changes
    if (renderFrom === "daily" && newDate) {
      const newFilters = {
        ...filters,
        start_date: format(newDate, "yyyy-MM-dd 00:00:00"),
        end_date: format(newDate, "yyyy-MM-dd 23:59:59"),
        page: 1,
      };
      setFilters(newFilters);
    }
  };
  // Apply date filter
  const applyDateFilter = () => {
    if (renderFrom === "daily") {
      // For daily reports, date is a single Date object
      if (date) {
        const newFilters = {
          ...filters,
          start_date: format(date, "yyyy-MM-dd 00:00:00"),
          end_date: format(date, "yyyy-MM-dd 23:59:59"),
          page: 1,
        };
        setFilters(newFilters);
      }
    } else {
      // For custom reports, date is a range object
      if (date?.from) {
        const newFilters = {
          ...filters,
          start_date: format(date.from, "yyyy-MM-dd 00:00:00"),
          end_date: date.to
            ? format(date.to, "yyyy-MM-dd 23:59:59")
            : format(date.from, "yyyy-MM-dd 23:59:59"),
          page: 1,
        };
        setFilters(newFilters);
      }
    }
  };

  // Handle location filter change
  const handleLocationChange = (locationId) => {
    setFilters((prev) => ({
      ...prev,
      location_id: locationId,
      area_id: "", // Reset area when location changes
      page: 1,
    }));
  };

  // Handle area filter change
  const handleAreaChange = (areaId) => {
    setFilters((prev) => ({
      ...prev,
      area_id: areaId,
      page: 1,
    }));
  };

  // Handle territory filter change
  const handleTerritoryChange = (territoryId) => {
    setFilters((prev) => ({
      ...prev,
      territory_id: territoryId,
      page: 1,
    }));
  };

  // Handle rff filter change
  const handleRffChange = (rffId) => {
    setFilters((prev) => ({
      ...prev,
      rff_id: rffId,
      page: 1,
    }));
  };

  // Handle designation filter change
  const handleDesignationChange = (designationId) => {
    setFilters((prev) => ({
      ...prev,
      designation_id: designationId,
      page: 1,
    }));
  };

  // Handle designation filter change
  const handleStatusChange = (status) => {
    setFilters((prev) => ({
      ...prev,
      status: status,
      page: 1,
    }));
  };

  // Reset filters
  const resetFilters = () => {
    const today = new Date();
    const tomorrow = addDays(today, 1);

    // Reset date based on renderFrom
    if (renderFrom === "daily") {
      setDate(today);
    } else {
      setDate({
        from: today,
        to: tomorrow,
      });
    }

    setSearchTerm("");

    setFilters({
      start_date: format(today, "yyyy-MM-dd 00:00:00"),
      end_date:
        renderFrom === "daily"
          ? format(today, "yyyy-MM-dd 23:59:59")
          : format(tomorrow, "yyyy-MM-dd 23:59:59"),
      location_id: "",
      area_id: "",
      territory_id: "",
      user_id: "",
      designation_id: "",
      rff_id: "",
      page: 1,
      status: "",
    });
  };

  const hasActiveFilters = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

    let dateFilterActive = false;

    if (renderFrom === "daily") {
      // For daily reports, check if date is not today
      dateFilterActive =
        !filters.start_date.startsWith(today) ||
        !filters.end_date.startsWith(today);
    } else {
      // For custom reports, check if not today-tomorrow range
      dateFilterActive =
        !filters.start_date.startsWith(today) ||
        !filters.end_date.startsWith(tomorrow);
    }

    return (
      searchTerm ||
      filters.location_id ||
      filters.area_id ||
      filters.territory_id ||
      filters.rff_id ||
      filters.user_id ||
      filters.designation_id ||
      filters.status ||
      dateFilterActive
    );
  };
  // Calculate summary statistics from filtered data
  const calculateStats = () => {
    // Filter employees who have fingerprints
    const fingerprintEmployees = filteredData.filter(
      (emp) => emp.hasFingerprint
    );

    const totalEmployees = fingerprintEmployees.length;
    const avgAttendance =
      totalEmployees > 0
        ? (
            fingerprintEmployees.reduce(
              (sum, emp) => sum + parseFloat(emp.present_percent || 0),
              0
            ) / totalEmployees
          ).toFixed(1)
        : 0;
    const lowAttendance = fingerprintEmployees.filter(
      (emp) => parseFloat(emp.present_percent || 0) < 80
    ).length;
    const perfectAttendance = fingerprintEmployees.filter(
      (emp) => parseFloat(emp.present_percent || 0) === 100
    ).length;

    return { totalEmployees, avgAttendance, lowAttendance, perfectAttendance };
  };

  const stats = calculateStats();

  // Get attendance badge
  const getAttendanceBadge = (percentage) => {
    const percent = parseFloat(percentage || 0);
    if (percent >= 95)
      return { text: "Excellent", color: "bg-green-100 text-green-800" };
    if (percent >= 80)
      return { text: "Good", color: "bg-blue-100 text-blue-800" };
    if (percent >= 60)
      return { text: "Average", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Poor", color: "bg-red-100 text-red-800" };
  };

  // Generate array of dates between start and end date
  const generateDateRange = (startDate, endDate) => {
    const dates = [];
    const currentDate = dayjs(startDate);
    const endDateObj = dayjs(endDate);

    let tempDate = currentDate;
    while (tempDate.isSameOrBefore(endDateObj, "day")) {
      dates.push(tempDate.format("YYYY-MM-DD"));
      tempDate = tempDate.add(1, "day");
    }

    return dates;
  };

  // Get date range from options
  const dateRange = generateDateRange(filters?.start_date, filters?.end_date);
  let finalData = [];
  filteredData?.forEach((user) => {
    const baseRowData = {
      employee_id: user?.employee_id || "N/A",
      user_name: user.user_name || "N/A",
      location_name: user.location_name || "N/A",
      area_name: user.area_name || "N/A",
      rff_name: user.rff_name || "N/A",
      designation_name: user.designation_name || "N/A",
      fingerprint: user.hasFingerprint ? "Yes" : "No",
    };

    // Handle clock in/out times - ensure they exist and are arrays
    const clockInTimes = Array.isArray(user.clock_in) ? user.clock_in : [];
    const clockOutTimes = Array.isArray(user.clock_out) ? user.clock_out : [];
    const isManuals = Array.isArray(user.isManual) ? user.isManual : [];
    const clockInLocations = Array.isArray(user.attendance_in_location)
      ? user.attendance_in_location
      : [];
    const clockOutLocations = Array.isArray(user.attendance_out_location)
      ? user.attendance_out_location
      : [];
    const inRemarks = Array.isArray(user.in_remarks) ? user.in_remarks : [];
    const outRemarks = Array.isArray(user.out_remarks) ? user.out_remarks : [];

    // Create a map for quick lookup of attendance data by date
    const attendanceByDate = {};

    // Map clock in times by date
    clockInTimes.forEach((clockIn, index) => {
      if (clockIn) {
        const date = dayjs(clockIn).format("YYYY-MM-DD");
        if (!attendanceByDate[date]) {
          attendanceByDate[date] = {};
        }
        attendanceByDate[date].clock_in = clockIn;
      }

      //for manuals
      if (isManuals[index]) {
        const date = dayjs(clockIn).format("YYYY-MM-DD");
        if (!attendanceByDate[date]) {
          attendanceByDate[date] = {};
        }
        attendanceByDate[date].isManual = true;
        attendanceByDate[date].attendance_in_location = clockInLocations[index];
        attendanceByDate[date].attendance_out_location =
          clockOutLocations[index];
        attendanceByDate[date].in_remarks = inRemarks[index];
        attendanceByDate[date].out_remarks = outRemarks[index];
      }
    });

    // Map clock out times by date
    clockOutTimes.forEach((clockOut, index) => {
      if (clockOut) {
        const date = dayjs(clockOut).format("YYYY-MM-DD");
        if (!attendanceByDate[date]) {
          attendanceByDate[date] = {};
        }
        attendanceByDate[date].clock_out = clockOut;
      }
    });

    // Create a row for each date in the range
    dateRange.forEach((date) => {
      const attendance = attendanceByDate[date] || {};

      const rowData = {
        ...baseRowData,
        date_range: dayjs(date).format("DD-MM-YYYY"),
        present_days: attendance.clock_in ? "Present" : "Absent",
        clock_in: attendance.clock_in
          ? dayjs(attendance.clock_in).format("HH:mm:ss")
          : "N/A",
        clock_out: attendance.clock_out
          ? dayjs(attendance.clock_out).format("HH:mm:ss")
          : "N/A",
        isManual: attendance.isManual ? "Yes" : "No",
        attendance_in_location: attendance.attendance_in_location || "N/A",
        attendance_out_location: attendance.attendance_out_location || "N/A",
        in_remarks: attendance.in_remarks || "N/A",
        out_remarks: attendance.out_remarks || "N/A",
      };

      // Ensure all required fields have values
      Object.keys(rowData).forEach((key) => {
        if (rowData[key] === undefined || rowData[key] === null) {
          rowData[key] = "N/A";
        }
      });

      //   const excelRow = worksheet.addRow(rowData);
      finalData.push(rowData);
    });
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 capitalize">
              <FaChartBar className="text-blue-600" />
              {renderFrom} Attendance Report
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor team attendance and performance metrics across locations
              and designations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => fetchReport("excel")}
              disabled={loading}
            >
              <FaDownload className="w-4 h-4" />
              Export Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-medium opacity-80">
                Total Attendances
              </p>
              <p className="text-3xl font-bold text-blue-800 mt-2">
                {stats.totalEmployees}
              </p>
              {summaryStats && (
                <p className="text-xs text-blue-600 opacity-70 mt-1">
                  {summaryStats.locations?.length || 0} regions
                </p>
              )}
            </div>
            <FaUsers className="text-blue-600 w-8 h-8" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-medium opacity-80">
                Average Attendance
              </p>
              <p className="text-3xl font-bold text-green-800 mt-2">
                {stats.avgAttendance}%
              </p>
              {/* {summaryStats && (
                <p className="text-xs text-green-600 opacity-70 mt-1">
                  Overall: {summaryStats.overall?.average_attendance || 0}%
                </p>
              )} */}
            </div>
            <FaUserCheck className="text-green-600 w-8 h-8" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 text-sm font-medium opacity-80">
                Perfect Attendance
              </p>
              <p className="text-3xl font-bold text-purple-800 mt-2">
                {stats.perfectAttendance}
              </p>
            </div>
            <FaClock className="text-purple-600 w-8 h-8" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 text-sm font-medium opacity-80">
                Low Attendance
              </p>
              <p className="text-3xl font-bold text-red-800 mt-2">
                {stats.lowAttendance}
              </p>
              <p className="text-xs text-red-600 opacity-70">Below 80%</p>
            </div>
            <FaExclamationTriangle className="text-red-600 w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <FaFilter className="text-blue-600 dark:text-blue-400 w-5 h-5" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filters
          </h3>
        </div>

        <div className="space-y-6">
          {/* Date Picker and Filters Grid */}
          <div className="space-y-4">
            {/* First Row: Date Picker */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {renderFrom === "daily" ? (
                <div className="lg:col-span-2 xl:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-blue-500 w-4 h-4 flex-shrink-0" />
                    <div className="w-full min-w-0">
                      <DatePicker
                        className="w-full"
                        date={date}
                        setDate={handleDateChange}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="lg:col-span-2 xl:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Range
                  </label>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-blue-500 w-4 h-4 flex-shrink-0" />
                    <div className="w-full min-w-0">
                      <DatePickerWithRange
                        className="w-full"
                        date={date}
                        setDate={handleDateChange}
                      />
                    </div>
                  </div>
                </div>
              )}
              {/*               
                <div className="lg:col-span-2 xl:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Range
                  </label>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-blue-500 w-4 h-4 flex-shrink-0" />
                    <div className="w-full min-w-0">
                      <DatePickerWithRange
                        className="w-full"
                        date={date}
                        setDate={handleDateChange}
                      />
                    </div>
                  </div>
                </div> */}

              {/* Designation Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Designation
                </label>
                <div className="flex items-center gap-2">
                  <FaBriefcase className="text-orange-500 w-4 h-4 flex-shrink-0" />
                  <div className="relative w-full">
                    <select
                      value={filters.designation_id}
                      onChange={(e) => handleDesignationChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loadingDesignations}
                    >
                      <option value="">All Designations</option>
                      {designations.map((designation) => (
                        <option
                          key={designation.id || designation.name}
                          value={designation.id || designation.name}
                        >
                          {designation.name}
                        </option>
                      ))}
                    </select>
                    {loadingDesignations && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <FaSpinner className="w-4 h-4 animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Filter */}
              {renderFrom === "daily" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <div className="flex items-center gap-2">
                    <FaSortAmountUp className="text-orange-500 w-4 h-4 flex-shrink-0" />
                    <div className="relative w-full">
                      <select
                        value={filters.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select One</option>
                        <option value="">All</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Second Row: Location Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Location/Region Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Region
                </label>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-green-500 w-4 h-4 flex-shrink-0" />
                  <select
                    value={filters.location_id}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Regions</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.location_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Area Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Area
                </label>
                <div className="flex items-center gap-2">
                  <FaLayerGroup className="text-purple-500 w-4 h-4 flex-shrink-0" />
                  <div className="relative w-full">
                    <select
                      value={filters.area_id}
                      onChange={(e) => handleAreaChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!filters.location_id || loadingAreas}
                    >
                      <option value="">All Areas</option>
                      {areas.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.area_name}
                        </option>
                      ))}
                    </select>
                    {loadingAreas && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <FaSpinner className="w-4 h-4 animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Territory Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Territory
                </label>
                <div className="flex items-center gap-2">
                  <FaBuilding className="text-indigo-500 w-4 h-4 flex-shrink-0" />
                  <div className="relative w-full">
                    <select
                      value={filters.territory_id}
                      onChange={(e) => handleTerritoryChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!filters.area_id || loadingTerritories}
                    >
                      <option value="">All Territories</option>
                      {territories.map((territory) => (
                        <option key={territory.id} value={territory.id}>
                          {territory.name}
                        </option>
                      ))}
                    </select>
                    {loadingTerritories && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <FaSpinner className="w-4 h-4 animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rff Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rff Point
                </label>
                <div className="flex items-center gap-2">
                  <FaBuilding className="text-indigo-500 w-4 h-4 flex-shrink-0" />
                  <div className="relative w-full">
                    <select
                      value={filters.rff_id}
                      onChange={(e) => handleRffChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      // disabled={!filters.territory_id || loadingTerritories}
                    >
                      <option value="">All Rff Points</option>
                      {rffs.map((rf) => (
                        <option key={rf.id} value={rf.id}>
                          {rf.name}
                        </option>
                      ))}
                    </select>
                    {loadingRffs && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <FaSpinner className="w-4 h-4 animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Third Row: Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                onClick={applyDateFilter}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
              >
                {loading ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <FaSearch className="w-4 h-4" />
                    Apply Filters
                  </>
                )}
              </Button>

              {hasActiveFilters() && (
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaTimes className="w-4 h-4" />
                  Reset All
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters() && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-blue-100 dark:border-gray-600">
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <span className="text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-2">
                  <FaUsers className="w-4 h-4 text-blue-600" />
                  Active filters:
                </span>

                {/* Search Term Filter */}
                {searchTerm && (
                  <span className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1.5 rounded-full text-xs font-medium">
                    <FaSearch className="w-3 h-3" />
                    Search: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm("")}
                      className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-1 transition-colors duration-200"
                      aria-label="Remove search filter"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Location Filter */}
                {filters.location_id && (
                  <span className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1.5 rounded-full text-xs font-medium">
                    <FaMapMarkerAlt className="w-3 h-3" />
                    {locations.find(
                      (l) => l.id.toString() === filters.location_id
                    )?.location_name || "Region"}
                    <button
                      onClick={() => handleLocationChange("")}
                      className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-1 transition-colors duration-200"
                      aria-label="Remove location filter"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Area Filter */}
                {filters.area_id && (
                  <span className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1.5 rounded-full text-xs font-medium">
                    <FaLayerGroup className="w-3 h-3" />
                    {areas.find((a) => a.id.toString() === filters.area_id)
                      ?.area_name || "Area"}
                    <button
                      onClick={() => handleAreaChange("")}
                      className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-1 transition-colors duration-200"
                      aria-label="Remove area filter"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Territory Filter */}
                {filters.territory_id && (
                  <span className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1.5 rounded-full text-xs font-medium">
                    <FaBuilding className="w-3 h-3" />
                    {territories.find(
                      (t) => t.id.toString() === filters.territory_id
                    )?.name || "Territory"}
                    <button
                      onClick={() => handleTerritoryChange("")}
                      className="hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-1 transition-colors duration-200"
                      aria-label="Remove territory filter"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Rff Filter */}
                {filters.rff_id && (
                  <span className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1.5 rounded-full text-xs font-medium">
                    <FaBuilding className="w-3 h-3" />
                    {rffs.find((t) => t.id.toString() === filters.rff_id)
                      ?.name || "Rff Point"}
                    <button
                      onClick={() => handleRffChange("")}
                      className="hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-1 transition-colors duration-200"
                      aria-label="Remove rff filter"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Designation Filter */}
                {filters.designation_id && (
                  <span className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-3 py-1.5 rounded-full text-xs font-medium">
                    <FaBriefcase className="w-3 h-3" />
                    {designations.find(
                      (d) => d.id.toString() === filters.designation_id
                    )?.name || "Designation"}
                    <button
                      onClick={() => handleDesignationChange("")}
                      className="hover:bg-orange-200 dark:hover:bg-orange-800 rounded-full p-1 transition-colors duration-200"
                      aria-label="Remove designation filter"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Date Range Filter */}
                <span className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-full text-xs font-medium">
                  <FaCalendarAlt className="w-3 h-3" />
                  {renderFrom === "daily"
                    ? format(new Date(filters.start_date), "MMM dd, yyyy")
                    : `${format(
                        new Date(filters.start_date),
                        "MMM dd"
                      )} - ${format(
                        new Date(filters.end_date),
                        "MMM dd, yyyy"
                      )}`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Employee Attendance Summary
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {searchTerm ? (
                  <>
                    Showing {filteredData.length} of {data.length} employees
                  </>
                ) : (
                  <>Showing {data.length} employees</>
                )}
                {(filters.location_id ||
                  filters.area_id ||
                  filters.territory_id ||
                  filters.rff_id ||
                  filters.designation_id) && (
                  <span className="ml-2 text-blue-600">
                    (filtered by{" "}
                    {[
                      filters.location_id && "location",
                      filters.area_id && "area",
                      filters.territory_id && "territory",
                      filters.rff_id && "rff",
                      filters.designation_id && "designation",
                    ]
                      .filter(Boolean)
                      .join(", ")}
                    )
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto block max-h-screen">
          {loading ? (
            <div className="flex flex-col justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Loading attendance data...
              </span>
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0">
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-2 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Area & RFF
                  </th>

                  <th className="px-2 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Present
                  </th>

                  <th className="px-2 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    In Time
                  </th>
                  <th className="px-2 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Out Time
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Is Manual
                  </th>

                  <th className="px-2 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    In Location
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Out Location
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    In Remarks
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Out Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {finalData.length > 0 ? (
                  finalData.map((att, index) => {
                    const attendanceBadge = getAttendanceBadge(
                      att.present_percent
                    );
                    return (
                      <tr
                        key={att.user_id || index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-2 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <FaBriefcase className="w-3 h-3 text-indigo-600" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {att.date_range || "Not Specified"}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-4 ">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {att.user_name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {att.user_name || "Not Provided"}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {att.employee_id || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <FaBriefcase className="w-3 h-3 text-indigo-600" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {att.designation_name || "Not Specified"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-sm">

                            <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                              <FaMapMarkerAlt className="w-3 h-3 text-purple-600" />
                              {att.area_name || "Unknown Area"}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                              <FaLayerGroup className="w-3 h-3 text-purple-600" />
                              {att.rff_name || "Unknown Rff"}
                            </div>
                          </div>
                        </td>

                        <td className="px-2 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className={`text-sm font-medium ${att?.present_days?.toLowerCase() === 'present' ? "text-green-600" : "text-red-600"}`}>
                              {att?.present_days ? att?.present_days : "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-medium text-green-600">
                              {att?.clock_in ? att?.clock_in : "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-4 text-center">
                          <span className="text-sm font-medium text-red-400">
                            {att?.clock_out ? att?.clock_out : "N/A"}
                          </span>
                        </td>
                        <td className="px-2 py-4 text-center text-red-900">
                          <span className="text-sm font-medium ">
                            {att?.isManual ? att?.isManual : "N/A"}
                          </span>
                        </td>
                        <td className="px-2 py-4 text-center">
                          <span className="text-sm font-medium ">
                            {att?.attendance_in_location
                              ? att?.attendance_in_location
                              : "N/A"}
                          </span>
                        </td>
                        <td className="px-2 py-4 text-center">
                          <span className="text-sm font-medium ">
                            {att?.attendance_out_location
                              ? att?.attendance_out_location
                              : "N/A"}
                          </span>
                        </td>

                        <td className="px-2 py-4 text-center">
                          <span className="text-sm font-medium ">
                            {att?.in_remarks ? att?.in_remarks : "N/A"}
                          </span>
                        </td>

                        <td className="px-2 py-4 text-center">
                          <span className="text-sm font-medium ">
                            {att?.out_remarks ? att?.out_remarks : "N/A"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="11" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FaUserTimes className="w-16 h-16 text-gray-300" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            No attendance data found
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {searchTerm
                              ? "No employees match your search criteria"
                              : filters.location_id ||
                                filters.area_id ||
                                filters.territory_id ||
                                filters.rff_id ||
                                filters.designation_id
                              ? "No attendance data available for the selected filters and date range"
                              : "No attendance data available for the selected date range"}
                          </p>
                        </div>
                        {hasActiveFilters() && (
                          <Button
                            variant="outline"
                            onClick={resetFilters}
                            className="mt-2"
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Table Footer */}
        {/* {!loading && data.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredData.length > 0 && (
                  <>
                    Showing {(filters.page - 1) * 10 + 1} to{" "}
                    {Math.min(filters.page * 10, filteredData.length)} of{" "}
                    {filteredData.length} results
                    {filters.location_id ||
                    filters.area_id ||
                    filters.territory_id ||
                    filters.rff_id ||
                    filters.designation_id ? (
                      <span className="ml-2 text-blue-600">
                        (filtered results)
                      </span>
                    ) : null}
                  </>
                )}
              </div>
              <Pagination
                data={{ data: filteredData }}
                onPageChange={(page) =>
                  setFilters((prev) => ({ ...prev, page }))
                }
              />
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default ViewTable;
