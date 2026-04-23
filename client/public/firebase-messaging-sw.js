importScripts('https://www.gstatic.com/firebasejs/9.1.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.1.1/firebase-messaging-compat.js');

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

const urlParams = new URLSearchParams(self.location.search);

firebase.initializeApp({
    apiKey: urlParams.get('apiKey'),
    authDomain: urlParams.get('authDomain'),
    projectId: urlParams.get('projectId'),
    storageBucket: urlParams.get('storageBucket'),
    messagingSenderId: urlParams.get('messagingSenderId'),
    appId: urlParams.get('appId'),
    measurementId: urlParams.get('measurementId')
});

const messaging = firebase.messaging();

const notifyClients = async (type) => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clients.forEach(client => client.postMessage({ type }));
};

messaging.onBackgroundMessage((payload) => {
    notifyClients('PLAY_NOTIFICATION_SOUND');

    if (payload.notification) {
        console.log("FCM: Browser will handle display for this notification.");
        return;
    }

    const notificationTitle = payload.data?.title || 'GyanStack';
    const notificationOptions = {
        body: payload.data?.body || 'New update available.',
        icon: '/logo.png',
        badge: '/pwa-192x192-v2.png',
        data: { url: payload.data?.url || '/announcements' },
        tag: 'gyanstack-announcement'
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    let targetUrl = event.notification.data?.url || '/announcements';

    if (targetUrl.startsWith('/')) {
        targetUrl = new URL(targetUrl, self.location.origin).href;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let client of windowClients) {
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }

            for (let client of windowClients) {
                if (client.url.includes(self.location.origin) && 'navigate' in client) {
                    client.focus();
                    return client.navigate(targetUrl);
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});