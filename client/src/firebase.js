import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import api from "./services/api";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    // Check if configuration is present
    if (!import.meta.env.VITE_FIREBASE_API_KEY || !import.meta.env.VITE_VAPID_PUBLIC_KEY) {
      console.error("Firebase config or VAPID key is missing! Check Vercel environment variables.");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");
      
      const swUrl = `/firebase-messaging-sw.js?apiKey=${import.meta.env.VITE_FIREBASE_API_KEY}&authDomain=${import.meta.env.VITE_FIREBASE_AUTH_DOMAIN}&projectId=${import.meta.env.VITE_FIREBASE_PROJECT_ID}&storageBucket=${import.meta.env.VITE_FIREBASE_STORAGE_BUCKET}&messagingSenderId=${import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID}&appId=${import.meta.env.VITE_FIREBASE_APP_ID}`;
      
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: '/firebase-cloud-messaging-push-scope', // Different scope to avoid PWA conflict
      });
      
      const currentToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
        serviceWorkerRegistration: registration,
      });

      if (currentToken) {
        console.log("FCM Token Generated successfully:", currentToken);
        // Backend ko token bhejein
        try {
          await api.post("/announcements/subscribe", { fcmToken: currentToken });
          console.log("Token sent to backend successfully.");
        } catch (apiErr) {
          console.error("Failed to send token to backend:", apiErr.message);
          // If URL is localhost in prod, this will fail
        }
        return currentToken;
      } else {
        console.warn("No registration token available. Request permission to generate one.");
      }
    } else {
      console.warn("Notification permission denied by user.");
    }
  } catch (err) {
    console.error("An error occurred while retrieving token: ", err);
  }
};

// Foreground message handler
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Message received in foreground:", payload);
      resolve(payload);
    });
  });

export default app;
