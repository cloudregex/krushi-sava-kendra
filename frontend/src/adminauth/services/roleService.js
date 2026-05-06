import api from '../utils/api';

const roleService = {
  getRoles: async () => {
    try {
      const response = await api.get('/roles');
      return response.data.data;
    } catch (error) {
      const errorData = error.response?.data;
      throw errorData?.errors ? Object.values(errorData.errors)[0] : { message: 'Network Error' };
    }
  },

  createRole: async (roleData) => {
    try {
      const response = await api.post('/roles', roleData);
      return response.data.data;
    } catch (error) {
      const errorData = error.response?.data;
      throw errorData?.errors ? Object.values(errorData.errors)[0] : { message: 'Network Error' };
    }
  },

  updateRole: async (id, roleData) => {
    try {
      const response = await api.put(`/roles/${id}`, roleData);
      return response.data.data;
    } catch (error) {
      const errorData = error.response?.data;
      throw errorData?.errors ? Object.values(errorData.errors)[0] : { message: 'Network Error' };
    }
  },

  deleteRole: async (id) => {
    try {
      const response = await api.delete(`/roles/${id}`);
      return response.data.data;
    } catch (error) {
      const errorData = error.response?.data;
      throw errorData?.errors ? Object.values(errorData.errors)[0] : { message: 'Network Error' };
    }
  },
};

export default roleService;
