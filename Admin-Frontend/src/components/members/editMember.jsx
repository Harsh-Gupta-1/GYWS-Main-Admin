import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateMember from './addMember'; // Import the existing CreateMember component

const EditMember = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const handleSuccess = (updatedMember) => {
    // Navigate back to the member view page or members list
    navigate(`/members`);
  };

  const handleCancel = () => {
    // Navigate back to the member view page
    navigate(`/members/view/${id}`);
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
          <button 
            onClick={() => navigate('/members')}
            className="text-orange-500 hover:text-orange-700"
          >
            ← Back to members
          </button>
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
          <button 
            onClick={() => navigate('/members')}
            className="text-orange-500 hover:text-orange-700"
          >
            ← Back to members
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <CreateMember 
        member={member}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default EditMember;