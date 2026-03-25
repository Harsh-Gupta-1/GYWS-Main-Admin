import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CreateBlog from './createBlog';

const EditBlog = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        // Get the authentication token from localStorage
        const token = localStorage.getItem('token');

        // Configure the request headers with the token
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Use environment variable for API URL
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/blogs/${id}`,
          { headers }
        );
        setBlog(response.data.data);
      } catch (err) {
        console.error('Error fetching blog data:', err);
        setError('Failed to load blog data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md max-w-4xl mx-auto my-6">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <CreateBlog blog={blog} />
    </div>
  );
};

export default EditBlog;