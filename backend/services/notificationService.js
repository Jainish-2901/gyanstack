const admin = require('firebase-admin');
const User = require('../models/userModel');

// Initialize with your service account JSON
// Pre-caution: Use env variables for sensitive keys or path to JSON
const serviceAccount = require("../config/serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

exports.sendNotificationToAll = async (title, body) => {
    try {
        // 1. Get all users who have a registered token
        const users = await User.find({ fcmToken: { $ne: '' } }).select('fcmToken');
        const tokens = users.map(u => u.fcmToken);

        if (tokens.length === 0) return;

        const message = {
            notification: { title, body },
            tokens: tokens, // Multicast sends to many at once
        };

        // 2. Send via Firebase
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`${response.successCount} notifications sent successfully`);

        // 3. Cleanup: If a token is "Not Registered", it means the user uninstalled the PWA
        // You can add logic here to remove dead tokens from your DB
    } catch (error) {
        console.error("Firebase Admin Error:", error);
    }
};