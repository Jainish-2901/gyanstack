const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Ek user ke liye ek hi subscription token
    },
    // Yeh woh token hai jo Firebase se aata hai aur notification bhejne ke liye zaroori hai
    fcmToken: { 
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;