"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEdit, FaEye, FaTrash, FaSearch, FaClock, FaCalendarAlt } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useConfirmDelete from "@/app/hooks/useConfirmDelete";
import Pagination from "../Pagination";
import Image from "next/image";
import noImg from "@/app/public/images/no-image.png";
import { convertMinutesToHrMin } from "@/app/utils/helpers";
import { DatePickerWithRange } from "./DatePicker";
import { addDays, format, parseISO } from "date-fns";
import { BASE_URL_FOR_CLIENT } from "@/app/utils/constants";

const AttendanceDetails = ({ token, id }) => {
  const router = useRouter();
  const [date, setDate] = useState({
    from: new Date(),
    to: addDays(new Date(), 1),
  });
  const [rawData, setRawData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    start_date: format(new Date(), 'yyyy-MM-dd 00:00:00'),
    end_date: format(addDays(new Date(), 1), 'yyyy-MM-dd 23:59:59'),
    page: 1,
  });

  // Process raw API data into individual attendance records
  const processAttendanceData = (apiData) => {
    const records = [];
    
    if (!apiData || apiData.length === 0) return records;

    apiData.forEach((employee) => {
      const clockInTimes = employee.clock_in || [];
      const clockOutTimes = employee.clock_out || [];
      
      // Create individual records for each clock in/out pair
      for (let i = 0; i < Math.max(clockInTimes.length, clockOutTimes.length); i++) {
        const clockIn = clockInTimes[i];
        const clockOut = clockOutTimes[i];
        
        if (clockIn) {
          const clockInDate = parseISO(clockIn);
          const clockOutDate = clockOut ? parseISO(clockOut) : null;
          
          // Calculate work duration
          let workDuration = 'N/A';
          let isIncomplete = false;
          
          if (clockIn && clockOut) {
            const diffMs = clockOutDate - clockInDate;
            const diffMinutes = Math.floor(diffMs / 60000);
            workDuration = convertMinutesToHrMin(diffMinutes);
          } else if (clockIn && !clockOut) {
            isIncomplete = true;
            workDuration = 'Incomplete';
          }
          
          // Determine status
          let status = 'Present';
          if (isIncomplete) status = 'Incomplete';
          if (employee.late_days > 0 && i < employee.late_days) status = 'Late';
          
          const record = {
            id: `${employee.user_name}-${i}`,
            date: format(clockInDate, 'yyyy-MM-dd'),
            user_name: employee.user_name,
            status: status,
            time_in: format(clockInDate, 'HH:mm:ss'),
            time_out: clockOut ? format(clockOutDate, 'HH:mm:ss') : null,
            work_duration: workDuration,
            is_incomplete: isIncomplete,
            clock_in_full: clockIn,
            clock_out_full: clockOut,
            // Distribute stats across records (approximation)
            late_minutes: i < employee.late_days ? Math.floor(employee.late_minutes / employee.late_days) : 0,
            overtime_minutes: Math.floor(employee.overtime_minutes / employee.present_days),
            employee_summary: employee // Keep reference to full employee data
          };
          
          records.push(record);
        }
      }
    });

    return records.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const fetchAttendanceDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL_FOR_CLIENT}/api/attendance/report?start_date=${filters.start_date}&end_date=${filters.end_date}&user_id=${id}&format=json`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Failed to fetch attendance details");
        setRawData([]);
        setProcessedData([]);
        return;
      }
      
      if (json.data && json.data.length === 0) {
        toast.error("No attendance records found for the selected date range");
      }
      
      setRawData(json.data || []);
      const processed = processAttendanceData(json.data || []);
      setProcessedData(processed);
    } catch (error) {
      toast.error("Failed to fetch attendance details");
      setRawData([]);
      setProcessedData([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply search filter to data
  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(processedData);
    } else {
      const lower = searchTerm.toLowerCase();
      const result = processedData.filter(
        (record) =>
          record.user_name?.toLowerCase().includes(lower) ||
          record.date?.toLowerCase().includes(lower) ||
          record.status?.toLowerCase().includes(lower)
      );
      setFilteredData(result);
    }
  }, [searchTerm, processedData]);

  // Fetch data when filters change
  useEffect(() => {
    fetchAttendanceDetails();
  }, [filters]);

  // Handle date range change and update filters
  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  // Apply date filter - convert date picker selection to API format
  const applyDateFilter = () => {
    if (date?.from) {
      const newFilters = {
        ...filters,
        start_date: format(date.from, 'yyyy-MM-dd 00:00:00'),
        end_date: date.to 
          ? format(date.to, 'yyyy-MM-dd 23:59:59')
          : format(date.from, 'yyyy-MM-dd 23:59:59'),
        page: 1,
      };
      setFilters(newFilters);
    }
  };

  // Reset filters
  const resetFilters = () => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    setDate({
      from: today,
      to: tomorrow,
    });
    
    setSearchTerm("");
    
    setFilters({
      start_date: format(today, 'yyyy-MM-dd 00:00:00'),
      end_date: format(tomorrow, 'yyyy-MM-dd 23:59:59'),
      page: 1,
    });
  };

  const hasActiveFilters = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    
    return (
      searchTerm ||
      !filters.start_date.startsWith(today) ||
      !filters.end_date.startsWith(tomorrow)
    );
  };

  // Status badge component
  const StatusBadge = ({ status, isIncomplete }) => {
    const getStatusColor = (status, isIncomplete) => {
      if (isIncomplete) {
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      }
      
      switch (status?.toLowerCase()) {
        case 'present':
          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'absent':
          return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 'late':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'incomplete':
          return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      }
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status, isIncomplete)}`}>
        {isIncomplete ? 'Incomplete' : status || 'Unknown'}
      </span>
    );
  };

  // Format time display
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      return format(new Date(`2000-01-01 ${timeString}`), 'hh:mm a');
    } catch {
      return timeString;
    }
  };

  // Get employee summary data
  const getEmployeeSummary = () => {
    if (rawData.length === 0) return null;
    return rawData[0]; // Assuming single employee view
  };

  const employeeSummary = getEmployeeSummary();

  return (
    <div className="border border-stroke bg-white px-6 pt-6 pb-4 rounded-lg shadow-md dark:border-strokedark dark:bg-boxdark">
      {/* Header with Employee Info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaClock className="text-blue-500 text-xl" />
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Attendance Details
            </h2>
            {employeeSummary && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {employeeSummary.user_name} - {employeeSummary.present_percent}% Attendance
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Employee Summary Cards */}
      {employeeSummary && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Working Days</div>
            <div className="text-xl font-bold text-blue-800 dark:text-blue-200">
              {employeeSummary.working_days}
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Present Days</div>
            <div className="text-xl font-bold text-green-800 dark:text-green-200">
              {employeeSummary.present_days}
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">Absent Days</div>
            <div className="text-xl font-bold text-red-800 dark:text-red-200">
              {employeeSummary.absent_days}
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="text-xs font-medium text-yellow-700 dark:text-yellow-300 mb-1">Late Days</div>
            <div className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
              {employeeSummary.late_days}
            </div>
          </div>
          
          {/* <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Total Overtime</div>
            <div className="text-xl font-bold text-purple-800 dark:text-purple-200">
              {convertMinutesToHrMin(employeeSummary.overtime_minutes)}
            </div>
          </div> */}
        </div>
      )}

      <div className="space-y-4 mb-6">
        {/* Date Picker Row */}
        <div className="flex items-center gap-4 flex-wrap">
          <DatePickerWithRange 
            className="w-[300px]" 
            date={date} 
            setDate={handleDateChange} 
          />
          <Button 
            onClick={applyDateFilter}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <FaSearch className="w-4 h-4" />
            {loading ? "Loading..." : "Apply"}
          </Button>
          {hasActiveFilters() && (
            <Button 
              variant="outline"
              onClick={resetFilters}
              disabled={loading}
            >
              Reset Filters
            </Button>
          )}
        </div>

        {/* Search Row */}
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Search by date or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-72"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 flex-wrap">
            {searchTerm && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                Search: "{searchTerm}"
              </span>
            )}
            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
              <FaCalendarAlt className="inline mr-1" />
              {format(new Date(filters.start_date), 'MMM dd, yyyy')} - {format(new Date(filters.end_date), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {searchTerm ? (
          <>Showing {filteredData.length} of {processedData.length} attendance records</>
        ) : (
          <>Showing {processedData.length} attendance records</>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading attendance details...</span>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-meta-4 text-left text-sm font-semibold uppercase">
                <th className="p-3">Date</th>
                <th className="p-3">Day</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">In Time</th>
                <th className="p-3 text-center">Out Time</th>
                <th className="p-3 text-center">Work Duration</th>
                {/* <th className="p-3 text-center">Late Time</th>
                <th className="p-3 text-center">Overtime</th> */}
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((record, index) => (
                  <tr
                    key={record.id || index}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="p-3">
                      <span className="font-medium">
                        {format(new Date(record.date), 'MMM dd, yyyy')}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(record.date), 'EEEE')}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge status={record.status} isIncomplete={record.is_incomplete} />
                    </td>
                    <td className="p-3 text-center">
                      <span className={`font-medium ${record.time_in ? 'text-green-600' : 'text-gray-400'}`}>
                        {formatTime(record.time_in)}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`font-medium ${record.time_out ? 'text-blue-600' : 'text-gray-400'}`}>
                        {record.time_out ? formatTime(record.time_out) : 'Not clocked out'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`font-medium ${record.is_incomplete ? 'text-purple-600' : 'text-gray-700 dark:text-gray-300'}`}>
                        {record.work_duration}
                      </span>
                    </td>
                    {/* <td className="p-3 text-center">
                      <span className={`${record.late_minutes > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {convertMinutesToHrMin(record.late_minutes || 0)}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`${record.overtime_minutes > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                        {convertMinutesToHrMin(record.overtime_minutes || 0)}
                      </span>
                    </td> */}
                  
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <FaClock className="text-4xl text-gray-300" />
                      <span className="text-lg font-medium">
                        {searchTerm 
                          ? "No attendance records found matching your search criteria" 
                          : "No attendance records available for the selected date range"
                        }
                      </span>
                      <span className="text-sm">
                        Try adjusting your search terms or date range
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Daily Summary Cards */}
      {!loading && filteredData.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Complete Days</span>
            </div>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200 mt-1">
              {filteredData.filter(r => r.time_in && r.time_out).length}
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Incomplete Days</span>
            </div>
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-200 mt-1">
              {filteredData.filter(r => r.is_incomplete).length}
            </div>
          </div>
          
          {/* <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Late Arrivals</span>
            </div>
            <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mt-1">
              {filteredData.filter(r => r.late_minutes > 0).length}
            </div>
          </div> */}
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Records</span>
            </div>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200 mt-1">
              {filteredData.length}
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && processedData.length > 0 && (
        <Pagination 
          data={{ data: filteredData }} 
          onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
        />
      )}
    </div>
  );
};

export default AttendanceDetails;