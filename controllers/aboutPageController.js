const AboutPage = require("../models/AboutPage");
const { getLocalizedMessage } = require("../utils/localize");

// Get About Page
const getAboutPage = async (req, res) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const aboutPage = await AboutPage.findOne();

        if (!aboutPage) {
            return res.status(404).json({
                success: false,
                message: getLocalizedMessage("not_found", lang),
            });
        }

        res.status(200).json({
            success: true,
            data: aboutPage,
        });
    } catch (error) {
        console.error("Error fetching about page:", error);
        const lang = req.headers["accept-language"] || "en";
        res.status(500).json({
            success: false,
            message: getLocalizedMessage("failed_to_fetch", lang),
            error: error.message,
        });
    }
};

// Create About Page
const createAboutPage = async (req, res) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        // Check if about page already exists
        const existingPage = await AboutPage.findOne();

        if (existingPage) {
            return res.status(400).json({
                success: false,
                message: getLocalizedMessage("already_exists", lang),
            });
        }

        const aboutPage = await AboutPage.create(req.body);

        res.status(201).json({
            success: true,
            message: getLocalizedMessage("created_successfully", lang),
            data: aboutPage,
        });
    } catch (error) {
        console.error("Error creating about page:", error);
        const lang = req.headers["accept-language"] || "en";
        res.status(500).json({
            success: false,
            message: getLocalizedMessage("failed_to_create", lang),
            error: error.message,
        });
    }
};

// Update About Page
const updateAboutPage = async (req, res) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const { id } = req.params;

        const aboutPage = await AboutPage.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!aboutPage) {
            return res.status(404).json({
                success: false,
                message: getLocalizedMessage("not_found", lang),
            });
        }

        res.status(200).json({
            success: true,
            message: getLocalizedMessage("updated_successfully", lang),
            data: aboutPage,
        });
    } catch (error) {
        console.error("Error updating about page:", error);
        const lang = req.headers["accept-language"] || "en";
        res.status(500).json({
            success: false,
            message: getLocalizedMessage("failed_to_update", lang),
            error: error.message,
        });
    }
};

// Upload About Page Image
const uploadAboutPageImage = async (req, res) => {
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
        const uploadDir = path.join(__dirname, "..", "uploads", "aboutpage");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.name)}`;
        const filePath = path.join(uploadDir, fileName);

        await file.mv(filePath);

        const fileUrl = `/uploads/aboutpage/${fileName}`;

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

module.exports = {
    getAboutPage,
    createAboutPage,
    updateAboutPage,
    uploadAboutPageImage,
};
