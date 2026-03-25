import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

const CreateMember = ({ member, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [positions, setPositions] = useState([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '12345678',
    roll_number: '',
    hall: '',
    phone_numbers: [''],
    positions: [{ year: new Date().getFullYear(), position_id: '' }],
    social_media_links: {
      linkedin: '',
      facebook: ''
    },
    is_admin: false,
    show_in_website: true
  });

  // Hall options
  const hallOptions = [
    'Atal Bihari Vajpayee Hall of Residence',
    'Azad Hall of Residence', 
    'BC Roy Hall of Residence',
    'B R Ambedkar Hall of Residence',
    'Gokhale Hall of Residence',
    'Homi J Bhabha Hall of Residence',
    'Jagadish Chandra Bose Hall of Residence',
    'Nehru Hall of Residence',
    'Lal Bahadur Shastri Hall of Residence',
    'Lala Lajpat Rai Hall of Residence',
    'Madan Mohan Malaviya Hall of Residence',
    'Megnad Saha Hall of Residence',
    'Mother Teresa Hall of Residence',
    'Nivedita Hall of Residence',
    'PDF Block',
    'Patel Hall of Residence',
    'Radha Krishnan Hall of Residence',
    'Rani Laxmibai Hall of Residence',
    'Rajendra Prasad Hall of Residence',
    'SAM Hall of Residence',
    'SAM Guest House',
    'Savitribai Phule Hall of Residence - Block One',
    'Savitribai Phule Hall of Residence - Block Two',
    'Sarojini Naidu - Indira Gandhi Hall of Residence',
    'Vishveriya Guest House',
    'VSRC-1',
    'VSRC-2',
    'Vidyasagar Hall of Residence',
    'Zakir Hussain Hall of Residence'
  ];

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = [
    currentYear - 8,
    currentYear - 7,
    currentYear - 6,
    currentYear - 5,
    currentYear - 4,
    currentYear - 3,
    currentYear - 2,
    currentYear - 1,
    currentYear
  ];

  // Fetch positions from API
  const fetchPositions = async () => {
    try {
      setLoadingPositions(true);
      const response = await api.get('/members/positions');
      setPositions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast.error('Failed to load positions. Please refresh the page and try again.');
    } finally {
      setLoadingPositions(false);
    }
  };

  // Load positions on component mount
  useEffect(() => {
    fetchPositions();
  }, []);

  // Effect to populate form when member prop changes (edit mode)
  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        password: '',
        roll_number: member.roll_number || '',
        hall: member.hall || '',
        phone_numbers: member.phone_numbers && member.phone_numbers.length > 0 ? member.phone_numbers : [''],
        positions: member.positions && member.positions.length > 0 ? 
          member.positions.map(pos => ({ 
            year: pos.year, 
            position_id: typeof pos.position_id === 'object' ? pos.position_id._id : pos.position_id 
          })) :
          [{ year: currentYear, position_id: '' }],
        social_media_links: {
          linkedin: member.social_media_links?.linkedin || '',
          facebook: member.social_media_links?.facebook || ''
        },
        is_admin: member.is_admin || false,
        show_in_website: member.show_in_website !== undefined ? member.show_in_website : true
      });
      
      if (member.photo_url) {
        setPhotoPreview(member.photo_url);
      }
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, or GIF)');
        return;
      }
      
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setPhotoFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove photo
  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    const fileInput = document.getElementById('photo');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Handle phone number changes
  const handlePhoneChange = (index, value) => {
    const newPhones = [...formData.phone_numbers];
    newPhones[index] = value;
    setFormData(prev => ({
      ...prev,
      phone_numbers: newPhones
    }));
  };

  // Add phone number field
  const addPhoneNumber = () => {
    setFormData(prev => ({
      ...prev,
      phone_numbers: [...prev.phone_numbers, '']
    }));
  };

  // Remove phone number field
  const removePhoneNumber = (index) => {
    if (formData.phone_numbers.length > 1) {
      const newPhones = formData.phone_numbers.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        phone_numbers: newPhones
      }));
    }
  };

  // Handle position changes
  const handlePositionChange = (index, field, value) => {
    const newPositions = [...formData.positions];
    newPositions[index][field] = field === 'year' ? parseInt(value) : value;
    setFormData(prev => ({
      ...prev,
      positions: newPositions
    }));
  };

  // Add position field
  const addPosition = () => {
    setFormData(prev => ({
      ...prev,
      positions: [...prev.positions, { year: currentYear, position_id: '' }]
    }));
  };

  // Remove position field
  const removePosition = (index) => {
    if (formData.positions.length > 1) {
      const newPositions = formData.positions.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        positions: newPositions
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const submitData = new FormData();
      
      const cleanedData = {
        ...formData,
        phone_numbers: formData.phone_numbers.filter(phone => phone.trim() !== ''),
        positions: formData.positions.filter(pos => pos.position_id !== '')
      };

      if (!cleanedData.password || cleanedData.password.trim() === '') {
        delete cleanedData.password;
      }

      Object.keys(cleanedData).forEach(key => {
        if (key === 'social_media_links') {
          Object.keys(cleanedData[key]).forEach(socialKey => {
            if (cleanedData[key][socialKey]) {
              submitData.append(`social_media_links[${socialKey}]`, cleanedData[key][socialKey]);
            }
          });
        } else if (key === 'phone_numbers' || key === 'positions') {
          submitData.append(key, JSON.stringify(cleanedData[key]));
        } else {
          submitData.append(key, cleanedData[key]);
        }
      });

      if (photoFile) {
        submitData.append('photo', photoFile);
      }

      let response;
      if (member) {
        response = await api.put(`/members/${member._id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await api.post('/members', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.data.success) {
        toast.success(`Member ${member ? 'updated' : 'created'} successfully!`);
        
        if (onSuccess) {
          onSuccess(response.data.data);
        }
        
        setTimeout(() => {
          navigate('/members');
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Operation failed');
      }
      
    } catch (error) {
      console.error('Error submitting member:', error);
      
      if (error.response) {
        const errorMessage = error.response.data.message || error.response.data.error || 'Server error occurred';
        if (error.response.data.errors) {
          toast.error(`Validation errors: ${error.response.data.errors.join(', ')}`);
        } else {
          toast.error(`Error: ${errorMessage}`);
        }
      } else if (error.request) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error(error.message || 'An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Group positions by team for better UX
  const positionsByTeam = positions.reduce((acc, position) => {
    if (!acc[position.team]) {
      acc[position.team] = [];
    }
    acc[position.team].push(position);
    return acc;
  }, {});

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 py-6 px-6 sticky top-0 z-10 shadow-md">
        <h1 className="text-2xl font-bold text-white">
          {member ? 'Edit Member' : 'Add New Member'}
        </h1>
        <p className="text-orange-100 mt-1">
          {member 
            ? 'Update member information and positions' 
            : 'Register a new member with their details and positions'}
        </p>
      </div>

      <div className="p-6 pt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-orange-800 mb-4 flex items-center">
              Basic Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-orange-700 font-medium">
                  Full Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-orange-700 font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address (optional)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="roll_number" className="block text-orange-700 font-medium">
                  Roll Number
                </label>
                <input
                  type="text"
                  id="roll_number"
                  name="roll_number"
                  value={formData.roll_number}
                  onChange={handleChange}
                  placeholder="Enter roll number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="hall" className="block text-orange-700 font-medium">
                  Hall of Residence
                </label>
                <div className="relative">
                  <select
                    id="hall"
                    name="hall"
                    value={formData.hall}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 appearance-none"
                  >
                    <option value="">Select Hall (optional)</option>
                    {hallOptions.map((hall) => (
                      <option key={hall} value={hall}>{hall}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {!member && (
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-orange-700 font-medium">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password (leave blank for default: 12345678)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  />
                  <p className="text-gray-500 text-sm">
                    If left blank, default password "12345678" will be used and automatically hashed
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-orange-800 mb-4">
              Profile Photo
            </h2>
            
            <div className="space-y-4">
              {photoPreview && (
                <div className="flex items-start space-x-4 max-w-md">
                  <div className="relative flex-shrink-0">
                    <img 
                      src={photoPreview} 
                      alt="Profile preview" 
                      className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="Remove photo"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 truncate">
                      Current profile photo. Click the × button to remove and upload a new one.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2 max-w-md">
                <label htmlFor="photo" className="block text-orange-700 font-medium">
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </label>
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                />
                <p className="text-gray-500 text-sm">
                  Supported formats: JPEG, PNG, GIF. Maximum size: 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Phone Numbers Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-orange-800">
                Phone Numbers
              </h2>
              <button
                type="button"
                onClick={addPhoneNumber}
                className="px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all duration-200 flex items-center text-sm"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Phone
              </button>
            </div>
            
            <div className="space-y-3 max-w-md">
              {formData.phone_numbers.map((phone, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(index, e.target.value)}
                    placeholder={`Phone number ${index + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  />
                  {formData.phone_numbers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhoneNumber(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Remove phone number"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Positions Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-orange-800">
                Positions
              </h2>
              <button
                type="button"
                onClick={addPosition}
                className="px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all duration-200 flex items-center text-sm"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Position
              </button>
            </div>
            
            {loadingPositions ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2 text-orange-600">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading positions...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.positions.map((position, index) => (
                  <div key={index} className="grid md:grid-cols-[150px_1fr_auto] gap-4 p-4 border border-gray-200 rounded-lg items-start">
                    <div className="space-y-2">
                      <label className="block text-orange-700 font-medium text-sm">
                        Year*
                      </label>
                      <div className="relative">
                        <select
                          value={position.year}
                          onChange={(e) => handlePositionChange(index, 'year', e.target.value)}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 appearance-none"
                        >
                          {yearOptions.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-orange-700 font-medium text-sm">
                        Position*
                      </label>
                      <div className="relative">
                        <select
                          value={position.position_id}
                          onChange={(e) => handlePositionChange(index, 'position_id', e.target.value)}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 appearance-none"
                        >
                          <option value="">Select Position</option>
                          {Object.keys(positionsByTeam).sort().map((team) => (
                            <optgroup key={team} label={team}>
                              {positionsByTeam[team].map((pos) => (
                                <option key={pos._id} value={pos._id}>
                                  {pos.pos_name}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {formData.positions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePosition(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 mt-8"
                        title="Remove position"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Social Media & Settings Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Social Media Links */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-orange-800 mb-4">
                Social Media Links
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="linkedin" className="block text-orange-700 font-medium">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    id="linkedin"
                    name="social_media_links.linkedin"
                    value={formData.social_media_links.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="facebook" className="block text-orange-700 font-medium">
                    Facebook
                  </label>
                  <input
                    type="url"
                    id="facebook"
                    name="social_media_links.facebook"
                    value={formData.social_media_links.facebook}
                    onChange={handleChange}
                    placeholder="https://facebook.com/username"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-orange-800 mb-4">
                Settings
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_admin"
                      name="is_admin"
                      checked={formData.is_admin}
                      onChange={handleChange}
                      disabled={!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)}
                      className={`h-4 w-4 ${!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'opacity-50 cursor-not-allowed' : 'accent-orange-500 text-orange-600'} focus:ring-orange-500 border-gray-300 rounded`}
                    />
                    <label 
                      htmlFor="is_admin" 
                      className={`ml-2 block font-medium ${!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'text-gray-400' : 'text-orange-700'}`}
                    >
                      Admin Access
                    </label>
                  </div>
                  {(!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) && (
                    <div className="ml-2 group relative">
                      <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="hidden group-hover:block absolute z-10 w-64 p-2 -ml-32 -mt-16 text-xs text-white bg-gray-800 rounded shadow-lg">
                        A valid email address is required to enable admin access
                      </div>
                    </div>
                  )}
                </div>
                <p className={`text-sm ${!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'text-gray-400' : 'text-gray-500'}`}>
                  {!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) 
                    ? 'Add a valid email to enable admin access' 
                    : 'Grant administrative privileges to this member'}
                </p>
                
                <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    id="show_in_website"
                    name="show_in_website"
                    checked={formData.show_in_website}
                    onChange={handleChange}
                    className="h-4 w-4 accent-orange-500 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="show_in_website" className="ml-2 block text-orange-700 font-medium">
                    Show in Website
                  </label>
                </div>
                <p className="text-gray-500 text-sm">
                  Display this member's profile on the public website
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {member ? 'Editing member: ' + member.name : 'All fields marked with * are required'}
            </div>
            
            <div className="flex space-x-4">
              <button 
                type="button" 
                onClick={onCancel}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all duration-200 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading || loadingPositions}
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
                  <>{member ? 'Update Member' : 'Add Member'}</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMember;