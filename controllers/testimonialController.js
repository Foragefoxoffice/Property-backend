const Testimonial = require('../models/Testimonial');
const NotificationSetting = require('../models/NotificationSetting');

// @desc    Get all testimonials (Admin)
// @route   GET /api/v1/testimonials/admin
// @access  Private/Admin
exports.getAdminTestimonials = async (req, res, next) => {
    try {
        const testimonials = await Testimonial.find().sort({ time: -1, createdAt: -1 });
        res.status(200).json({ success: true, count: testimonials.length, data: testimonials });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Create a manual testimonial
// @route   POST /api/v1/testimonials
// @access  Private/Admin
exports.createTestimonial = async (req, res, next) => {
    try {
        const testimonial = await Testimonial.create({
            ...req.body,
            source: 'manual'
        });
        res.status(201).json({ success: true, data: testimonial });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get visible testimonials (Public)
// @route   GET /api/v1/testimonials
// @access  Public
exports.getTestimonials = async (req, res, next) => {
    try {
        const testimonials = await Testimonial.find({ is_visible: true }).sort({ time: -1, createdAt: -1 });
        res.status(200).json({ success: true, count: testimonials.length, data: testimonials });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Toggle visibility of a testimonial
// @route   PUT /api/v1/testimonials/:id/visibility
// @access  Private/Admin
exports.toggleVisibility = async (req, res, next) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ success: false, error: 'Testimonial not found' });
        }

        testimonial.is_visible = !testimonial.is_visible;
        await testimonial.save();

        res.status(200).json({ success: true, data: testimonial });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Delete a testimonial
// @route   DELETE /api/v1/testimonials/:id
// @access  Private/Admin
exports.deleteTestimonial = async (req, res, next) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ success: false, error: 'Testimonial not found' });
        }

        await testimonial.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Sync Google Reviews using Places API
// @route   POST /api/v1/testimonials/sync
// @access  Private/Admin
exports.syncGoogleReviews = async (req, res, next) => {
    try {
        const { apiKey, placeId } = req.body;

        if (!apiKey || !placeId) {
            return res.status(400).json({ success: false, error: 'API Key and Place ID are required' });
        }

        // Call Google Places API
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&fields=reviews`);
        const data = await response.json();

        if (data.status !== 'OK') {
            console.error('❌ Google Places API Error:', data);
            return res.status(400).json({ success: false, error: data.error_message || `Google API Error: ${data.status}` });
        }

        const reviews = data.result.reviews || [];
        let newCount = 0;

        for (const review of reviews) {
            // Check if already exists
            const existing = await Testimonial.findOne({
                google_review_id: review.time + review.author_name
            });

            if (!existing) {
                await Testimonial.create({
                    author_name: review.author_name,
                    author_url: review.author_url,
                    profile_photo_url: review.profile_photo_url,
                    rating: review.rating,
                    relative_time_description: review.relative_time_description,
                    text: review.text,
                    time: review.time,
                    source: 'google',
                    google_review_id: review.time + review.author_name
                });
                newCount++;
            }
        }

        res.status(200).json({ 
            success: true, 
            message: `Sync completed. Added ${newCount} new reviews.`,
            data: { newCount }
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
