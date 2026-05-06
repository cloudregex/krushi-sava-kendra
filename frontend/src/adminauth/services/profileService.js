import api from '../utils/api';

const profileService = {
  updatePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/update-password', { currentPassword, newPassword });
    return response.data;
  },

  getMyLogs: async () => {
    const response = await api.get('/activity-logs/me');
    return response.data;
  }
};

export default profileService;
