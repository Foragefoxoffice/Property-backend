const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CreateProperty',
        required: true
    },
    // Captured snapshot of user details
    userName: { type: String },
    userEmail: { type: String },
    userPhone: { type: String },

    // Staff details (owner of the property)
    staffName: { type: String },

    // Read status for Admin
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure a user can favor a property only once
favoriteSchema.index({ user: 1, property: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
