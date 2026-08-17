import api from './api';

export const authService = {
  register: async (data) => {
    const response = await api.post('/auth/register', data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  verifyOtp: async (data) => {
    const response = await api.post('/auth/verify-otp', data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  resendOtp: async (data) => {
    const response = await api.post('/auth/resend-otp', data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  login: async (data) => {
    const payload = {
      email: (data?.email || '').trim(),
      password: data?.password || '',
    };
    const response = await api.post('/auth/login', payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const taskService = {
  getTasks: async (params = {}) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/tasks/stats');
    return response.data;
  },

  getTask: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (data) => {
    const response = await api.post('/tasks', data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  updateTask: async (id, data) => {
    const response = await api.put(`/tasks/${id}`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};
