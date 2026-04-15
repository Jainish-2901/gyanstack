importScripts('https://www.gstatic.com/firebasejs/9.1.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.1.1/firebase-messaging-compat.js');

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

/**
 * Sends a message to all active client windows.
 * The NotificationBell component listens for PLAY_NOTIFICATION_SOUND
 * and plays the custom ping audio via AudioContext (which is allowed
 * after the user has previously interacted with the page).
 */
const notifyClients = async (type) => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clients.forEach(client => client.postMessage({ type }));
};

messaging.onBackgroundMessage((payload) => {
    // Signal all active tabs to play the sound
    notifyClients('PLAY_NOTIFICATION_SOUND');

    const notificationTitle = payload.notification?.title || payload.data?.title || 'GyanStack';
    const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || 'You have a new update.',
        icon: '/logo.png',
        badge: '/pwa-192x192-v2.png',
        data: payload.data,
        // Note: 'sound' property in showNotification() was removed from browsers.
        // Custom sounds must be played via postMessage → client AudioContext.
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});