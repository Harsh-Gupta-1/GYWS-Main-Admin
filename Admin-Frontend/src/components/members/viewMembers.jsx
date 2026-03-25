import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaCalendarAlt, FaUser, FaTag, FaEye, FaEdit, FaTrash, 
  FaPlus, FaFilter, FaSearch, FaEyeSlash, 
  FaExclamationTriangle 
} from 'react-icons/fa';
import MemberCard from './memberCard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Dynamically attach the token on every request so it's never stale
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const Membersview = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'visible', or 'hidden'
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'byTeam'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [membersByTeam, setMembersByTeam] = useState({});
  
  // Get current year and generate years array from 2019 to current
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(null);
  const availableYears = useMemo(() => {
    const years = [];
    for (let year = currentYear; year >= 2019; year--) {
      years.push(year);
    }
    return years;
  }, [currentYear]);

  // On mount, discover the latest year that has member data
  useEffect(() => {
    const findLatestYearWithData = async () => {
      // Try current year first, then go backwards
      for (let year = currentYear; year >= 2019; year--) {
        try {
          const response = await api.get(`/members/year/${year}`);
          const total = response?.data?.data?.totalMembers || 0;
          if (total > 0) {
            setSelectedYear(year);
            return;
          }
        } catch {
          // ignore and try next year
        }
      }
      // Fallback to current year if nothing found
      setSelectedYear(currentYear);
    };
    findLatestYearWithData();
  }, []);

  // Fetch members whenever year changes (skip initial null)
  useEffect(() => {
    if (selectedYear !== null) {
      fetchMembers();
    }
  }, [selectedYear]);
  
  // Filter members based on activeTab and search query
  const filteredMembers = useMemo(() => {
    // First filter by tab (all, visible, hidden)
    let filtered = members;
    if (activeTab === 'visible') {
      filtered = members.filter(member => member.show_in_website === true);
    } else if (activeTab === 'hidden') {
      filtered = members.filter(member => member.show_in_website === false);
    }
    
    // Then filter by search query if it exists
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(member => 
        member.name?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.roll_number?.toLowerCase().includes(query) ||
        member.hall?.toLowerCase().includes(query) ||
        (member.positions && member.positions.some(pos => 
          pos.position_id?.pos_name?.toLowerCase().includes(query) ||
          pos.position_id?.team?.toLowerCase().includes(query)
        ))
      );
    }
    
    return filtered;
  }, [members, activeTab, searchQuery]);

  // Filter membersByTeam based on activeTab and search query
  const filteredMembersByTeam = useMemo(() => {
    const filtered = {};
    
    Object.entries(membersByTeam).forEach(([team, teamMembers]) => {
      // Filter team members based on activeTab
      let filteredTeamMembers = teamMembers;
      if (activeTab === 'visible') {
        filteredTeamMembers = teamMembers.filter(member => member.show_in_website === true);
      } else if (activeTab === 'hidden') {
        filteredTeamMembers = teamMembers.filter(member => member.show_in_website === false);
      }
      
      // Then filter by search query if it exists
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filteredTeamMembers = filteredTeamMembers.filter(member => 
          member.name?.toLowerCase().includes(query) ||
          member.email?.toLowerCase().includes(query) ||
          member.roll_number?.toLowerCase().includes(query) ||
          member.hall?.toLowerCase().includes(query) ||
          (member.positions && member.positions.some(pos => 
            pos.position_id?.pos_name?.toLowerCase().includes(query) ||
            pos.position_id?.team?.toLowerCase().includes(query)
          ))
        );
      }
      
      // Only add team if it has members after filtering
      if (filteredTeamMembers.length > 0) {
        filtered[team] = filteredTeamMembers;
      }
    });
    
    return filtered;
  }, [membersByTeam, activeTab, searchQuery]);

  const fetchMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/members/year/${selectedYear}`);
      const responseData = response?.data?.data;
      
      if (responseData) {
        setMembers(responseData.allMembers || []);
        setMembersByTeam(responseData.membersByTeam || {});
      } else {
        setMembers([]);
        setMembersByTeam({});
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load members. Please try again later.');
      setMembers([]);
      setMembersByTeam({});
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (member) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;
    
    try {
      await api.delete(`/members/${memberToDelete._id}`);
      
      // Update members state
      const updatedMembers = members.filter(member => member._id !== memberToDelete._id);
      setMembers(updatedMembers);
      
      // Update membersByTeam state
      const updatedMembersByTeam = {};
      Object.keys(membersByTeam).forEach(team => {
        const filteredTeamMembers = membersByTeam[team].filter(member => member._id !== memberToDelete._id);
        if (filteredTeamMembers.length > 0) {
          updatedMembersByTeam[team] = filteredTeamMembers;
        }
      });
      setMembersByTeam(updatedMembersByTeam);
      
      setShowDeleteModal(false);
      setMemberToDelete(null);
    } catch (err) {
      console.error('Error deleting member:', err);
      setError('Failed to delete member. Please try again.');
      setShowDeleteModal(false);
      setMemberToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMemberToDelete(null);
  };

  // Simplified function to render member card using the isolated component
  const renderMemberCard = (member) => (
    <MemberCard 
      key={member._id}
      member={member}
      onDelete={confirmDelete}
    />
  );

  if (isLoading) {
    return (
      <div className="w-full py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Member Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create, Edit or Delete Members</p>
        </div>
        <div className="flex space-x-3">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          
          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Members
            </button>
            <button
              onClick={() => setViewMode('byTeam')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'byTeam'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              By Team
            </button>
          </div>
          
          <Link 
            to="/members/create" 
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
          >
            <FaPlus className="text-white" /> New Member
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 flex items-center" role="alert">
          <FaExclamationTriangle className="mr-2" />
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'all'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('all')}
            >
              <FaFilter className="mr-2" />
              All Members
            </button>
            <button
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'visible'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('visible')}
            >
              <FaEye className="mr-2" />
              Visible
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'hidden'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('hidden')}
            >
              <FaEyeSlash className="mr-2" />
              Hidden
            </button>
          </nav>
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery.trim() !== '' 
              ? 'No members match your search criteria.' 
              : activeTab === 'all' 
                ? 'Get started by creating a new member.' 
                : `No ${activeTab === 'visible' ? 'visible' : 'hidden'} members available.`
            }
          </p>
          <div className="mt-6">
            <Link
              to="/members/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <FaPlus className="-ml-1 mr-2 h-5 w-5" />
              New Member
            </Link>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'all' ? (
            // All Members View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMembers.map(member => renderMemberCard(member))}
            </div>
          ) : (
            // By Team View
            <div className="space-y-8">
              {Object.keys(filteredMembersByTeam).length > 0 ? (
                Object.entries(filteredMembersByTeam).map(([team, teamMembers]) => (
                  <div key={team} className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <FaTag className="mr-2 text-orange-500" />
                      {team}
                      <span className="ml-2 bg-orange-100 text-orange-800 text-sm px-2 py-1 rounded-full">
                        {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                      </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {teamMembers.map(member => renderMemberCard(member))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery.trim() !== '' 
                      ? 'No members match your search criteria.' 
                      : `No members have positions assigned for ${selectedYear}.`
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center"
          onClick={cancelDelete}
        >
          <div 
            className="relative bg-white rounded-lg shadow-xl mx-auto p-5 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
                <FaTrash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-5 text-lg font-normal text-gray-800">
                Are you sure you want to delete this member?
              </h3>
              <p className="mb-5 text-sm text-gray-500">
                "{memberToDelete?.name}"
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleDelete}
                  className="text-white bg-red-600 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center"
                >
                  <FaTrash className="mr-2" />
                  Yes, delete it
                </button>
                <button
                  onClick={cancelDelete}
                  className="text-gray-500 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium px-5 py-2.5 flex items-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Membersview;