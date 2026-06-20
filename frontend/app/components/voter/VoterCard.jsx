import React from 'react'
import { FaMapMarkerAlt, FaPhone, FaIdCard, FaEdit, FaTrash, FaBriefcase } from 'react-icons/fa'

const VoterCard = ({ voter, onEdit, onDelete }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {voter.name?.charAt(0) || 'V'}
          </div>
          <div className="ml-4">
            <div className="text-sm font-semibold text-gray-900">{voter.name || 'N/A'}</div>
            <div className="text-xs text-gray-500">
              {voter.organization || 'No Div'} • {voter.category || 'No Univ'} 
              {voter.passing_year ? ` • Batch ${voter.passing_year}` : ''}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center text-sm text-gray-900">
          <FaIdCard className="mr-2 text-gray-400" />
          <span>{voter.nid || 'N/A'}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center text-sm text-gray-900">
          <FaPhone className="mr-2 text-gray-400" />
          <span>{voter.mobile || voter.phone || 'N/A'}</span>
        </div>
        {voter.email && (
          <div className="text-xs text-gray-500 ml-6">
            {voter.email}
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center text-sm text-gray-900">
          <FaBriefcase className="mr-2 text-gray-400" />
          <span>{voter.designation || voter.profession || 'N/A'}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center text-sm text-gray-900 mb-1">
          <FaMapMarkerAlt className="mr-2 text-gray-400 flex-shrink-0" />
          <span className="truncate max-w-[200px]" title={voter.address || voter.voter_center || 'No location data'}>
            {voter.address || voter.voter_center || 'No location data'}
          </span>
        </div>
        {voter.dues_amount != null && (
          <div className="text-xs text-red-500 font-semibold ml-6">
            Dues: ৳{voter.dues_amount} ({voter.years_of_dues} yrs)
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(voter.id)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit voter"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(voter.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete voter"
          >
            <FaTrash />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default VoterCard
