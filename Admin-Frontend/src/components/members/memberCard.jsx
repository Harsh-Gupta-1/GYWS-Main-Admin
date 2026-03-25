import React from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash, FaEyeSlash } from 'react-icons/fa';
import { Linkedin, Mail, Facebook } from 'lucide-react';

const MemberCard = ({ 
  member,
  onDelete = () => {}
}) => {
  // Helper function to get primary position from member's positions
  const getPrimaryPosition = (positions) => {
    if (!positions || positions.length === 0) return 'Member';
    // Return the first position's name
    return positions[0].position_id?.pos_name || positions[0].position_name || 'Member';
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col h-full relative overflow-hidden w-full max-w-sm">
      {/* Visibility indicator */}
      <div className="absolute top-3 right-3 z-10">
        {member.show_in_website ? (
          <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium border border-green-200 shadow-sm">
            <FaEye className="w-3 h-3" />
            <span>Visible</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-gray-50 text-gray-500 px-2 py-1 rounded-full text-xs font-medium border border-gray-200 shadow-sm">
            <FaEyeSlash className="w-3 h-3" />
            <span>Hidden</span>
          </div>
        )}
      </div>

      {/* Profile section */}
      <div className="p-6 pt-12 text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 shadow-sm">
          {member.photo_url && member.photo_url !== "/api/placeholder/120/120" ? (
            <img 
              src={member.photo_url} 
              alt={member.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold ${member.photo_url && member.photo_url !== "/api/placeholder/120/120" ? 'hidden' : ''}`}>
            {member.name.charAt(0)}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {member.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-1">
          {getPrimaryPosition(member.positions)}
        </p>

        <p className="text-xs text-gray-500">
          {member.positions?.[0]?.position_id?.team || 'No Team'}
        </p>
      </div>

      {/* Social media icons */}
      <div className="px-6 pb-4">
        <div className="flex justify-center gap-3">
          {/* LinkedIn */}
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              member.linkedin 
                ? 'bg-blue-100 hover:bg-blue-200 cursor-pointer' 
                : 'bg-gray-100 cursor-pointer opacity-50'
            }`}
            onClick={() => member.linkedin && window.open(member.linkedin, '_blank')}
          >
            <Linkedin className="w-4 h-4 text-blue-600" />
          </div>

          {/* Email */}
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              member.email 
                ? 'bg-gray-100 hover:bg-gray-200 cursor-pointer' 
                : 'bg-gray-100 cursor-pointer opacity-50'
            }`}
            onClick={() => member.email && window.open(`mailto:${member.email}`, '_blank')}
          >
            <Mail className="w-4 h-4 text-gray-600" />
          </div>

          {/* Facebook */}
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              member.facebook 
                ? 'bg-blue-100 hover:bg-blue-200 cursor-pointer' 
                : 'bg-gray-100 cursor-pointer opacity-50'
            }`}
            onClick={() => member.facebook && window.open(member.facebook, '_blank')}
          >
            <Facebook className="w-4 h-4 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="border-t border-gray-100 p-4 mt-auto">
        <div className="flex gap-2">
          <Link 
            to={`/members/view/${member._id}`} 
            className="flex-1 py-2 px-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <FaEye className="w-3 h-3" />
            View
          </Link>
          
          <Link 
            to={`/members/edit/${member._id}`} 
            className="flex-1 py-2 px-3 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <FaEdit className="w-3 h-3" />
            Edit
          </Link>
          
          <button 
            onClick={() => onDelete(member)}
            className="flex-1 py-2 px-3 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors duration-200 flex items-center justify-center gap-1 cursor-pointer"
          >
            <FaTrash className="w-3 h-3" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;