const Announcement = require('../models/announcementModel');
const Subscription = require('../models/subscriptionModel');
const User = require('../models/userModel');
const axios = require('axios');

const { google } = require('googleapis');

const getAccessToken = () => {
    return new Promise((resolve, reject) => {
        const key = {
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') // Handle newline escaping
        };

        if (!key.client_email || !key.private_key) {
            return reject(new Error("Missing FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY in .env"));
        }

        const jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            ['https://www.googleapis.com/auth/firebase.messaging'],
            null
        );

        jwtClient.authorize((err, tokens) => {
            if (err) return reject(err);
            resolve(tokens.access_token);
        });
    });
};

// Push Notification bhejta hai (Modern HTTP v1)
const sendPushNotification = async (title, body, announcementId = null) => {
    try {
        
        const projectId = process.env.FIREBASE_PROJECT_ID || "gyanstack-server";
        
        const usersWithTokens = await User.find({ 
            fcmToken: { $exists: true, $ne: "" },
            isDeleted: false // Only send to active users
        }).select('fcmToken').lean();

        // Extract tokens and remove duplicates
        const tokens = [...new Set(usersWithTokens.map(u => u.fcmToken))].filter(t => t);


        if (tokens.length === 0) {
            return 0;
        }

        const accessToken = await getAccessToken();

        let successCount = 0;
        let failureCount = 0;

        for (const token of tokens) {
            const message = {
                message: {
                    token: token,
                    notification: {
                        title: title,
                        body: body
                    },
                    data: {
                        title: title,
                        body: body,
                        url: "/announcements",
                        announcementId: announcementId ? announcementId.toString() : ""
                    },
                    webpush: {
                        headers: {
                            image: "https://gyanstack.vercel.app/logo.png"
                        },
                        fcm_options: {
                            link: "https://gyanstack.vercel.app/announcements"
                        }
                    }
                }
            };

            try {
                await axios.post(
                    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
                    message,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        }
                    }
                );
                successCount++;
            } catch (err) {
                console.warn(`FCM: Failed to send to token ${token.substring(0, 10)}...:`, err.message);
                failureCount++;
            }
        }

        
        if (announcementId && successCount > 0) {
            await Announcement.findByIdAndUpdate(announcementId, { sentCount: successCount });
        }
        
        return successCount;
    } catch (error) {
        console.error("FCM v1: Fatal Error:", error.message);
        return 0;
    }
};

exports.requestAnnouncement = async (req, res) => {
    const { title, content } = req.body;
    try {
        const isSuperAdmin = req.user.role === 'superadmin';
        
        const newAnnouncement = new Announcement({
            title,
            content,
            requestedBy: req.user.id,
            status: isSuperAdmin ? 'approved' : 'pending',
        });
        
        await newAnnouncement.save();

        if (isSuperAdmin) {
            const pushTitle = `🚨 New Update: ${title}`;
            const pushBody = content.substring(0, 100) + '... Tap to view.';
            await sendPushNotification(pushTitle, pushBody, newAnnouncement._id); 
        }

        res.status(201).json({ 
            message: isSuperAdmin ? 'Announcement published successfully' : 'Announcement request submitted successfully' 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// --- YEH NAYA FLEXIBLE FUNCTION HAI (Frontend Public, Header Bell, and Homepage ke liye) ---
exports.getAnnouncements = async (req, res) => {
    try {
        const { limit, status = 'approved', days } = req.query; 
        
        let query = { status: status };

        if (days) {
            const dateThreshold = new Date();
            dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));
            query.createdAt = { $gte: dateThreshold };
        }
        
        let queryBuilder = Announcement.find(query)
            .sort({ createdAt: -1 })
            .populate('requestedBy', 'username'); 

        if (limit) {
            queryBuilder = queryBuilder.limit(parseInt(limit));
        }

        const announcements = await queryBuilder.exec();
        res.json({ announcements });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error (getAnnouncements): ' + err.message });
    }
};
// -----------------------------------------------------------------------------------

exports.getAllAnnouncements = async (req, res) => {
    try {
        // SuperAdmin sabhi status (pending/approved/rejected) dekhta hai
        const announcements = await Announcement.find()
            .populate('requestedBy', 'username')
            .sort({ createdAt: -1 });
        res.json({ announcements });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error (getAllAnnouncements): ' + err.message });
    }
};

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
        
        if (status === 'approved') {
            const title = `🚨 New Update: ${updatedAnnouncement.title}`;
            const body = updatedAnnouncement.content.substring(0, 100) + '... Tap to view.';
            await sendPushNotification(title, body, updatedAnnouncement._id); 
        }

        res.json({ message: `Announcement ${status} successfully`, announcement: updatedAnnouncement });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


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

exports.updateAnnouncement = async (req, res) => {
    const { title, content } = req.body;
    const { id } = req.params;
    
    try {
        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        let canEdit = false;
        if (req.user.role === 'superadmin') {
            canEdit = true;
        }
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

exports.subscribeUser = async (req, res) => {
  const { fcmToken } = req.body;
  if (!fcmToken) {
    return res.status(400).json({ message: 'fcmToken is required' });
  }

  try {
    // Agar user ka token pehle se exist karta hai to update karein, warna naya banayein
    await Subscription.findOneAndUpdate(
      { userId: req.user.id },
      { fcmToken },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: 'Subscribed successfully for push notifications' });
  } catch (err) {
    console.error("Subscription Error:", err.message);
    res.status(500).json({ message: 'Failed to subscribe: ' + err.message });
  }
};

exports.trackAnnouncementOpen = async (req, res) => {
    try {
        const { id } = req.params;
        await Announcement.findByIdAndUpdate(id, { $inc: { openCount: 1 } });
        res.status(200).json({ success: true, message: 'Open tracked successfully' });
    } catch (err) {
        console.error("Track Open Error:", err.message);
        res.status(500).json({ message: 'Failed to track open' });
    }
};

exports.markAllRead = async (req, res) => {
    try {
        const { latestId } = req.body;
        if (!latestId) {
            return res.status(400).json({ message: 'latestId is required' });
        }

        await User.findByIdAndUpdate(req.user.id, { 
            lastSeenAnnId: latestId 
        });

        res.status(200).json({ success: true, message: 'All marked as read' });
    } catch (err) {
        console.error("Mark All Read Error:", err.message);
        res.status(500).json({ message: 'Server error while marking read' });
    }
};