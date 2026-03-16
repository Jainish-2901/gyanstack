import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

// 1. Precaching (VitePWA automatically replaces self.__WB_MANIFEST with the manifest)
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// 2. Runtime Caching (Mimicking what was in vite.config.js)
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

// 3. Firebase Cloud Messaging (Merged Logic)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase in the SW
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Handle Background Messages
// NOTE: If the payload has a 'notification' object, the browser shows it automatically.
// We only manually show it if 'notification' is missing (Data-Only Message).
onBackgroundMessage(messaging, (payload) => {
  console.log('[sw.js] Background message received:', payload);
  
  // --- Track Sent Event (External campaign) ---
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

  if (payload.notification) {
    // Firebase SDK automatically shows notifications with 'notification' payload.
    // Manual call here would cause duplication.
    return;
  }

  // Handle Data-Only messages (optional fallback)
  const notificationTitle = title || 'GyanStack Update';
  const notificationOptions = {
    body: body || 'Check the latest updates on GyanStack.',
    icon: '/logo.png',
    badge: '/pwa-192x192.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 4. Handle Notification Clicks (Tracking)
self.addEventListener('notificationclick', (event) => {
  console.log('[sw.js] Notification clicked:', event);
  event.notification.close();

  const data = event.notification.data;
  const announcementId = data?.announcementId;
  // --- REDIRECT: Default to production announcements page ---
  const targetUrl = data?.url || 'https://gyanstack.vercel.app/announcements';

  // --- Track Open Event in Backend ---
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  
  if (announcementId) {
    // Specific Announcement Ping
    fetch(`${backendUrl}/announcements/${announcementId}/track-open`, { 
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }).catch(err => console.error("SW: Failed to track specific open:", err));
  } else {
    // Firebase Console / External Message Ping
    fetch(`${backendUrl}/stats/track-external-pulse`, { 
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'open' })
    }).catch(err => console.error("SW: Failed to track external open:", err));
  }

  // Open the Window
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Self-update listener
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
