import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaCalendarAlt, FaUser, FaTag, FaEye, FaEdit, FaTrash, 
  FaPlus, FaFilter, FaSearch, FaClock, FaCheckCircle, 
  FaExclamationTriangle 
} from 'react-icons/fa';

const BlogsView = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'published', or 'draft'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get current year and generate years array from 2020 to current
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const availableYears = useMemo(() => {
    const years = [];
    for (let year = currentYear; year >= 2020; year--) {
      years.push(year);
    }
    return years;
  }, [currentYear]);

  // Fetch blogs whenever year changes
  useEffect(() => {
    fetchBlogs();
  }, [selectedYear]);
  
  // Filter blogs based on activeTab and search query
  const filteredBlogs = useMemo(() => {
    // First filter by tab (all, published, draft)
    let filtered = blogs;
    if (activeTab === 'published') {
      filtered = blogs.filter(blog => blog.status === 'published');
    } else if (activeTab === 'draft') {
      filtered = blogs.filter(blog => blog.status === 'draft');
    }
    
    // Then filter by search query if it exists
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(blog => 
        blog.title?.toLowerCase().includes(query) ||
        blog.author?.toLowerCase().includes(query) ||
        blog.content?.toLowerCase().includes(query) ||
        blog.excerpt?.toLowerCase().includes(query) ||
        (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    return filtered;
  }, [blogs, activeTab, searchQuery]);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      // Only fetch blogs by year
      const endpoint = `${import.meta.env.VITE_API_URL}/blogs/by-year?year=${selectedYear}`;
      
      const token = localStorage.getItem('token');
      
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await axios.get(endpoint, { headers });
      
      // Defensive check to ensure we always have an array
      const blogsData = response?.data?.data;
      setBlogs(Array.isArray(blogsData) ? blogsData : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to load blogs. Please try again later.');
      setBlogs([]); // Reset blogs to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (blog) => {
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!blogToDelete) return;
    
    try {
      // Get the authentication token from localStorage
      const token = localStorage.getItem('token');
      
      // Configure the request headers with the token
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Use environment variable for API URL with authentication token
      await axios.delete(`${import.meta.env.VITE_API_URL}/blogs/${blogToDelete._id}`, { headers });
      
      setBlogs(blogs.filter(blog => blog._id !== blogToDelete._id));
      setShowDeleteModal(false);
      setBlogToDelete(null);
    } catch (err) {
      console.error('Error deleting blog:', err);
      setError('Failed to delete blog. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderTags = (tags) => {
    if (!tags || tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {tags.map((tag, index) => (
          <span 
            key={index} 
            className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center"
          >
            <FaTag className="mr-1 text-xs text-gray-400" />
            {tag}
          </span>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-lvh rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blog Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your blog posts</p>
        </div>
        <div className="flex space-x-3">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search blogs..."
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
          
          <Link 
            to="/blogs/create" 
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
          >
            <FaPlus className="text-white" /> New Blog
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
              All Blogs
            </button>
            <button
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'published'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('published')}
            >
              <FaCheckCircle className="mr-2" />
              Published
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'draft'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('draft')}
            >
              <FaClock className="mr-2" />
              Drafts
            </button>
          </nav>
        </div>
      </div>

      {filteredBlogs.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No blogs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'all' ? 'Get started by creating a new blog post.' : `No ${activeTab} blogs available.`}
          </p>
          <div className="mt-6">
            <Link
              to="/blogs/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <FaPlus className="-ml-1 mr-2 h-5 w-5" />
              New Blog
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map(blog => (
            <div key={blog._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              {/* Card Image Section */}
              <div className="relative h-48 bg-gray-100">
                {blog.imageUrl ? (
                  <img 
                    className="h-full w-full object-cover" 
                    src={blog.imageUrl} 
                    alt={blog.title} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-200">
                    <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    blog.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  } flex items-center`}>
                    {blog.status === 'published' ? (
                      <>
                        <FaCheckCircle className="mr-1" />
                        Published
                      </>
                    ) : (
                      <>
                        <FaClock className="mr-1" />
                        Draft
                      </>
                    )}
                  </span>
                </div>
              </div>
              
              {/* Card Content */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-2">
                  {blog.title}
                </h3>
                
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                  {blog.excerpt || (blog.content && blog.content.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...')}
                </p>
                
                {/* Tags */}
                {renderTags(blog.tags)}
                
                {/* Meta Information */}
                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600 flex flex-wrap justify-between">
                  <div className="flex items-center mb-2">
                    <FaUser className="mr-1" />
                    <span>{blog.author}</span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <FaCalendarAlt className="mr-1" />
                    <span>{formatDate(blog.createdAt)}</span>
                  </div>
                </div>
                
                {/* Action Buttons - Enhanced Professional Styling */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                  <Link 
                    to={`/blogs/view/${blog._id}`} 
                    className="flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-all duration-200 text-sm font-medium"
                  >
                    <FaEye className="mr-2 text-gray-600" /> View
                  </Link>
                  
                  <Link 
                    to={`/blogs/edit/${blog._id}`} 
                    className="flex items-center justify-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-all duration-200 text-sm font-medium"
                  >
                    <FaEdit className="mr-2 text-blue-600" /> Edit
                  </Link>
                  
                  <button 
                    onClick={() => confirmDelete(blog)}
                    className="flex items-center justify-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-all duration-200 text-sm font-medium"
                  >
                    <FaTrash className="mr-2 text-red-600" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl mx-auto p-5 max-w-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
                <FaTrash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-5 text-lg font-normal text-gray-800">
                Are you sure you want to delete this blog?
              </h3>
              <p className="mb-5 text-sm text-gray-500">
                "{blogToDelete?.title}"
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
                  onClick={() => {
                    setShowDeleteModal(false);
                    setBlogToDelete(null);
                  }}
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

export default BlogsView;