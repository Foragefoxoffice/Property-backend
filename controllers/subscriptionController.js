const Subscription = require("../models/Subscription");

// @desc    Subscribe to newsletter
// @route   POST /api/subscription
// @access  Public
exports.createSubscription = async (req, res, next) => {
    try {
        const { email } = req.body;

        const subscription = await Subscription.create({
            email,
        });

        res.status(201).json({
            success: true,
            data: subscription,
            message: "Successfully subscribed to newsletter!",
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: "Email is already subscribed" });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get all subscriptions
// @route   GET /api/subscription
// @access  Private/Admin
exports.getSubscriptions = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: subscriptions.length,
            data: subscriptions,
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Delete subscription
// @route   DELETE /api/subscription/:id
// @access  Private/Admin
exports.deleteSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({ success: false, error: "Subscription not found" });
        }

        await subscription.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
            message: "Subscription deleted successfully",
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
