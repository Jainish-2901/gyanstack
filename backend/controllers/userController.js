const Subscription = require('../models/subscriptionModel'); // Token Model

// --- NAYA FUNCTION ---
// User Subscription Token ko save/update karta hai
exports.subscribeUser = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        const userId = req.user.id; // authMiddleware se aayega

        if (!fcmToken) {
            return res.status(400).json({ message: 'FCM token is required.' });
        }

        // Token ko database mein 'upsert' karein (agar user pehle se hai to update, warna naya banayein)
        const subscription = await Subscription.findOneAndUpdate(
            { userId: userId },
            { fcmToken: fcmToken },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ message: 'Subscribed to notifications successfully.', subscription });

    } catch (error) {
        console.error("Subscription Error:", error.message);
        res.status(500).send('Server Error (subscribeUser)');
    }
};
// --------------------