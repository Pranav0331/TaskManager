import webpush from 'web-push';

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@taskflow.app';

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    console.log('✅ Web Push VAPID keys successfully configured');
  } catch (error) {
    console.error('❌ Error configuring Web Push VAPID details:', error.message);
  }
} else {
  console.warn('⚠️ Web Push VAPID keys not configured in environment. Push notifications will not be sent.');
}

export { webpush, vapidPublicKey, vapidSubject };
export default webpush;
