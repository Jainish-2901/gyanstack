const SystemStats = require('../models/systemStatsModel');
const Announcement = require('../models/announcementModel');

// 1. Get All FCM Pulse Data
exports.getFCMPulse = async (req, res) => {
    try {
        let stats = await SystemStats.findOne();
        if (!stats) {
            stats = new SystemStats();
            await stats.save();
        }

        // Get totals from all local announcements
        const localAnnouncements = await Announcement.aggregate([
            {
                $group: {
                    _id: null,
                    totalSent: { $sum: '$sentCount' },
                    totalOpened: { $sum: '$openCount' }
                }
            }
        ]);

        const totals = localAnnouncements[0] || { totalSent: 0, totalOpened: 0 };

        res.json({
            platform: {
                sent: totals.totalSent,
                opened: totals.totalOpened
            },
            firebaseConsole: {
                opened: stats.fcmGlobalOpenCount,
                lastActivity: stats.lastFCMConsoleSync
            },
            grandTotal: {
                reach: totals.totalSent, // Console sent count is unknown
                engagement: totals.totalOpened + stats.fcmGlobalOpenCount
            }
        });
    } catch (err) {
        console.error("Pulse Error:", err.message);
        res.status(500).json({ message: 'Failed to fetch pulse' });
    }
};

// 2. Increment Global Open Track (Used for Firebase Console messages)
exports.trackGeneralOpen = async (req, res) => {
    try {
        let stats = await SystemStats.findOne();
        if (!stats) stats = new SystemStats();
        
        stats.fcmGlobalOpenCount += 1;
        stats.lastFCMConsoleSync = Date.now();
        await stats.save();
        
        res.status(200).json({ success: true, type: 'global_engagement_recorded' });
    } catch (err) {
        console.error("General Track Error:", err.message);
        res.status(500).json({ message: 'Pulse tracking failed' });
    }
};
