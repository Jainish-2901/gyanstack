import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAuth, GoogleAuthProvider, browserPopupRedirectResolver, useDeviceLanguage } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";
export { logEvent };
import api from "./services/api";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const analytics = (typeof window !== 'undefined' && 
                          import.meta.env.VITE_FIREBASE_MEASUREMENT_ID && 
                          import.meta.env.VITE_FIREBASE_MEASUREMENT_ID !== 'PASTE_YOUR_G_ID_HERE') 
                          ? getAnalytics(app) : null;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const requestForToken = async () => {
  try {
    if (!import.meta.env.VITE_FIREBASE_API_KEY || !import.meta.env.VITE_VAPID_PUBLIC_KEY) {
      console.error("Firebase config or VAPID key is missing! Check Vercel environment variables.");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      
      const registration = await navigator.serviceWorker.ready;
      
      const currentToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
        serviceWorkerRegistration: registration,
      });

      if (currentToken) {
        try {
          await api.post("/announcements/subscribe", { fcmToken: currentToken });
        } catch (apiErr) {
          console.error("Failed to send token to backend:", apiErr.message);
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

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export default app;
