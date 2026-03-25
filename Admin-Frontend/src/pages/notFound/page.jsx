import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-orange-100 p-5 rounded-full">
            <FaExclamationTriangle className="text-orange-500 text-6xl" />
          </div>
        </div>
        
        <h1 className="text-9xl font-bold text-orange-500 tracking-widest">404</h1>
        
        <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-md inline-block mb-5 mt-4">
          Page Not Found
        </div>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        
        <Link 
          to="/home" 
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-md inline-flex items-center transition-colors"
        >
          <FaHome className="mr-2" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;