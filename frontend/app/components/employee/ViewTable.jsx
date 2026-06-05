"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  FaEdit,
  FaEye,
  FaTrash,
  FaUser,
  FaSearch,
  FaDownload,
  FaFilter,
  FaTimes,
} from "react-icons/fa";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import useConfirmDelete from "@/app/hooks/useConfirmDelete";
import Pagination from "../Pagination";
import Image from "next/image";
import noImg from "@/app/public/images/no-image.png";
import EmployeeAddModal from "./EmployeeAddModal";
import EmployeeEditModal from "./EmployeeEditModal";
// import { BASE_URL_FOR_CLIENT } from "@/app/utils/constants";


const ViewTable = ({ token, roles, policies, locations, designations, renderFrom, title }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [areas, setAreas] = useState([]);
  const [teams, setTeams] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Filter states
  const [filters, setFilters] = useState({
    fingerprint: "all", // "all", "1", "0"
    status: "all", // "all", "1", "0"
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchUsers = useCallback(
    async (searchQuery = "", exportFormat = "json", currentFilters = filters) => {
      let roleParam = '';
      if (renderFrom === 'volunteer') {
        roleParam = '&role=volunteer';
      } else {
        // If not explicitly rendering for volunteer, exclude volunteer
        roleParam = '&exclude_role=volunteer';
      }

      let url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/users?page=${page}&per_page=${perPage}&format=${exportFormat}${roleParam}`;

      // Add search parameter if provided
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      // Add filter parameters
      if (currentFilters.fingerprint !== "all") {
        url += `&hasFingerprint=${currentFilters.fingerprint}`;
      }
      if (currentFilters.status !== "all") {
        url += `&status=${currentFilters.status}`;
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
      if (exportFormat === "json") {
        const data = await res.json();
        setData(data);
      } else {
        // For Excel or PDF file download
        const blob = await res.blob();
        const contentDisposition = res.headers.get("Content-Disposition");
        const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
        const filename = filenameMatch
          ? filenameMatch[1]
          : `users_report.${exportFormat}`;

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
    },
    [page, token, renderFrom, perPage, filters]
  );

  // Add debounce function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Create debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue) => {
        fetchUsers(searchValue);
      }, 500),
    [fetchUsers]
  );

  useEffect(() => {
    // Reset to page 1 when starting a new search
    if (searchTerm) {
      setPage(1);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      fetchUsers(); // Fetch all users when search is cleared
    }
  }, [searchTerm, debouncedSearch]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    setPage(1); // Reset to page 1 when filters change
    fetchUsers(searchTerm, "json", newFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    const newFilters = { fingerprint: "all", status: "all" };
    setFilters(newFilters);
    setPage(1);
    fetchUsers(searchTerm, "json", newFilters);
  };

  // Check if any filters are active
  const hasActiveFilters = filters.fingerprint !== "all" || filters.status !== "all";

  // Get active filters count
  const activeFiltersCount = Object.values(filters).filter(value => value !== "all").length;

  const [modal, setModal] = useState({ type: null, user: null });
  const { confirmDelete } = useConfirmDelete();

  const handleModal = (type, user = null) => {
    setModal({ type, user });
  };

  const handleAddUser = async (formData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/employee`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg || "Volunteer added successfully");
        await fetchUsers(searchTerm);
        handleModal(null);
        return { success: true };
      } else {
        toast.dismiss();
        return { success: false, msg: data.msg || "Failed to add volunteer" };
      }
    } catch (err) {
      console.error("Client error:", err);
      toast.dismiss();
      return { success: false, msg: "Something went wrong." };
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (formData) => {
    const userId = formData.get("id");

    if (!userId) {
      toast.error("Volunteer ID is required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/employee?id=${userId}`, {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg || "Volunteer updated successfully");
        await fetchUsers(searchTerm);
        handleModal(null);
        return { success: true };
      } else {
        toast.dismiss();
        return { success: false, msg: data.msg || "Failed to update volunteer" };
      }
    } catch (err) {
      console.error("Edit error:", err);
      toast.dismiss();
      return { success: false, msg: "Something went wrong" };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/frontapi/employee?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        toast.dismiss();
        toast.success(data.msg || "Employee deleted successfully");
        await fetchUsers(searchTerm);
      } else {
        toast.dismiss();
        let errorMsg = data.msg || "Failed to delete employee";
        if (typeof errorMsg === 'object') {
          errorMsg = Object.values(errorMsg).flat().join(', ');
        }
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.dismiss();
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (user) => {
    confirmDelete({
      itemName: user.name,
      onDelete: () => deleteUser(user.id),
      onSuccess: () => console.log("Employee deleted successfully!"),
    });
  };

  // Replace the existing useEffect hooks with these:
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="border border-stroke bg-white px-6 pt-6 pb-4 rounded-lg shadow-md dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by name, ID, email, mobile, email or region"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-80"
            />
          </div>

          {/* Filter Toggle Button */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 relative"
          >
            <FaFilter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          {renderFrom == 'volunteer' && <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => fetchUsers("", "excel")}
            // disabled={loading}
            >
              <FaDownload className="w-4 h-4" />
              Export Excel
            </Button>
          </div>}
          <Button
            onClick={() => handleModal("add")}
            className="flex items-center gap-2 w-full sm:w-auto"
            disabled={isLoading}
          >
            <FaUser className="w-4 h-4" />
            Add New {title}
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
              {/* Fingerprint Filter */}
              {/* <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Fingerprint:
                </span>
                <Select
                  value={filters.fingerprint}
                  onValueChange={(value) => handleFilterChange('fingerprint', value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="1">Registered</SelectItem>
                    <SelectItem value="0">Not Registered</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Status:
                </span>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="flex items-center gap-2"
              >
                <FaTimes className="w-3 h-3" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
              {filters.fingerprint !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Fingerprint: {filters.fingerprint === "1" ? "Registered" : "Not Registered"}
                  <button
                    onClick={() => handleFilterChange('fingerprint', 'all')}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <FaTimes className="w-2 h-2" />
                  </button>
                </Badge>
              )}
              {filters.status !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {filters.status === "1" ? "Active" : "Inactive"}
                  <button
                    onClick={() => handleFilterChange('status', 'all')}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <FaTimes className="w-2 h-2" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      {(searchTerm || hasActiveFilters) && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {data?.total ? (
            <>
              Showing {data.data?.length} of {data.total} volunteers
              {searchTerm && ` matching "${searchTerm}"`}
              {hasActiveFilters && " with applied filters"}
            </>
          ) : (
            "No volunteers found with current search and filters"
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-left text-sm font-semibold">
              <th className="p-4 rounded-tl-lg">{title}</th>
              <th className="p-4 text-center">{title} ID</th>
              <th className="p-4 text-center">Contact</th>
              <th className="p-4 text-center">Location</th>
              <th className="p-4 text-center">Local Area</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.length > 0 ? (
              data?.data.map((user, index) => (
                <tr
                  key={user.id}
                  className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${index === data?.data.length - 1 ? "border-b-0" : ""
                    }`}
                >
                  {/* Employee Info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Image
                          src={
                            user.avatar
                              ? `${process.env.NEXT_PUBLIC_BASE_URL_FOR_CLIENT}/${user.avatar}`
                              : noImg
                          }
                          alt={user.name || "Employee Avatar"}
                          height={48}
                          width={48}
                          className="rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${user.isActive ? "bg-green-500" : "bg-red-500"
                            }`}
                        ></div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {user.name || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.roles?.length > 0
                            ? user.roles[0].name
                            : "No role"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Employee ID */}
                  <td className="p-4 text-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                      {user.employee_id || "N/A"}
                    </span>
                  </td>

                  {/* Contact Info */}
                  {/* Contact Info */}
                  <td className="p-4 text-center">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {user.email || "No email"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.msisdn || "No mobile"}
                      </p>
                    </div>
                  </td>

                  {/* Location Info */}
                  <td className="p-4 text-center">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-900 dark:text-gray-100">
                        Div: {user.division_name || "-"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Dis: {user.district_name || "-"}
                      </p>
                    </div>
                  </td>

                  {/* Local Area Info */}
                  <td className="p-4 text-center">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-900 dark:text-gray-100">
                        Upz: {user.upazilla_name || "-"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Un: {user.union_name || "-"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        W: {user.ward || "-"}
                      </p>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${user.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                    >
                      {user.isActive ? (
                        <>
                          <FiCheckCircle className="w-3 h-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <FiXCircle className="w-3 h-3" />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>

                  {/* Fingerprint Status */}
                  {/* <td className="p-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        user.hasFingerprint
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      }`}
                    >
                      {user.hasFingerprint ? (
                        <>
                          <FiCheckCircle className="w-3 h-3" />
                          Registered
                        </>
                      ) : (
                        <>
                          <FiXCircle className="w-3 h-3" />
                          No
                        </>
                      )}
                    </span>
                  </td>
                   */}
                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => router.push(`/volunteer/view/${user.id}`)}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FaEye size={16} />
                      </button>
                      <button
                        onClick={() => handleModal("edit", user)}
                        className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                        title="Edit Volunteer"
                        disabled={isLoading}
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Volunteer"
                        disabled={isLoading}
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="p-8 text-center text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <FaUser className="w-12 h-12 text-gray-300" />
                    <p>No  found</p>
                    {(searchTerm || hasActiveFilters) && (
                      <p className="text-sm">Try adjusting your search terms or filters</p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <Pagination data={data} setPage={setPage} />
      </div>

      {/* Modals */}
      {modal.type === "add" && (
        <EmployeeAddModal
          isOpen
          onSubmit={handleAddUser}
          onClose={() => handleModal(null)}
          roles={roles}
          policies={policies}
          title={title}
          renderFrom={renderFrom}
        />
      )}
      {modal.type === "edit" && modal.user && (
        <EmployeeEditModal
          isOpen
          user={modal.user}
          onSubmit={handleEditUser}
          onClose={() => handleModal(null)}
          roles={roles}
          policies={policies}
          locations={locations}
          areas={areas}
          token={token}
          designations={designations}
          teams={teams}
          title={title}
          renderFrom={renderFrom}
        />
      )}
    </div>
  );
};

export default ViewTable;