import { Router } from 'express';
import {
  getVapidPublicKey,
  subscribe,
  unsubscribe,
  sendTestNotification,
  getPreferences,
  updatePreferences,
  triggerDeadlineCheck,
  getRegisteredDevices,
  removeDevice,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Public route to fetch server public key
router.get('/vapid-public-key', getVapidPublicKey);

// Protected routes
router.post('/subscribe', protect, subscribe);
router.post('/unsubscribe', protect, unsubscribe);
router.post('/test', protect, sendTestNotification);
router.get('/preferences', protect, getPreferences);
router.put('/preferences', protect, updatePreferences);
router.get('/devices', protect, getRegisteredDevices);
router.delete('/devices/:id', protect, removeDevice);
router.post('/check-deadlines', protect, triggerDeadlineCheck);

export default router;
