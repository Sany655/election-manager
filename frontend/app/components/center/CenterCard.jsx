import React from 'react'
import { FaMapMarkerAlt, FaHashtag, FaEdit, FaTrash, FaUsers, FaMale, FaFemale } from 'react-icons/fa'

const CenterCard = ({ center, onEdit, onDelete }) => {
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {center.name?.charAt(0) || 'C'}
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{center.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            <FaHashtag className="text-gray-400" />
                            Center #{center.centerNumber || 'N/A'}
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-900">
                        <FaUsers className="mr-2 text-blue-500" />
                        <span className="font-semibold">{center.totalVoters || 0}</span>
                        <span className="text-gray-500 ml-1">Total</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center text-pink-600">
                            <FaFemale className="mr-1" />
                            <span>{center.availableFemaleVoters || 0}</span>
                        </div>
                        <div className="flex items-center text-blue-600">
                            <FaMale className="mr-1" />
                            <span>{center.availableMaleVoters || 0}</span>
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center text-sm text-gray-900 mb-1">
                    <FaMapMarkerAlt className="mr-2 text-gray-400 flex-shrink-0" />
                    <span>{center.location?.division || 'N/A'}</span>
                </div>
                <div className="text-xs text-gray-500 ml-6">
                    {[center.location?.district, center.location?.upazilla, center.location?.union].filter(Boolean).join(', ') || 'No location data'}
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${center.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {center.status || 'Unknown'}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit(center.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit center"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={() => onDelete(center.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete center"
                    >
                        <FaTrash />
                    </button>
                </div>
            </td>
        </tr>
    )
}

export default CenterCard
