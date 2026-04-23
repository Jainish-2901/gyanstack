const Announcement = require('../models/announcementModel');
const Subscription = require('../models/subscriptionModel');
const User = require('../models/userModel');
const axios = require('axios');
const { google } = require('googleapis');

const getAccessToken = () => {
    return new Promise((resolve, reject) => {
        const key = {
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
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

const sendPushNotification = async (title, body, announcementId = null, customLink = null) => {
    try {
        const projectId = process.env.FIREBASE_PROJECT_ID || "gyanstack-server";

        const subscriptions = await Subscription.find({
            fcmToken: { $exists: true, $ne: "" }
        }).select('fcmToken').lean();

        const tokens = [...new Set(subscriptions.map(s => s.fcmToken))].filter(t => t);

        if (tokens.length === 0) {
            console.log("FCM: No active tokens found in Subscription collection.");
            return 0;
        }

        const accessToken = await getAccessToken();

        let targetUrl = `https://gyanstack.vercel.app/announcements`;

        if (customLink) {
            targetUrl = customLink.startsWith('http')
                ? customLink
                : `https://gyanstack.vercel.app${customLink}`;
        } else if (announcementId) {
            targetUrl = `https://gyanstack.vercel.app/announcements/${announcementId}`;
        }

        let successCount = 0;

        for (const token of tokens) {
            const message = {
                message: {
                    token: token,
                    notification: { title, body },
                    data: {
                        announcementId: announcementId ? announcementId.toString() : "",
                        url: targetUrl
                    },
                    webpush: {
                        fcm_options: { link: targetUrl },
                        notification: {
                            icon: "https://gyanstack.vercel.app/logo.png",
                            badge: "https://gyanstack.vercel.app/pwa-192x192-v2.png",
                            tag: "gyanstack-announcement",
                            renotify: true
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
                console.warn(`FCM Error for token ${token.substring(0, 8)}:`, err.message);
            }
        }

        if (announcementId && successCount > 0) {
            await Announcement.findByIdAndUpdate(announcementId, { sentCount: successCount });
        }
        return successCount;
    } catch (error) {
        console.error("FCM Fatal Error:", error.message);
        return 0;
    }
};

// --- Controllers ---

exports.requestAnnouncement = async (req, res) => {
    const { title, content, redirectLink } = req.body;

    try {
        const isSuperAdmin = req.user.role === 'superadmin';

        const newAnnouncement = new Announcement({
            title,
            content,
            redirectLink: redirectLink || "",
            requestedBy: req.user.id,
            status: isSuperAdmin ? 'approved' : 'pending',
        });

        await newAnnouncement.save();

        let pushSentCount = 0;

        if (isSuperAdmin) {
            const pushTitle = `🚨 New Update: ${title}`;
            const pushBody = content.substring(0, 100) + '... Tap to view.';

            pushSentCount = await sendPushNotification(
                pushTitle,
                pushBody,
                newAnnouncement._id,
                redirectLink
            );
        }

        const announcementData = isSuperAdmin
            ? await Announcement.findById(newAnnouncement._id).populate('requestedBy', 'username')
            : newAnnouncement;
        res.status(201).json({
            message: isSuperAdmin
                ? `Blast broadcasted successfully to ${pushSentCount} students!`
                : 'Announcement request submitted successfully',
            announcement: announcementData
        });

    } catch (err) {
        console.error("Request Error:", err.message);
        res.status(500).send('Server error');
    }
};

exports.updateAnnouncementStatus = async (req, res) => {
    try {
        const { status } = req.body; 
        
        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            req.params.id,
            { $set: { status: status } },
            { new: true }
        ).populate('requestedBy', 'username');

        if (!updatedAnnouncement) return res.status(404).json({ message: 'Not found' });
        
        if (status === 'approved') {
            const title = `🚨 Update: ${updatedAnnouncement.title}`;
            const body = updatedAnnouncement.content.substring(0, 100) + '... Tap to view.';
            
            const sentCount = await sendPushNotification(
                title, 
                body, 
                updatedAnnouncement._id, 
                updatedAnnouncement.redirectLink
            ); 

            updatedAnnouncement.sentCount = sentCount;
            await updatedAnnouncement.save();
        }

        res.json({ 
            message: `Announcement ${status} successfully`, 
            announcement: updatedAnnouncement 
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

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

exports.getAllAnnouncements = async (req, res) => {
    try {
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

exports.updateAnnouncementStatus = async (req, res) => {
    try {
        const { status } = req.body;

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

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { lastSeenAnnId: latestId },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'All marked as read',
            user: updatedUser
        });
    } catch (err) {
        console.error("Mark All Read Error:", err.message);
        res.status(500).json({ message: 'Server error while marking read' });
    }
};