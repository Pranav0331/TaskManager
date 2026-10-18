import api from './api';

// Lightweight in-memory request deduplication & cache
const cache = new Map();
const inFlight = new Map();
const CACHE_TTL_MS = 60000; // 60 seconds
let lastLoadedTasks = null;
let lastLoadedStats = null;

const SESSION_CACHE_PREFIX = 'taskflow_session_';

const getCurrentUserId = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return 'anon';
    const parsed = JSON.parse(userStr);
    return parsed?._id || parsed?.id || 'anon';
  } catch {
    return 'anon';
  }
};

const readSessionCache = (subKey) => {
  try {
    if (typeof sessionStorage === 'undefined') return null;
    const userId = getCurrentUserId();
    if (userId === 'anon') return null;
    const raw = sessionStorage.getItem(`${SESSION_CACHE_PREFIX}${userId}_${subKey}`);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry || typeof entry !== 'object' || !entry.timestamp) return null;
    // Expire session cache entries after 5 minutes
    if (Date.now() - entry.timestamp > 5 * 60 * 1000) return null;
    return entry.data;
  } catch {
    return null;
  }
};

const writeSessionCache = (subKey, data) => {
  try {
    if (typeof sessionStorage === 'undefined') return;
    const userId = getCurrentUserId();
    if (userId === 'anon') return;
    sessionStorage.setItem(
      `${SESSION_CACHE_PREFIX}${userId}_${subKey}`,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {}
};

const clearSessionCache = () => {
  try {
    if (typeof sessionStorage === 'undefined') return;
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(SESSION_CACHE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch {}
};

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

      // Track last loaded tasks array and persist to session storage
      if (url === '/tasks' && Array.isArray(response.data?.data)) {
        lastLoadedTasks = response.data.data;
        writeSessionCache('tasks', lastLoadedTasks);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('taskflow_tasks_updated', { detail: lastLoadedTasks })
          );
        }
      }

      // Track last loaded stats and persist to session storage
      if (url === '/tasks/stats' && response.data?.data) {
        lastLoadedStats = response.data.data;
        writeSessionCache('stats', lastLoadedStats);
      }

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
  // Invalidate persisted session tasks/stats on mutations
  try {
    if (typeof sessionStorage !== 'undefined') {
      const userId = getCurrentUserId();
      if (userId !== 'anon') {
        sessionStorage.removeItem(`${SESSION_CACHE_PREFIX}${userId}_tasks`);
        sessionStorage.removeItem(`${SESSION_CACHE_PREFIX}${userId}_stats`);
      }
    }
  } catch {}
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

  googleLogin: async (credential) => {
    const response = await api.post(
      '/auth/google',
      { credential },
      { headers: { 'Content-Type': 'application/json' } }
    );
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

  getStats: async (params = {}) => {
    const tzOffset = new Date().getTimezoneOffset();
    return await cachedGet('/tasks/stats', { tzOffset, ...params });
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
  clearUserCache: () => {
    cache.clear();
    inFlight.clear();
    lastLoadedTasks = null;
    lastLoadedStats = null;
    clearSessionCache();
  },
  getCachedTasks: () => {
    if (Array.isArray(lastLoadedTasks)) return lastLoadedTasks;
    const sessionTasks = readSessionCache('tasks');
    if (Array.isArray(sessionTasks)) {
      lastLoadedTasks = sessionTasks;
      return sessionTasks;
    }
    return null;
  },
  getCachedStats: () => {
    if (lastLoadedStats) return lastLoadedStats;
    const sessionStats = readSessionCache('stats');
    if (sessionStats && typeof sessionStats === 'object') {
      lastLoadedStats = sessionStats;
      return sessionStats;
    }
    return null;
  },
  hasCachedDashboardData: () => {
    const tasks = taskService.getCachedTasks();
    const stats = taskService.getCachedStats();
    return Boolean(Array.isArray(tasks) && stats);
  },
};
