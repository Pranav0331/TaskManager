/* eslint-disable no-restricted-globals */

// Service Worker for TaskFlow Web Push Notifications
const CACHE_NAME = 'taskflow-sw-v1';

self.addEventListener('install', (event) => {
  // Activate worker immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim any clients immediately
  event.waitUntil(self.clients.claim());
});

// Push Event: Handle incoming web push notifications even when tab/browser is closed
self.addEventListener('push', (event) => {
  let data = {
    title: 'TaskFlow Notification',
    body: 'You have a new update in TaskFlow.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'taskflow-default',
    data: {
      url: '/dashboard',
    },
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const notificationOptions = {
    body: data.body || '',
    icon: data.icon || '/favicon.svg',
    badge: data.badge || '/favicon.svg',
    tag: data.tag ? `${data.tag}-${Date.now()}` : `taskflow-${Date.now()}`,
    renotify: true,
    data: data.data || { url: '/dashboard' },
    vibrate: data.vibrate || [100, 50, 100],
    actions: data.actions || [
      {
        action: 'open',
        title: 'Open App',
      },
    ],
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'TaskFlow', notificationOptions)
  );
});

// Notification Click Event: Focus or open window and navigate to task
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If an open window already exists, focus it and navigate
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            if ('navigate' in client && targetUrl) {
              client.navigate(targetUrl);
            }
            return client;
          }
        }
        // If no window is open, open a new browser window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
