const HomeBanner = require("../models/HomeBanner");

/**
 * @desc    Get all home banners
 * @route   GET /api/v1/home-banner
 * @access  Public
 */
exports.getAllHomeBanners = async (req, res) => {
    try {
        const { isActive } = req.query;

        const filter = {};
        if (isActive !== undefined) {
            filter.isActive = isActive === "true";
        }

        const banners = await HomeBanner.find(filter).sort({ displayOrder: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: banners.length,
            data: banners,
        });
    } catch (error) {
        console.error("Error fetching home banners:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch home banners",
            error: error.message,
        });
    }
};

/**
 * @desc    Get single home banner by ID
 * @route   GET /api/v1/home-banner/:id
 * @access  Public
 */
exports.getHomeBannerById = async (req, res) => {
    try {
        const banner = await HomeBanner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Home banner not found",
            });
        }

        res.status(200).json({
            success: true,
            data: banner,
        });
    } catch (error) {
        console.error("Error fetching home banner:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch home banner",
            error: error.message,
        });
    }
};

/**
 * @desc    Create new home banner
 * @route   POST /api/v1/home-banner
 * @access  Private/Admin
 */
exports.createHomeBanner = async (req, res) => {
    try {
        const {
            heroTitle_en,
            heroDescription_en,
            buttonText_en,
            heroTitle_vn,
            heroDescription_vn,
            buttonText_vn,
            buttonLink,
            backgroundImage,
            backgroundVideo,
            isActive,
            displayOrder,
        } = req.body;

        // Validation
        if (!heroTitle_en || !heroDescription_en || !buttonText_en) {
            return res.status(400).json({
                success: false,
                message: "English content fields are required",
            });
        }

        if (!heroTitle_vn || !heroDescription_vn || !buttonText_vn) {
            return res.status(400).json({
                success: false,
                message: "Vietnamese content fields are required",
            });
        }

        if (!buttonLink) {
            return res.status(400).json({
                success: false,
                message: "Button link is required",
            });
        }

        const banner = await HomeBanner.create({
            heroTitle_en,
            heroDescription_en,
            buttonText_en,
            heroTitle_vn,
            heroDescription_vn,
            buttonText_vn,
            buttonLink,
            backgroundImage,
            backgroundVideo,
            isActive,
            displayOrder,
        });

        res.status(201).json({
            success: true,
            message: "Home banner created successfully",
            data: banner,
        });
    } catch (error) {
        console.error("Error creating home banner:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create home banner",
            error: error.message,
        });
    }
};

/**
 * @desc    Update home banner
 * @route   PUT /api/v1/home-banner/:id
 * @access  Private/Admin
 */
exports.updateHomeBanner = async (req, res) => {
    try {
        const banner = await HomeBanner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Home banner not found",
            });
        }

        const updatedBanner = await HomeBanner.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json({
            success: true,
            message: "Home banner updated successfully",
            data: updatedBanner,
        });
    } catch (error) {
        console.error("Error updating home banner:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update home banner",
            error: error.message,
        });
    }
};

/**
 * @desc    Delete home banner
 * @route   DELETE /api/v1/home-banner/:id
 * @access  Private/Admin
 */
exports.deleteHomeBanner = async (req, res) => {
    try {
        const banner = await HomeBanner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Home banner not found",
            });
        }

        await HomeBanner.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Home banner deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting home banner:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete home banner",
            error: error.message,
        });
    }
};

/**
 * @desc    Get active home banner for frontend
 * @route   GET /api/v1/home-banner/active
 * @access  Public
 */
exports.getActiveHomeBanner = async (req, res) => {
    try {
        const banner = await HomeBanner.findOne({ isActive: true }).sort({
            displayOrder: 1,
            createdAt: -1,
        });

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "No active home banner found",
            });
        }

        res.status(200).json({
            success: true,
            data: banner,
        });
    } catch (error) {
        console.error("Error fetching active home banner:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch active home banner",
            error: error.message,
        });
    }
};
