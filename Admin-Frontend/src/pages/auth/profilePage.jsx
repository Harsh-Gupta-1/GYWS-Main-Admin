import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, loading, error: authError, updateProfile, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  
  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Initialize form data when user data is loaded
  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || ''
      });
    }
  }, [currentUser]);
  
  // Set any auth errors from context
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // Handle profile form input changes
  const handleProfileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle password form input changes
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  // Submit profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    const success = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
      showSuccessMessage('Profile updated successfully');
    }
  };

  // Submit password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setError('New passwords do not match');
    }

    const success = await updatePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    
    if (success) {
      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      showSuccessMessage('Password changed successfully');
    }
  };

  // Show success message for 3 seconds
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Cancel editing
  const cancelEdit = () => {
    setFormData({
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
      email: currentUser.email || ''
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p>{successMessage}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-orange-500 text-white p-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-24 h-24 rounded-full bg-orange-300 flex items-center justify-center text-white text-4xl font-bold mb-4 md:mb-0 md:mr-6">
              {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{currentUser?.firstName} {currentUser?.lastName}</h2>
              <p className="text-orange-100">{currentUser?.role}</p>
              <p className="text-orange-100 flex items-center mt-1">
                <FaEnvelope className="mr-2" /> {currentUser?.email}
              </p>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile Details
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'password'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('password')}
            >
              Change Password
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit className="mr-1" /> Edit
                  </button>
                ) : null}
              </div>
              
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">First Name</p>
                      <p className="text-gray-800 font-medium">{currentUser?.firstName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Name</p>
                      <p className="text-gray-800 font-medium">{currentUser?.lastName}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="text-gray-800 font-medium">{currentUser?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="text-gray-800 font-medium">{currentUser?.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Created</p>
                    <p className="text-gray-800 font-medium">
                      {currentUser?.createdAt && new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleProfileChange}
                        className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full py-2 sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleProfileChange}
                        className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full py-2 sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleProfileChange}
                      className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full py-2 sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      <FaTimes className="mr-2 -ml-1" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      <FaCheck className="mr-2 -ml-1" />
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Change Password</h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full py-2 sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    minLength="6"
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full py-2 sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    minLength="6"
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full py-2 sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    <FaLock className="mr-2 -ml-1" />
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;