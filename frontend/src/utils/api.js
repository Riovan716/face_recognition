// Utility untuk API URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper function untuk membuat URL API
export const createApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Export untuk backward compatibility
export default API_BASE_URL; 