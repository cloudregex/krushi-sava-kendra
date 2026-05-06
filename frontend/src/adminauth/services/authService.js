import api from '../utils/api';

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { data, status } = response.data;
      if (status && data && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        return data;
      }
      return null;
    } catch (error) {
      // Handle the error structure from errorHandler.js
      const errorData = error.response?.data;
      throw errorData?.errors ? Object.values(errorData.errors)[0] : { message: 'Network Error' };
    }
  },

  register: async (adminData) => {
    try {
      const response = await api.post('/auth/register', adminData);
      return response.data.data;
    } catch (error) {
      const errorData = error.response?.data;
      throw errorData?.errors ? Object.values(errorData.errors)[0] : { message: 'Network Error' };
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data.data;
    } catch (error) {
      const errorData = error.response?.data;
      throw errorData?.errors ? Object.values(errorData.errors)[0] : { message: 'Network Error' };
    }
  },

  checkAdminExists: async () => {
    try {
      const response = await api.get('/auth/check-admin');
      return response.data.data.exists;
    } catch (error) {
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authService;
