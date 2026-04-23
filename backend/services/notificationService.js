const admin = require('firebase-admin');
const User = require('../models/userModel');
const serviceAccount = require("../config/serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

exports.sendNotificationToAll = async (title, body, announcementId, redirectLink) => {
    try {
        const users = await User.find({ fcmToken: { $ne: '' } }).select('fcmToken');
        const tokens = users.map(u => u.fcmToken);

        if (tokens.length === 0) return 0;

        const baseUrl = "https://gyanstack.vercel.app";
        const targetLink = redirectLink
            ? (redirectLink.startsWith('http') ? redirectLink : `${baseUrl}${redirectLink}`)
            : `${baseUrl}/announcements/${announcementId}`;

        const message = {
            notification: {
                title: title,
                body: body
            },
            data: {
                announcementId: announcementId || '',
                link: targetLink,
                sound: 'notification_ping.mp3'
            },
            android: {
                priority: 'high',
                notification: {
                    title: title,
                    body: body,
                    icon: 'stock_ticker_update',
                    color: '#10b981',
                    sound: 'notification_ping'
                }
            },
            webpush: {
                notification: {
                    title: title,
                    body: body,
                    icon: `${baseUrl}/logo.png`,
                    image: `${baseUrl}/og-banner.png`,
                    badge: `${baseUrl}/logo.png`,
                    click_action: targetLink,
                    silent: false
                },
                fcm_options: {
                    link: targetLink,
                }
            },
            tokens: tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        console.log(`Successfully dispatched to ${response.successCount} devices.`);
        return response.successCount;

    } catch (error) {
        console.error("Firebase Admin Error:", error);
        return 0;
    }
};