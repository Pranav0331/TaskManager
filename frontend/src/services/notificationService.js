import api from './api';

export const notificationService = {
  /**
   * Fetch backend VAPID public key
   */
  getVapidPublicKey: async () => {
    const response = await api.get('/notifications/vapid-public-key');
    return response.data;
  },

  /**
   * Register push subscription with backend
   */
  subscribe: async (subscription) => {
    const subJSON = subscription.toJSON ? subscription.toJSON() : subscription;
    const response = await api.post('/notifications/subscribe', {
      endpoint: subJSON.endpoint,
      expirationTime: subJSON.expirationTime,
      keys: subJSON.keys,
      userAgent: navigator.userAgent,
    });
    return response.data;
  },

  /**
   * Remove push subscription from backend
   */
  unsubscribe: async (endpoint) => {
    const response = await api.post('/notifications/unsubscribe', { endpoint });
    return response.data;
  },

  /**
   * Dispatch instant test push notification
   */
  sendTestNotification: async () => {
    const response = await api.post('/notifications/test');
    return response.data;
  },

  /**
   * Get current user's notification preferences
   */
  getPreferences: async () => {
    const response = await api.get('/notifications/preferences');
    return response.data;
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (preferences) => {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
  },

  /**
   * Trigger manual check for due dates & overdue tasks
   */
  triggerDeadlineCheck: async () => {
    const response = await api.post('/notifications/check-deadlines');
    return response.data;
  },

  /**
   * Get list of all registered push devices
   */
  getRegisteredDevices: async () => {
    const response = await api.get('/notifications/devices');
    return response.data;
  },

  /**
   * Remove/revoke a registered push device
   */
  removeDevice: async (id) => {
    const response = await api.delete(`/notifications/devices/${id}`);
    return response.data;
  },
};

export default notificationService;
