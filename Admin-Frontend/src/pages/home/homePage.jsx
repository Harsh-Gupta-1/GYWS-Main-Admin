import React from 'react';
import { Link } from 'react-router-dom';
import { FaBlog, FaHome, FaSearch, FaPlus, FaBell } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div>
      <header className="w-full bg-white border-b border-orange-100 mb-8">
        <div className="px-6 py-4">
          {/* Main Header Bar */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Admin Panel Overview</h1>
          </div>
        </div>
      </header>

      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Welcome to GYWS Admin Panel</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          This administrative dashboard allows you to manage all aspects of Gopali Youth Welfare Society's 
          operations, including blog content management.
        </p>
        {currentUser && (
          <div className="mt-4 bg-orange-50 inline-block px-6 py-2 rounded-full">
            <p className="text-orange-700">
              Logged in as: <span className="font-medium">{currentUser.firstName} {currentUser.lastName}</span>
            </p>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start">
          <div className="mr-4 mt-1">
            <FaBlog className="text-4xl text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Blog Management</h2>
            <p className="text-gray-600 mb-4">
              Create, edit, and manage blog posts for the GYWS website. Add content, images, and keep 
              your community updated with the latest news and events.
            </p>
            <Link 
              to="/blogs" 
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Manage Blogs
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">About GYWS</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Gopali Youth Welfare Society is a registered voluntary non-governmental organization run by IIT Kharagpur 
          students along with faculty members and support from local members of Gopali. Our mission is to empower 
          youth through education, healthcare, and community development initiatives.
        </p>
      </div>
    </div>
  );
};

export default Home;