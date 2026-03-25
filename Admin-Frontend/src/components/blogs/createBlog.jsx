import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateBlog = ({ blog }) => {
  const navigate = useNavigate();
  const quillRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    tags: [],
    status: 'draft',
    image: null
  });

  // Add a new state for the tags input string
  const [tagInput, setTagInput] = useState('');

  // Effect to populate form when blog prop changes (edit mode)
  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        excerpt: blog.excerpt || '',
        author: blog.author || '',
        tags: blog.tags || [],
        status: blog.status || 'draft',
        image: null
      });
      
      // Also set the tag input when editing
      setTagInput(blog.tags ? blog.tags.join(', ') : '');
    }
  }, [blog]);

  // Effect to save form data to localStorage to persist on refresh
  useEffect(() => {
    const savedFormData = localStorage.getItem('blogFormData');
    if (savedFormData && !blog) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error parsing saved form data', error);
      }
    }
  }, [blog]);

  // Effect to save form data to localStorage when it changes
  useEffect(() => {
    if (formData.title || formData.content) {
      // Create a copy of formData without the image property
      const formDataToSave = { ...formData };
      delete formDataToSave.image;
      
      localStorage.setItem('blogFormData', JSON.stringify(formDataToSave));
    }
  }, [formData]);

  // Add this useEffect after your other useEffects
  useEffect(() => {
    // Apply custom styles to fix the Quill toolbar scrolling issue
    const style = document.createElement('style');
    style.innerHTML = `
      /* Main container styling */
      .quill-editor {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      
      /* Make toolbar sticky and styled properly */
      .quill-editor .ql-toolbar.ql-snow {
        position: sticky;
        top: 0;
        z-index: 20;
        background: white;
        padding: 8px;
        border: none;
        border-bottom: 1px solid #e2e8f0;
      }
      
      /* Container styling */
      .quill-editor .ql-container.ql-snow {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        border: none;
      }
      
      /* Editor content area with proper padding and scrolling */
      .quill-editor .ql-container .ql-editor {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        padding-bottom: 100px; /* Extra padding at bottom to prevent content being hidden */
        min-height: 200px;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuillChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
  };

  // Modify the handleTagsChange function
  const handleTagsChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
    
    // Only update the tags array when needed
    if (value.trim() !== '') {
      const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      setFormData(prev => ({
        ...prev,
        tags: tagsArray
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        tags: []
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('status', formData.status);
      
      // Add tags properly for backend array storage
      if (formData.tags.length > 0) {
        // For multer/express to correctly parse tags as an array,
        // we need to append each tag individually with the same field name
        formData.tags.forEach(tag => {
          formDataToSend.append('tags', tag);
        });
      }
      
      // Add image if available
      if (formData.image) {
        console.log('Image file:', formData.image);
        formDataToSend.append('image', formData.image);
      }

      // Get the auth token from localStorage
      const token = localStorage.getItem('token');

      // Configure headers with both Content-Type and Authorization
      const headers = {
        'Content-Type': 'multipart/form-data',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let response;
      if (blog && blog._id) {
        // Update existing blog with auth token
        response = await axios.put(`${import.meta.env.VITE_API_URL}/blogs/${blog._id}`, formDataToSend, {
          headers: headers
        });
      } else {
        // Create new blog with auth token
        response = await axios.post(`${import.meta.env.VITE_API_URL}/blogs`, formDataToSend, {
          headers: headers
        });
      }

      // Clear localStorage after successful submission
      localStorage.removeItem('blogFormData');
      
      // Redirect to blog list immediately (no delay)
      navigate('/blogs');
      
    } catch (error) {
      console.error('Error submitting blog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Quill editor modules and formats
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link',
    'color', 'background'
  ];

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header Banner - Modified to behave like a navbar */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 py-6 px-6 sticky top-0 z-10 shadow-md">
        <h1 className="text-2xl font-bold text-white">
          {blog ? 'Edit Existing Blog' : 'Create New Blog'}
        </h1>
        <p className="text-orange-100 mt-1">
          {blog 
            ? 'Update your blog post with the latest content and information' 
            : 'Share your thoughts, ideas, and insights with the world'}
        </p>
      </div>

      {/* Add padding to ensure content doesn't get hidden under the header */}
      <div className="p-6 pt-4">
        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-orange-800 mb-4 flex items-center">
              Basic Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-orange-700 font-medium">
                  Blog Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter an engaging title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="author" className="block text-orange-700 font-medium">
                  Author*
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                  placeholder="Your name or pseudonym"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-orange-800 mb-4 flex items-center">
              Blog Content
            </h2>
            
            <div className="space-y-2">
              <label htmlFor="content" className="block text-orange-700 font-medium">
                Content*
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden flex flex-col">
                {/* The main container with fixed height */}
                <div className="h-[500px] flex flex-col">
                  {/* The toolbar will be positioned here by Quill */}
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={formData.content}
                    onChange={handleQuillChange}
                    modules={modules}
                    formats={formats}
                    placeholder="Write your blog content here..."
                    className="quill-editor flex-grow"
                  />
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-2">
                Use the formatting tools above to style your content
              </p>
            </div>
          </div>

          {/* Media and Tags Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-orange-800 mb-4 flex items-center">
                Featured Image
              </h2>
              
              <div className="space-y-4">
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-orange-400 transition-colors duration-200">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center py-4">
                    <div className="text-orange-500 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-700">Click or drag to upload image</p>
                    <p className="text-gray-500 text-sm mt-1">JPG, PNG or GIF</p>
                  </div>
                </div>
                
                {formData.image && (
                  <div className="mt-3">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-orange-700">Image selected: {formData.image.name}</span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="ml-auto text-red-500 hover:text-red-700"
                        title="Remove image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                
                {blog && blog.imageUrl && !formData.image && (
                  <div className="mt-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-blue-700">Current image will be kept unless you upload a new one</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags and Settings */}
            <div className="space-y-6">
              {/* Tags */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm h-full">
                <h2 className="text-xl font-semibold text-orange-800 mb-4 flex items-center">
                  Tags & Settings
                </h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="tags" className="block text-orange-700 font-medium">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={tagInput}
                      onChange={handleTagsChange}
                      placeholder="technology, news, tutorial"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag, index) => (
                          <span 
                            key={index} 
                            className="inline-block bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="excerpt" className="block text-orange-700 font-medium">
                      Excerpt
                    </label>
                    <textarea
                      id="excerpt"
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleChange}
                      placeholder="A brief summary of your blog (auto-generated if left empty)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      rows="3"
                    />
                    <p className="text-gray-500 text-sm">
                      This will be displayed in blog previews and search results
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="status" className="block text-orange-700 font-medium">
                      Publication Status
                    </label>
                    <div className="relative">
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 appearance-none"
                      >
                        <option value="draft">Draft - Save but don't publish</option>
                        <option value="published">Published - Visible to everyone</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <div className={`w-3 h-3 rounded-full ${formData.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}></div>
                      <span className="text-sm text-gray-600">
                        {formData.status === 'published' ? 'Will be visible to the public' : 'Only visible to administrators'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {blog ? 'Editing existing blog published on ' + new Date(blog.createdAt).toLocaleDateString() : 'All fields marked with * are required'}
            </div>
            
            <div className="flex space-x-4">
              <button 
                type="button" 
                onClick={() => navigate('/blogs')}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all duration-200 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>{blog ? 'Update Blog' : 'Save'}</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlog;