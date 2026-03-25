import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaCalendarAlt, 
  FaUser, 
  FaTag, 
  FaEdit, 
  FaArrowLeft,
  FaClock,
  FaCheckCircle
} from 'react-icons/fa';

const ViewBlog = () => {
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
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/blogs/${id}`, { headers });
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderTags = (tags) => {
    if (!tags || tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {tags.map((tag, index) => (
          <span 
            key={index} 
            className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full flex items-center"
          >
            <FaTag className="mr-1 text-xs text-gray-400" />
            {tag}
          </span>
        ))}
      </div>
    );
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
          <Link to="/blogs" className="text-orange-500 hover:text-orange-700 flex items-center">
            <FaArrowLeft className="mr-2" /> Back to blogs
          </Link>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md max-w-4xl mx-auto my-6">
        <p className="font-medium">Blog not found</p>
        <p>The requested blog could not be found.</p>
        <div className="mt-4">
          <Link to="/blogs" className="text-orange-500 hover:text-orange-700 flex items-center">
            <FaArrowLeft className="mr-2" /> Back to blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Navigation and Actions */}
      <div className="flex justify-between items-center mb-6">
        <Link to="/blogs" className="text-orange-500 hover:text-orange-700 flex items-center">
          <FaArrowLeft className="mr-2" /> Back to blogs
        </Link>
        
        <div className="flex items-center space-x-3">
          <Link 
            to={`/blogs/edit/${blog._id}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaEdit className="mr-2" /> Edit Blog
          </Link>
        </div>
      </div>
      
      {/* Status Badge */}
      <div className="mb-6">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          blog.status === 'published' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {blog.status === 'published' ? (
            <>
              <FaCheckCircle className="mr-1.5" /> Published
            </>
          ) : (
            <>
              <FaClock className="mr-1.5" /> Draft
            </>
          )}
        </span>
      </div>
      
      {/* Blog Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>
      
      {/* Meta Information */}
      <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
        <div className="flex items-center">
          <FaUser className="mr-2 text-orange-500" />
          <span>{blog.author}</span>
        </div>
        
        <div className="flex items-center">
          <FaCalendarAlt className="mr-2 text-orange-500" />
          <span>{formatDate(blog.createdAt)}</span>
        </div>
      </div>
      
      {/* Tags */}
      {renderTags(blog.tags)}
      
      {/* Featured Image */}
      {blog.imageUrl && (
        <div className="my-8 rounded-lg overflow-hidden shadow-md">
          <img 
            src={blog.imageUrl} 
            alt={blog.title} 
            className="w-full h-auto object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/1200x600?text=Image+Not+Available';
            }}
          />
        </div>
      )}
      
      {/* Blog Excerpt */}
      {blog.excerpt && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 my-6 italic text-gray-700">
          {blog.excerpt}
        </div>
      )}
      
      {/* Blog Content */}
      <div className="prose prose-lg max-w-none mt-8 blog-content">
        <div dangerouslySetInnerHTML={{ __html: blog.content }} />
      </div>

      {/* Footer Meta */}
      <div className="mt-12 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Last updated: {formatDate(blog.updatedAt)}
          </div>
          
          <Link 
            to={`/blogs/edit/${blog._id}`}
            className="text-orange-500 hover:text-orange-700 flex items-center"
          >
            <FaEdit className="mr-2" /> Edit Blog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ViewBlog;