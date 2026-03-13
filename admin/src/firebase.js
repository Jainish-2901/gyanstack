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
      console.log("Notification permission granted (Admin).");
      
      const swUrl = `/firebase-messaging-sw.js?apiKey=${import.meta.env.VITE_FIREBASE_API_KEY}&authDomain=${import.meta.env.VITE_FIREBASE_AUTH_DOMAIN}&projectId=${import.meta.env.VITE_FIREBASE_PROJECT_ID}&storageBucket=${import.meta.env.VITE_FIREBASE_STORAGE_BUCKET}&messagingSenderId=${import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID}&appId=${import.meta.env.VITE_FIREBASE_APP_ID}`;
      
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: '/firebase-cloud-messaging-push-scope-admin', // Different scope
      });

      const currentToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
        serviceWorkerRegistration: registration,
      });

      if (currentToken) {
        console.log("FCM Token (Admin):", currentToken);
        // Backend ko token bhejein
        try {
          await api.post("/announcements/subscribe", { fcmToken: currentToken });
          console.log("Admin token sent to backend.");
        } catch (apiErr) {
          console.error("Failed to send admin token to backend:", apiErr.message);
        }
        return currentToken;
      } else {
        console.warn("No registration token available.");
      }
    } else {
      console.warn("Notification permission denied by admin.");
    }
  } catch (err) {
    console.error("An error occurred while retrieving token: ", err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export default app;
