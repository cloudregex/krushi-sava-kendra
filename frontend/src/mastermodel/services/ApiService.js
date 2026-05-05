import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const ApiService = {
  getAll: async (module) => {
    try {
      const response = await api.get(`/${module}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${module}:`, error);
      throw error;
    }
  },

  getById: async (module, id) => {
    try {
      const response = await api.get(`/${module}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${module} with id ${id}:`, error);
      throw error;
    }
  },

  add: async (module, data) => {
    try {
      const response = await api.post(`/${module}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error adding ${module}:`, error);
      throw error;
    }
  },

  update: async (module, id, data) => {
    try {
      const response = await api.put(`/${module}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating ${module} with id ${id}:`, error);
      throw error;
    }
  },

  delete: async (module, id) => {
    try {
      const response = await api.delete(`/${module}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting ${module} with id ${id}:`, error);
      throw error;
    }
  },

  save: async (module, data) => {
    try {
      if (data.id) {
        const response = await api.put(`/${module}/${data.id}`, data);
        return response.data;
      } else {
        const response = await api.post(`/${module}`, data);
        return response.data;
      }
    } catch (error) {
      console.error(`Error saving ${module}:`, error);
      throw error;
    }
  }
};
