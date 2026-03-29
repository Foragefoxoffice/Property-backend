const ContactPage = require("../models/ContactPage");
const { getLocalizedMessage } = require("../utils/localize");

// Get Contact Page
const getContactPage = async (req, res) => {
    try {
        const contactPage = await ContactPage.findOne();

        if (!contactPage) {
            const lang = req.headers["accept-language"] || "en";
            return res.status(404).json({
                success: false,
                message: getLocalizedMessage("not_found", lang),
            });
        }

        res.status(200).json({
            success: true,
            data: contactPage,
        });
    } catch (error) {
        console.error("Error fetching contact page:", error);
        const lang = req.headers["accept-language"] || "en";
        res.status(500).json({
            success: false,
            message: getLocalizedMessage("failed_to_fetch", lang),
            error: error.message,
        });
    }
};

// Create Contact Page
const createContactPage = async (req, res) => {
    try {
        // Check if contact page already exists
        const existingPage = await ContactPage.findOne();

        if (existingPage) {
            const lang = req.headers["accept-language"] || "en";
            return res.status(400).json({
                success: false,
                message: getLocalizedMessage("already_exists", lang),
            });
        }

        const contactPage = await ContactPage.create(req.body);

        const lang = req.headers["accept-language"] || "en";
        res.status(201).json({
            success: true,
            message: getLocalizedMessage("created_successfully", lang),
            data: contactPage,
        });
    } catch (error) {
        console.error("Error creating contact page:", error);
        const lang = req.headers["accept-language"] || "en";
        res.status(500).json({
            success: false,
            message: getLocalizedMessage("failed_to_create", lang),
            error: error.message,
        });
    }
};

// Update Contact Page
const updateContactPage = async (req, res) => {
    try {
        const { id } = req.params;

        const contactPage = await ContactPage.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!contactPage) {
            const lang = req.headers["accept-language"] || "en";
            return res.status(404).json({
                success: false,
                message: getLocalizedMessage("not_found", lang),
            });
        }

        const lang = req.headers["accept-language"] || "en";
        res.status(200).json({
            success: true,
            message: getLocalizedMessage("updated_successfully", lang),
            data: contactPage,
        });
    } catch (error) {
        console.error("Error updating contact page:", error);
        const lang = req.headers["accept-language"] || "en";
        res.status(500).json({
            success: false,
            message: getLocalizedMessage("failed_to_update", lang),
            error: error.message,
        });
    }
};

// Upload Contact Page Image
const uploadContactPageImage = async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        const file = req.files.image;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "Only image files are allowed (JPEG, PNG, GIF, WebP, SVG)",
            });
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return res.status(400).json({
                success: false,
                message: "File size must be less than 5MB",
            });
        }

        const path = require("path");
        const fs = require("fs");
        const uploadDir = path.join(__dirname, "..", "uploads", "contactpage");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.name)}`;
        const filePath = path.join(uploadDir, fileName);

        await file.mv(filePath);

        const fileUrl = `/uploads/contactpage/${fileName}`;
        const lang = req.headers["accept-language"] || "en";

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
            message: getLocalizedMessage("failed_to_update", lang),
            error: error.message,
        });
    }
};

module.exports = {
    getContactPage,
    createContactPage,
    updateContactPage,
    uploadContactPageImage,
};
