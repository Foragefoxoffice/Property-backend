const HomePage = require("../models/HomePage");
const { getLocalizedMessage } = require("../utils/localize");

/**
 * @desc    Get home page content
 * @route   GET /api/v1/home-page
 * @access  Public
 */
exports.getHomePage = async (req, res) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const homePage = await HomePage.findOne().sort({ createdAt: -1 });

        if (!homePage) {
            return res.status(404).json({
                success: false,
                message: getLocalizedMessage("not_found", lang),
            });
        }

        res.status(200).json({
            success: true,
            data: homePage,
        });
    } catch (error) {
        console.error("Error fetching home page:", error);
        const lang = req.headers["accept-language"] || "en";
        res.status(500).json({
            success: false,
            message: getLocalizedMessage("failed_to_fetch", lang),
            error: error.message,
        });
    }
};

/**
 * @desc    Create home page content
 * @route   POST /api/v1/home-page
 * @access  Private/Admin
 */
exports.createHomePage = async (req, res) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const {
            heroTitle_en,
            heroDescription_en,
            heroTitle_vn,
            heroDescription_vn,
            backgroundImage,
            homeAboutTitle_en,
            homeAboutTitle_vn,
            homeAboutDescription_en,
            homeAboutDescription_vn,
            homeAboutButtonText_en,
            homeAboutButtonText_vn,
            homeAboutButtonLink,
            homeAboutStep1Title_en,
            homeAboutStep1Title_vn,
            homeAboutStep1Des_en,
            homeAboutStep1Des_vn,
            homeAboutStep2Title_en,
            homeAboutStep2Title_vn,
            homeAboutStep2Des_en,
            homeAboutStep2Des_vn,
            homeAboutStep3Title_en,
            homeAboutStep3Title_vn,
            homeAboutStep3Des_en,
            homeAboutStep3Des_vn,
            homeFeatureTitle_en,
            homeFeatureTitle_vn,
            homeFeatureDescription_en,
            homeFeatureDescription_vn,
            homeFeatureButtonText_en,
            homeFeatureButtonText_vn,
            homeFeatureButtonLink,
        } = req.body;

        // Validation
        if (!heroTitle_en || !heroDescription_en) {
            return res.status(400).json({
                success: false,
                message: "Hero section English content is required",
            });
        }

        if (!heroTitle_vn || !heroDescription_vn) {
            return res.status(400).json({
                success: false,
                message: "Hero section Vietnamese content is required",
            });
        }

        const homePage = await HomePage.create(req.body);

        res.status(201).json({
            success: true,
            message: getLocalizedMessage("created_successfully", lang),
            data: homePage,
        });
    } catch (error) {
        console.error("Error creating home page:", error);
        const lang = req.headers["accept-language"] || "en";
        res.status(500).json({
            success: false,
            message: getLocalizedMessage("failed_to_create", lang),
            error: error.message,
        });
    }
};

/**
 * @desc    Update home page content
 * @route   PUT /api/v1/home-page/:id
 * @access  Private/Admin
 */
exports.updateHomePage = async (req, res) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const homePage = await HomePage.findById(req.params.id);

        if (!homePage) {
            return res.status(404).json({
                success: false,
                message: getLocalizedMessage("not_found", lang),
            });
        }

        const updatedHomePage = await HomePage.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json({
            success: true,
            message: getLocalizedMessage("updated_successfully", lang),
            data: updatedHomePage,
        });
    } catch (error) {
        console.error("Error updating home page:", error);
        const lang = req.headers["accept-language"] || "en";
        res.status(500).json({
            success: false,
            message: getLocalizedMessage("failed_to_update", lang),
            error: error.message,
        });
    }
};

/**
 * @desc    Upload home page image
 * @route   POST /api/v1/home-page/upload
 * @access  Private/Admin
 */
exports.uploadHomePageImage = async (req, res) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        if (!req.files || !req.files.image) {
            return res.status(400).json({
                success: false,
                message: getLocalizedMessage("no_file_uploaded", lang),
            });
        }

        const file = req.files.image;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: getLocalizedMessage("invalid_file_type", lang),
            });
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return res.status(400).json({
                success: false,
                message: getLocalizedMessage("file_too_large", lang),
            });
        }

        const path = require("path");
        const fs = require("fs");
        const uploadDir = path.join(__dirname, "..", "uploads", "homepage");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.name)}`;
        const filePath = path.join(uploadDir, fileName);

        await file.mv(filePath);

        const fileUrl = `/uploads/homepage/${fileName}`;

        res.status(200).json({
            success: true,
            message: getLocalizedMessage("file_uploaded", lang),
            data: {
                url: fileUrl,
                filename: fileName,
            },
        });
    } catch (error) {
        console.error("Error uploading image:", error);
        const lang = req.headers["accept-language"] || "en";
        res.status(500).json({
            success: false,
            message: getLocalizedMessage("failed_to_update", lang), // Or localized failed_to_upload
            error: error.message,
        });
    }
};
