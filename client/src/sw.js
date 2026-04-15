import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

// Navigation route handling (for PWA)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'navigation-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24, // 1 day
      }),
    ],
  })
);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
onBackgroundMessage(messaging, (payload) => {
  
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const title = payload.notification?.title || payload.data?.title;
  const body = payload.notification?.body || payload.data?.body;

  if (!payload.data?.announcementId) {
    fetch(`${backendUrl}/stats/track-external-pulse`, { 
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'sent',
        title: title,
        content: body
      })
    }).catch(err => console.error("SW: Failed to track external sent:", err));
  }

  self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(clients => clients.forEach(c => c.postMessage({ type: 'PLAY_NOTIFICATION_SOUND' })));

  if (payload.notification) {
    return;
  }

  const notificationTitle = title || 'GyanStack Update';
  const notificationOptions = {
    body: body || 'Check the latest updates on GyanStack.',
    icon: '/logo.png',
    badge: '/pwa-192x192-v2.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data;
  const announcementId = data?.announcementId;
  const targetUrl = data?.url || 'https://gyanstack.vercel.app/announcements';

  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  
  if (announcementId) {
    fetch(`${backendUrl}/announcements/${announcementId}/track-open`, { 
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }).catch(err => console.error("SW: Failed to track specific open:", err));
  } else {
    fetch(`${backendUrl}/stats/track-external-pulse`, { 
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'open' })
    }).catch(err => console.error("SW: Failed to track external open:", err));
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
