const SystemStats = require('../models/systemStatsModel');
const Announcement = require('../models/announcementModel');

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
                sent: stats.fcmGlobalSentCount,
                opened: stats.fcmGlobalOpenCount,
                lastActivity: stats.lastFCMConsoleSync
            },
            grandTotal: {
                reach: totals.totalSent + stats.fcmGlobalSentCount,
                engagement: totals.totalOpened + stats.fcmGlobalOpenCount
            }
        });
    } catch (err) {
        console.error("Pulse Error:", err.message);
        res.status(500).json({ message: 'Failed to fetch pulse' });
    }
};

// 2. Increment Global Tracks (Used for Firebase Console messages)
exports.trackExternalPulse = async (req, res) => {
    try {
        const { type, title, content } = req.body; // 'sent' or 'open'
        let stats = await SystemStats.findOne();
        if (!stats) stats = new SystemStats();
        
        if (type === 'sent') {
            stats.fcmGlobalSentCount += 1;
            
            // --- NAYA: External Message ko DB mein save karein (If not exists) ---
            if (title && content) {
                const existing = await Announcement.findOne({ title, content });
                if (!existing) {
                    const externalMsg = new Announcement({
                        title: title,
                        content: content,
                        status: 'approved', // External console messages are auto-approved
                    });
                    await externalMsg.save();
                }
            }
        } else {
            stats.fcmGlobalOpenCount += 1;
        }
        
        stats.lastFCMConsoleSync = Date.now();
        await stats.save();
        
        res.status(200).json({ success: true, type: `pulse_${type}_recorded` });
    } catch (err) {
        console.error("General Track Error:", err.message);
        res.status(500).json({ message: 'Pulse tracking failed' });
    }
};
