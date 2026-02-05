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


