const mongoose = require('mongoose');

const systemStatsSchema = new mongoose.Schema({
    fcmGlobalSentCount: {
        type: Number,
        default: 0
    },
    fcmGlobalOpenCount: {
        type: Number,
        default: 0
    },
    lastFCMConsoleSync: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SystemStats', systemStatsSchema);
