import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use the environment variable for API URL
  const apiUrl = import.meta.env.VITE_API_URL;

  // Load user on first render
  useEffect(() => {
    loadUser();
  }, []);

  // Load user from API
  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      const res = await axios.get(`${apiUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Transform backend data to match frontend expectations
      const userData = res.data.data;
      const transformedUser = {
        ...userData,
        firstName: userData.name?.split(' ')[0] || '',
        lastName: userData.name?.split(' ').slice(1).join(' ') || '',
        role: userData.is_admin ? 'Admin' : 'Member',
        createdAt: userData.createdAt
      };
      
      setCurrentUser(transformedUser);
      setLoading(false);
    } catch (err) {
      // If token is invalid, remove it
      localStorage.removeItem('token');
      setCurrentUser(null);
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await axios.post(`${apiUrl}/auth/login`, 
        { email, password }
      );
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      await loadUser();
      return true;
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Login failed');
      } else {
        setError('Failed to connect to server');
      }
      return false;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.get(`${apiUrl}/auth/logout`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  // Update user details
  const updateProfile = async (userData) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      
      // Transform frontend data to match backend expectations
      const backendData = {
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        email: userData.email
      };
      
      const res = await axios.put(`${apiUrl}/auth/updatedetails`, 
        backendData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Transform response back to frontend format
      const updatedUser = res.data.data;
      const transformedUser = {
        ...updatedUser,
        firstName: updatedUser.name?.split(' ')[0] || '',
        lastName: updatedUser.name?.split(' ').slice(1).join(' ') || '',
        role: updatedUser.is_admin ? 'Admin' : 'Member',
        createdAt: updatedUser.createdAt
      };
      
      setCurrentUser(transformedUser);
      return true;
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Update failed');
      } else {
        setError('Failed to connect to server');
      }
      return false;
    }
  };

  // Update password
  const updatePassword = async (passwordData) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${apiUrl}/auth/updatepassword`, 
        passwordData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update token if backend returns a new one
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return true;
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Password update failed');
      } else {
        setError('Failed to connect to server');
      }
      return false;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    updateProfile,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);