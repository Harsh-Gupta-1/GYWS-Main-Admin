import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaCalendarAlt, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaEdit, 
  FaArrowLeft,
  FaUserTie,
  FaHome,
  FaIdCard,
  FaLinkedin,
  FaFacebook,
  FaShieldAlt,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { Facebook, Mail, Linkedin } from 'lucide-react';

const ViewMember = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        // Get the authentication token from localStorage
        const token = localStorage.getItem('token');
        
        // Configure the request headers with the token
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Use environment variable for API URL
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/members/${id}`, { headers });
        setMember(response.data.data);
      } catch (err) {
        console.error('Error fetching member data:', err);
        setError('Failed to load member data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMember();
    }
  }, [id]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatPhoneNumbers = (phoneNumbers) => {
    if (!phoneNumbers || phoneNumbers.length === 0) return 'Not provided';
    return phoneNumbers.filter(phone => phone && phone.trim() !== '').join(', ');
  };

  const formatPositions = (positions) => {
    if (!positions || positions.length === 0) return [];
    
    return positions.map(pos => ({
      year: pos.year,
      position: pos.position_id?.pos_name || pos.position_name || 'Unknown Position',
      team: pos.position_id?.team || 'Unknown Team'
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md max-w-4xl mx-auto my-6">
        <p className="font-medium">Error</p>
        <p>{error}</p>
        <div className="mt-4">
          <Link to="/members" className="text-orange-500 hover:text-orange-700 flex items-center">
            <FaArrowLeft className="mr-2" /> Back to members
          </Link>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md max-w-4xl mx-auto my-6">
        <p className="font-medium">Member not found</p>
        <p>The requested member could not be found.</p>
        <div className="mt-4">
          <Link to="/members" className="text-orange-500 hover:text-orange-700 flex items-center">
            <FaArrowLeft className="mr-2" /> Back to members
          </Link>
        </div>
      </div>
    );
  }

  const positions = formatPositions(member.positions);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Navigation and Actions */}
      <div className="flex justify-between items-center mb-6">
        <Link to="/members" className="text-orange-500 hover:text-orange-700 flex items-center">
          <FaArrowLeft className="mr-2" /> Back to members
        </Link>
        
        <div className="flex items-center space-x-3">
          <Link 
            to={`/members/edit/${member._id}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaEdit className="mr-2" /> Edit Member
          </Link>
        </div>
      </div>
      
      {/* Status and Admin Badges */}
      <div className="mb-6 flex gap-3">
        {member.is_admin && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            <FaShieldAlt className="mr-1.5" /> Admin
          </span>
        )}
        
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          member.show_in_website === true 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {member.show_in_website === true ? (
            <>
              <FaEye className="mr-1.5" /> Visible
            </>
          ) : (
            <>
              <FaEyeSlash className="mr-1.5" /> Hidden
            </>
          )}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
            {/* Profile Image */}
            <div className="text-center mb-6">
              <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-blue-200 to-blue-300 p-2">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  {member.photo_url && member.photo_url !== "/api/placeholder/120/120" ? (
                    <img 
                      src={member.photo_url} 
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-44 h-44 rounded-full bg-gradient-to-br from-blue-300 to-blue-400 flex items-center justify-center ${member.photo_url && member.photo_url !== "/api/placeholder/120/120" ? 'hidden' : ''}`}>
                    {/* Profile illustration */}
                    <div className="relative">
                      {/* Head */}
                      <div className="w-24 h-24 bg-pink-200 rounded-full relative">
                        {/* Hair */}
                        <div className="absolute -top-3 left-3 right-3 h-9 bg-gray-700 rounded-t-full"></div>
                      </div>
                      {/* Suit */}
                      <div className="w-32 h-20 bg-blue-600 mx-auto relative -mt-6">
                        {/* Shirt */}
                        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white"></div>
                        {/* Tie */}
                        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-3 h-10 bg-red-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Name */}
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{member.name}</h1>
              
              {/* Primary Position */}
              {positions.length > 0 && (
                <p className="text-gray-600 font-medium mb-4">
                  {positions[0].position} - {positions[0].team}
                </p>
              )}
            </div>

            {/* Social Links */}
            <div className="flex justify-center space-x-6 mb-6">
              {member.social_media_links?.facebook && member.social_media_links.facebook !== "#" && (
                <a 
                  href={member.social_media_links.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <Facebook size={24} />
                </a>
              )}
              {member.email && (
                <a 
                  href={`mailto:${member.email}`}
                  className="text-gray-600 hover:text-red-500 transition-colors duration-200"
                >
                  <Mail size={24} />
                </a>
              )}
              {member.social_media_links?.linkedin && member.social_media_links.linkedin !== "#" && (
                <a 
                  href={member.social_media_links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-700 transition-colors duration-200"
                >
                  <Linkedin size={24} />
                </a>
              )}
            </div>

            {/* Quick Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-600">
                <FaEnvelope className="mr-3 text-orange-500" />
                <a href={`mailto:${member.email}`} className="hover:text-orange-500 transition-colors">
                  {member.email}
                </a>
              </div>
              
              {member.phone_numbers && member.phone_numbers.length > 0 && (
                <div className="flex items-start text-gray-600">
                  <FaPhone className="mr-3 text-orange-500 mt-0.5" />
                  <div>
                    {member.phone_numbers.filter(phone => phone && phone.trim() !== '').map((phone, index) => (
                      <div key={index}>
                        <a href={`tel:${phone}`} className="hover:text-orange-500 transition-colors">
                          {phone}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaUser className="mr-2 text-orange-500" />
              Basic Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                <p className="text-gray-800 font-medium">{member.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <p className="text-gray-800">
                  <a href={`mailto:${member.email}`} className="hover:text-orange-500 transition-colors">
                    {member.email}
                  </a>
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Roll Number</label>
                <p className="text-gray-800 flex items-center">
                  <FaIdCard className="mr-2 text-gray-500" />
                  {member.roll_number}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Hall</label>
                <p className="text-gray-800 flex items-center">
                  <FaHome className="mr-2 text-gray-500" />
                  {member.hall}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone Numbers</label>
                <div className="text-gray-800">
                  {member.phone_numbers && member.phone_numbers.length > 0 ? (
                    member.phone_numbers.filter(phone => phone && phone.trim() !== '').map((phone, index) => (
                      <div key={index} className="flex items-center mb-1">
                        <FaPhone className="mr-2 text-gray-500" />
                        <a href={`tel:${phone}`} className="hover:text-orange-500 transition-colors">
                          {phone}
                        </a>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500 italic">Not provided</span>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Member Since</label>
                <p className="text-gray-800 flex items-center">
                  <FaCalendarAlt className="mr-2 text-gray-500" />
                  {formatDate(member.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Positions */}
          {positions.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaUserTie className="mr-2 text-orange-500" />
                Positions & Roles
              </h2>
              
              <div className="space-y-4">
                {positions.map((pos, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{pos.position}</h3>
                        <p className="text-gray-600">{pos.team} </p>
                      </div>
                      <div className="text-right">
                        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                          {pos.year}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Media Links */}
          {(member.social_media_links?.linkedin || member.social_media_links?.facebook) && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Social Media
              </h2>
              
              <div className="space-y-3">
                {member.social_media_links?.linkedin && member.social_media_links.linkedin !== "#" && (
                  <div className="flex items-center">
                    <FaLinkedin className="mr-3 text-blue-600" size={20} />
                    <a 
                      href={member.social_media_links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition-colors break-all"
                    >
                      {member.social_media_links.linkedin}
                    </a>
                  </div>
                )}
                
                {member.social_media_links?.facebook && member.social_media_links.facebook !== "#" && (
                  <div className="flex items-center">
                    <FaFacebook className="mr-3 text-blue-800" size={20} />
                    <a 
                      href={member.social_media_links.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-800 hover:text-blue-600 transition-colors break-all"
                    >
                      {member.social_media_links.facebook}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Account Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Website Visibility</label>
                <div className="flex items-center">
                  {member.show_in_website === true ? (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <FaEye className="mr-1" /> Visible 
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <FaEyeSlash className="mr-1" /> Hidden
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Admin Privileges</label>
                <div className="flex items-center">
                  {member.is_admin ? (
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <FaShieldAlt className="mr-1" /> Admin
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      Member
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
                <p className="text-gray-800 flex items-center">
                  <FaCalendarAlt className="mr-2 text-gray-500" />
                  {formatDate(member.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Member ID: {member._id}
          </div>
          
          <Link 
            to={`/members/edit/${member._id}`}
            className="text-orange-500 hover:text-orange-700 flex items-center"
          >
            <FaEdit className="mr-2" /> Edit Member
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ViewMember;