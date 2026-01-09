const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    properties: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CreateProperty'
    }],
    // Captured snapshot of user details
    userName: { type: String },
    userEmail: { type: String },
    userPhone: { type: String },

    // Staff details (owner of the property)
    staffName: { type: String },

    // Message from user
    message: { type: String },

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

// Index modification: we no longer enforce unique user-property pair here as it is an enquiry log
// favoriteSchema.index({ user: 1, property: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
