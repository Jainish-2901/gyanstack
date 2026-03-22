import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

export const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// --- FIX START ---
// Check if any apps are already initialized. 
// If yes, use the existing one. If not, initialize a new one.
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
// --- FIX END ---

export const messaging = getMessaging(app);
export default app;