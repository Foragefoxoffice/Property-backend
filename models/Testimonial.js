const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    author_name: {
        type: String,
        required: true
    },
    author_url: {
        type: String
    },
    profile_photo_url: {
        type: String
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    relative_time_description: {
        type: String
    },
    text: {
        type: String,
        required: true
    },
    time: {
        type: Number
    },
    is_visible: {
        type: Boolean,
        default: true
    },
    source: {
        type: String,
        enum: ['google', 'manual'],
        default: 'manual'
    },
    google_review_id: {
        type: String,
        unique: true,
        sparse: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
