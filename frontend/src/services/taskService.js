import api from './api';

// Lightweight in-memory request deduplication & cache
const cache = new Map();
const inFlight = new Map();
const CACHE_TTL_MS = 15000; // 15 seconds

const getCacheKey = (url, params = {}) => {
  return `${url}?${JSON.stringify(params)}`;
};

const cachedGet = async (url, params = {}, ttl = CACHE_TTL_MS) => {
  const key = getCacheKey(url, params);
  const now = Date.now();

  const hit = cache.get(key);
  if (hit && now - hit.timestamp < ttl) {
    return hit.data;
  }

  // Deduplicate simultaneous requests
  if (inFlight.has(key)) {
    return inFlight.get(key);
  }

  const promise = (async () => {
    try {
      const response = await api.get(url, { params });
      cache.set(key, { data: response.data, timestamp: Date.now() });
      return response.data;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
};

const invalidateTaskCache = () => {
  cache.clear();
  inFlight.clear();
};

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
    invalidateTaskCache();
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post(
      '/auth/forgot-password',
      { email: (email || '').trim() },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  },

  verifyResetToken: async (token) => {
    const response = await api.get(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
    return response.data;
  },

  resetPassword: async (data) => {
    const response = await api.post('/auth/reset-password', data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },
};

export const taskService = {
  getTasks: async (params = {}) => {
    return await cachedGet('/tasks', params);
  },

  getStats: async () => {
    return await cachedGet('/tasks/stats');
  },

  getTask: async (id) => {
    return await cachedGet(`/tasks/${id}`);
  },

  createTask: async (data) => {
    const response = await api.post('/tasks', data, {
      headers: { 'Content-Type': 'application/json' },
    });
    invalidateTaskCache();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('taskflow_notifications_updated'));
    }
    return response.data;
  },

  updateTask: async (id, data) => {
    const response = await api.put(`/tasks/${id}`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
    invalidateTaskCache();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('taskflow_notifications_updated'));
    }
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    invalidateTaskCache();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('taskflow_notifications_updated'));
    }
    return response.data;
  },

  addSubtask: async (taskId, data) => {
    const response = await api.post(`/tasks/${taskId}/subtasks`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
    invalidateTaskCache();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('taskflow_notifications_updated'));
    }
    return response.data;
  },

  updateSubtask: async (taskId, subtaskId, data) => {
    const response = await api.put(`/tasks/${taskId}/subtasks/${subtaskId}`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
    invalidateTaskCache();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('taskflow_notifications_updated'));
    }
    return response.data;
  },

  toggleSubtask: async (taskId, subtaskId, status) => {
    const response = await api.patch(
      `/tasks/${taskId}/subtasks/${subtaskId}/toggle`,
      status ? { status } : {}
    );
    invalidateTaskCache();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('taskflow_notifications_updated'));
    }
    return response.data;
  },

  deleteSubtask: async (taskId, subtaskId) => {
    const response = await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
    invalidateTaskCache();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('taskflow_notifications_updated'));
    }
    return response.data;
  },

  invalidateCache: invalidateTaskCache,
};
