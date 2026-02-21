const Testimonial = require('../models/Testimonial');
const NotificationSetting = require('../models/NotificationSetting');

// @desc    Get all testimonials (Admin)
// @route   GET /api/v1/testimonials/admin
// @access  Private/Admin
exports.getAdminTestimonials = async (req, res, next) => {
    try {
        const User = require('../models/User'); // Ensure User model is available
        let testimonials = await Testimonial.find()
            .populate('user', 'name profileImage')
            .sort({ time: -1, createdAt: -1 });

        // For unlinked manual testimonials, try to find users by name for avatar updates
        const unlinkedNames = [...new Set(testimonials.filter(t => !t.user && t.source === 'manual').map(t => t.author_name))];
        const shadowUsers = await User.find({ name: { $in: unlinkedNames } }).select('name profileImage');
        const userMap = shadowUsers.reduce((acc, u) => ({ ...acc, [u.name]: u.profileImage }), {});

        const processedTestimonials = testimonials.map(t => {
            const testimonial = t.toObject();
            if (testimonial.user) {
                testimonial.author_name = testimonial.user.name || testimonial.author_name;
                testimonial.profile_photo_url = testimonial.user.profileImage || testimonial.profile_photo_url;
            } else if (testimonial.source === 'manual' && userMap[testimonial.author_name]) {
                testimonial.profile_photo_url = userMap[testimonial.author_name];
            }
            return testimonial;
        });

        res.status(200).json({ success: true, count: processedTestimonials.length, data: processedTestimonials });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Create a manual testimonial (Admin)
// @route   POST /api/v1/testimonials
// @access  Private/Admin
exports.createTestimonial = async (req, res, next) => {
    try {
        const testimonial = await Testimonial.create({
            ...req.body,
            source: 'manual',
            is_visible: req.body.is_visible !== undefined ? req.body.is_visible : true
        });
        res.status(201).json({ success: true, data: testimonial });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Submit a testimonial (User)
// @route   POST /api/v1/testimonials/submit
// @access  Private
exports.submitTestimonial = async (req, res, next) => {
    try {
        const testimonial = await Testimonial.create({
            ...req.body,
            user: req.user._id,
            author_name: req.user.name || req.body.author_name,
            profile_photo_url: req.user.profileImage || req.body.profile_photo_url,
            source: 'manual',
            is_visible: false // Always false for user submissions
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
        const User = require('../models/User'); // Ensure User model is available
        const testimonials = await Testimonial.find({ is_visible: true })
            .populate('user', 'name profileImage')
            .sort({ time: -1, createdAt: -1 });

        // For unlinked manual testimonials, try to find users by name for avatar updates
        const unlinkedNames = [...new Set(testimonials.filter(t => !t.user && t.source === 'manual').map(t => t.author_name))];
        const shadowUsers = await User.find({ name: { $in: unlinkedNames } }).select('name profileImage');
        const userMap = shadowUsers.reduce((acc, u) => ({ ...acc, [u.name]: u.profileImage }), {});

        const processedTestimonials = testimonials.map(t => {
            const testimonial = t.toObject();
            if (testimonial.user) {
                testimonial.author_name = testimonial.user.name || testimonial.author_name;
                testimonial.profile_photo_url = testimonial.user.profileImage || testimonial.profile_photo_url;
            } else if (testimonial.source === 'manual' && userMap[testimonial.author_name]) {
                testimonial.profile_photo_url = userMap[testimonial.author_name];
            }
            return testimonial;
        });

        res.status(200).json({ success: true, count: processedTestimonials.length, data: processedTestimonials });
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


