const Announcement = require('../models/announcementModel');

// --- NAYA HELPER FUNCTION ---
// Push Notification bhejta hai
const sendPushNotification = async (title, body) => {
    // 1. Sabhi FUM Tokens ko database se fetch karein
    const subscriptions = await Subscription.find().select('fcmToken').exec();
    const tokens = subscriptions.map(sub => sub.fcmToken);

    if (tokens.length === 0) {
        console.log("No users subscribed for push notifications.");
        return;
    }

    // 2. Google's FCM API ko call karein
    // Note: Yahaan aapko apne Firebase Project ki Server Key ki zaroorat hogi
    const FIREBASE_SERVER_KEY = process.env.FCM_SERVER_KEY; // Ye .env file me hona chahiye
    
    if (!FIREBASE_SERVER_KEY) {
        console.error("FCM_SERVER_KEY is not defined. Cannot send push notifications.");
        return;
    }

    const message = {
        notification: {
            title: title,
            body: body,
            icon: "/assets/logo.png" // Frontend me ek icon hona chahiye
        },
        // 'registration_ids' array of tokens ko target karta hai
        registration_ids: tokens 
    };

    try {
        await axios.post('https://fcm.googleapis.com/fcm/send', message, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `key=${FIREBASE_SERVER_KEY}`
            }
        });
        console.log(`FCM: Successfully sent notification to ${tokens.length} devices.`);
    } catch (error) {
        console.error("FCM Sending Error:", error.response?.data || error.message);
    }
};
// -----------------------------

// 1. Nayi Announcement Request Karna (Admin Only)
exports.requestAnnouncement = async (req, res) => {
    const { title, content } = req.body;
    try {
        const newAnnouncement = new Announcement({
            title,
            content,
            requestedBy: req.user.id,
            status: 'pending',
        });
        await newAnnouncement.save();
        res.status(201).json({ message: 'Announcement request submitted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// --- YEH NAYA FLEXIBLE FUNCTION HAI (Frontend Public, Header Bell, and Homepage ke liye) ---
// 2. Approved Announcements Fetch Karna (Public)
exports.getAnnouncements = async (req, res) => {
    try {
        const { limit, status = 'approved' } = req.query; // 'approved' ya 'pending' filter karein
        
        let query = { status: status };
        let queryBuilder = Announcement.find(query)
            .sort({ createdAt: -1 })
            .populate('requestedBy', 'username'); // Uploader ka naam bhi lein

        if (limit) {
            queryBuilder = queryBuilder.limit(parseInt(limit));
        }

        const announcements = await queryBuilder.exec();
        res.json({ announcements });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error (getAnnouncements)');
    }
};
// -----------------------------------------------------------------------------------

// 3. Sabhi Announcements Fetch Karna (SuperAdmin Only)
exports.getAllAnnouncements = async (req, res) => {
    try {
        // SuperAdmin sabhi status (pending/approved/rejected) dekhta hai
        const announcements = await Announcement.find()
            .populate('requestedBy', 'username')
            .sort({ createdAt: -1 });
        res.json({ announcements });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// 4. Sirf Admin ki Apni Announcements Fetch Karna (Admin Only)
exports.getMyAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({ requestedBy: req.user.id })
            .sort({ createdAt: -1 });
        res.json({ announcements });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// 5. Announcement ka Status Badlna (SuperAdmin Only) - PUSH NOTIFICATION LOGIC ADDED
exports.updateAnnouncementStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'approved' ya 'rejected'
        
        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            req.params.id,
            { $set: { status: status } },
            { new: true, runValidators: true }
        ).populate('requestedBy', 'username');

        if (!updatedAnnouncement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }
        
        // --- NAYA LOGIC: IF APPROVED, SEND NOTIFICATION ---
        if (status === 'approved') {
            const title = `🚨 New Update: ${updatedAnnouncement.title}`;
            const body = updatedAnnouncement.content.substring(0, 100) + '... Tap to view.';
            sendPushNotification(title, body); // Helper function call karein
        }
        // --------------------------------------------------

        res.json({ message: `Announcement ${status} successfully`, announcement: updatedAnnouncement });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


// 6. Announcement Delete Karna (Admin/SuperAdmin)
exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // Security Check: SuperAdmin hamesha delete kar sakta hai, Admin sirf apni request delete kar sakta hai
        if (req.user.role === 'superadmin' || (req.user.role === 'admin' && announcement.requestedBy.equals(req.user.id))) {
            await Announcement.findByIdAndDelete(req.params.id);
            return res.json({ message: 'Announcement deleted successfully' });
        }
        
        return res.status(403).json({ message: 'Not authorized to delete this announcement' });
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// 7. Announcement Edit Karna (Admin/SuperAdmin)
exports.updateAnnouncement = async (req, res) => {
    const { title, content } = req.body;
    const { id } = req.params;
    
    try {
        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        let canEdit = false;
        // 1. SuperAdmin hamesha edit kar sakta hai
        if (req.user.role === 'superadmin') {
            canEdit = true;
        }
        // 2. Admin sirf apni 'pending' request ko edit kar sakta hai
        else if (req.user.role === 'admin' && announcement.requestedBy.equals(req.user.id) && announcement.status === 'pending') {
            canEdit = true;
        }

        if (!canEdit) {
            return res.status(403).json({ message: 'Not authorized to edit this announcement. Status is not pending.' });
        }

        announcement.title = title;
        announcement.content = content;
        
        const updatedAnnouncement = await announcement.save();
        res.json(updatedAnnouncement);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};