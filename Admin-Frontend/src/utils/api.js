const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper function to get the full API URL
const getApiUrl = (endpoint) => {
  // Remove any leading slashes from the endpoint to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export const api = {
  // Generic request method
  request: async (endpoint, options = {}) => {
    const url = getApiUrl(endpoint);
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include', // Important for cookies if using session-based auth
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Something went wrong');
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // GET request
  get: (endpoint, options = {}) => 
    api.request(endpoint, { ...options, method: 'GET' }),

  // POST request
  post: (endpoint, data = {}, options = {}) =>
    api.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // PUT request
  put: (endpoint, data = {}, options = {}) =>
    api.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // DELETE request
  delete: (endpoint, options = {}) =>
    api.request(endpoint, { ...options, method: 'DELETE' }),

  // File upload
  upload: (endpoint, file, fieldName = 'file', data = {}) => {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // Append additional data if provided
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    return api.request(endpoint, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let the browser set it with the correct boundary
      headers: {},
    });
  },
};

export default api;
