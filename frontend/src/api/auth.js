import axios from "axios";

// Gunakan environment variable untuk production, fallback ke localhost untuk development
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      confPassword: userData.confPassword, // Pastikan ini dikirim
      role: userData.role,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (loginData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email: loginData.email,
      password: loginData.password,
    });
    return response;
  } catch (error) {
    throw error;
  }
};
