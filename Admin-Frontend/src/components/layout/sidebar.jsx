import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaBlog, FaBars, FaTimes, FaUserCircle, FaUsers } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const SidebarItem = ({ to, icon, text, isActive }) => {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'text-orange-600 font-medium border-l-4 border-orange-600 bg-orange-50' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <div className="text-xl">{icon}</div>
      <span>{text}</span>
    </Link>
  );
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    if (currentUser) {
      setShowProfileDropdown(!showProfileDropdown);
    }
  };

  const navItems = [
    { to: '/home', icon: <FaHome />, text: 'HOME' },
    { to: '/blogs', icon: <FaBlog />, text: 'BLOGS' },
    { to: '/members', icon: <FaUsers />, text: 'MEMBERS' },
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-orange-500 text-white rounded-md"
        onClick={toggleSidebar}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed left-0 top-0 h-lvh bg-white border-r border-orange-100 flex flex-col z-40
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:w-64 md:sticky md:top-0 md:z-0
        `}
      >
        {/* Logo and header */}
        <div className="p-4 bg-white text-orange-600 border-b border-orange-100">
          <Link to="/" className="text-xl font-bold flex items-center">
            <img src="/logo.png" alt="GYWS Logo" className="w-8 h-8 mr-2" />
            GYWS Admin
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-2">
          {navItems.map((item) => (
            <SidebarItem 
              key={item.to}
              to={item.to}
              icon={item.icon}
              text={item.text}
              isActive={location.pathname === item.to || (item.to === '/home' && location.pathname === '/')}
            />
          ))}
        </nav>
        
        {/* User profile section - Moved to bottom */}
        <div className="p-4 border-t border-orange-100 mt-auto">
          {currentUser ? (
            <div className="relative">
              <div 
                className="flex items-center cursor-pointer"
                onClick={handleProfileClick}
              >
                <div className="w-10 h-10 rounded-full bg-orange-300 flex items-center justify-center text-xl border-2 border-orange-400 mr-3">
                  {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {currentUser.firstName} {currentUser.lastName}
                  </p>
                </div>
              </div>

              {/* Profile dropdown */}
              {showProfileDropdown && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-md shadow-lg overflow-hidden z-50">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-gray-800 hover:bg-orange-100"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    Profile
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setShowProfileDropdown(false);
                    }} 
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-orange-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-md transition-colors text-white flex items-center justify-center"
            >
              <FaUserCircle className="mr-2" />
              Login
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;