importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// NOTE: Firebase config yahaan se load hoga. Yeh config aapke .env se aana chahiye.
// Apne actual keys yahaan daalein ya server se inject karein.
const firebaseConfig = {
    apiKey: $import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: $import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: $import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: $import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: $import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: $import.meta.env.VITE_FIREBASE_APP_ID,
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Background mein notification handle karna
messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/assets/logo.png'
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});