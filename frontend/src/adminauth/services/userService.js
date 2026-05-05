import api from '../utils/api';

const userService = {
  getUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data.data;
    } catch (error) {
      const errorData = error.response?.data;
      throw errorData?.errors ? Object.values(errorData.errors)[0] : { message: 'Network Error' };
    }
  },

  addUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data.data;
    } catch (error) {
      const errorData = error.response?.data;
      throw errorData?.errors ? Object.values(errorData.errors)[0] : { message: 'Network Error' };
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data.data;
    } catch (error) {
      const errorData = error.response?.data;
      throw errorData?.errors ? Object.values(errorData.errors)[0] : { message: 'Network Error' };
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data.data;
    } catch (error) {
      const errorData = error.response?.data;
      throw errorData?.errors ? Object.values(errorData.errors)[0] : { message: 'Network Error' };
    }
  },
};

export default userService;
