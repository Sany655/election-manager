'use client'
import React from 'react'
import {
    FaChevronLeft,
    FaChevronRight,
    FaAngleDoubleLeft,
    FaAngleDoubleRight
} from 'react-icons/fa'

const VoterPagination = ({
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    filteredCount,
    totalCount,
    hasNextPage,
    hasPrevPage,
    loading
}) => {
    if (loading || filteredCount === 0) return null

    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, filteredCount)

    const handleItemsPerPageChange = (newLimit) => {
        setItemsPerPage(Number(newLimit))
        setCurrentPage(1)
    }

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = []
        const maxVisible = 5
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
        let endPage = Math.min(totalPages, startPage + maxVisible - 1)

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1)
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i)
        }
        return pages
    }

    return (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Pagination Info */}
                <div className="text-sm text-gray-600">
                    Showing{' '}
                    <span className="font-semibold text-gray-900">{startItem}</span>
                    {' '}-{' '}
                    <span className="font-semibold text-gray-900">{endItem}</span>
                    {' '}of{' '}
                    <span className="font-semibold text-gray-900">
                        {filteredCount.toLocaleString()}
                    </span>
                    {' '}filtered voters
                    {filteredCount !== totalCount && (
                        <span className="text-gray-500">
                            {' '}(Total: {totalCount.toLocaleString()})
                        </span>
                    )}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                    {/* Items per page selector */}
                    <div className="flex items-center gap-2 mr-4">
                        <label className="text-sm text-gray-600">Per page:</label>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => handleItemsPerPageChange(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>

                    {/* First Page */}
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={!hasPrevPage}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="First page"
                        aria-label="Go to first page"
                    >
                        <FaAngleDoubleLeft className="text-gray-600" />
                    </button>

                    {/* Previous Page */}
                    <button
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        disabled={!hasPrevPage}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Previous page"
                        aria-label="Go to previous page"
                    >
                        <FaChevronLeft className="text-gray-600" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                        {getPageNumbers().map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`min-w-[40px] px-3 py-1.5 rounded-lg font-medium transition-all ${pageNum === currentPage
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                aria-label={`Go to page ${pageNum}`}
                                aria-current={pageNum === currentPage ? 'page' : undefined}
                            >
                                {pageNum}
                            </button>
                        ))}
                    </div>

                    {/* Next Page */}
                    <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={!hasNextPage}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Next page"
                        aria-label="Go to next page"
                    >
                        <FaChevronRight className="text-gray-600" />
                    </button>

                    {/* Last Page */}
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={!hasNextPage}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Last page"
                        aria-label="Go to last page"
                    >
                        <FaAngleDoubleRight className="text-gray-600" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VoterPagination