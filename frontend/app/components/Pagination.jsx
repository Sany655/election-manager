"use client";

import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Pagination = ({ data, setPage }) => {
  const pages = data?.pages || 1;
  const count = data?.count || 0;

  const currentPage = data?.page || 1;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pages) {
        setPage(newPage);
    }
  };

  // Generate page numbers to show with ellipsis
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    // If total pages <= 7, show all pages
    if (pages <= 7) {
      for (let i = 1; i <= pages; i++) {
        range.push(i);
      }
      return range;
    }

    // Calculate range for larger pagination
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(pages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    // Add first page
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    // Add middle pages (avoid duplicates)
    range.forEach(page => {
      if (!rangeWithDots.includes(page)) {
        rangeWithDots.push(page);
      }
    });

    // Add last page
    if (currentPage + delta < pages - 1) {
      rangeWithDots.push("...", pages);
    } else if (pages > 1 && !rangeWithDots.includes(pages)) {
      rangeWithDots.push(pages);
    }

    return rangeWithDots;
  };

  if (pages <= 1) return null;

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      {/* Results info */}
      {count > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, count)} of {count} results
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          }`}
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          <FaChevronLeft className="w-3 h-3" />
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum, index) => (
            <button
              key={index}
              className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                pageNum === currentPage
                  ? "bg-blue-500 text-white border-blue-500"
                  : pageNum === "..."
                  ? "bg-transparent text-gray-400 border-transparent cursor-default"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              }`}
              onClick={() => pageNum !== "..." && handlePageChange(pageNum)}
              disabled={pageNum === "..."}
            >
              {pageNum}
            </button>
          ))}
        </div>

        {/* Next button */}
        <button
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            currentPage === pages
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          }`}
          disabled={currentPage === pages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
          <FaChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Quick page jump (for larger datasets) */}
      {pages > 10 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">Go to page:</span>
          <input
            type="number"
            min="1"
            max={pages}
            className="w-16 px-2 py-1 text-center border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const newPage = parseInt(e.target.value);
                if (newPage >= 1 && newPage <= pages) {
                  handlePageChange(newPage);
                  e.target.value = "";
                }
              }
            }}
            placeholder={currentPage.toString()}
          />
        </div>
      )}
    </div>
  );
};

export default Pagination;