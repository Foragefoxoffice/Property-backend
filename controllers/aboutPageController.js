const AboutPage = require("../models/AboutPage");

// Get About Page
const getAboutPage = async (req, res) => {
    try {
        const aboutPage = await AboutPage.findOne();

        if (!aboutPage) {
            return res.status(404).json({
                success: false,
                message: "About page not found",
            });
        }

        res.status(200).json({
            success: true,
            data: aboutPage,
        });
    } catch (error) {
        console.error("Error fetching about page:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch about page",
            error: error.message,
        });
    }
};

// Create About Page
const createAboutPage = async (req, res) => {
    try {
        // Check if about page already exists
        const existingPage = await AboutPage.findOne();

        if (existingPage) {
            return res.status(400).json({
                success: false,
                message: "About page already exists. Use update instead.",
            });
        }

        const aboutPage = await AboutPage.create(req.body);

        res.status(201).json({
            success: true,
            message: "About page created successfully",
            data: aboutPage,
        });
    } catch (error) {
        console.error("Error creating about page:", error);

        // Provide more specific error messages
        let errorMessage = "Failed to create about page";
        if (error.name === 'ValidationError') {
            errorMessage = `Validation error: ${error.message}`;
        }

        res.status(500).json({
            success: false,
            message: errorMessage,
            error: error.message,
        });
    }
};

// Update About Page
const updateAboutPage = async (req, res) => {
    try {
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
                message: "About page not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "About page updated successfully",
            data: aboutPage,
        });
    } catch (error) {
        console.error("Error updating about page:", error);

        // Provide more specific error messages
        let errorMessage = "Failed to update about page";
        if (error.name === 'ValidationError') {
            errorMessage = `Validation error: ${error.message}`;
        }

        res.status(500).json({
            success: false,
            message: errorMessage,
            error: error.message,
        });
    }
};

// Upload About Page Image
const uploadAboutPageImage = async (req, res) => {
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
            message: "Image uploaded successfully",
            data: {
                url: fileUrl,
                filename: fileName,
            },
        });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({
            success: false,
            message: "Failed to upload image",
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
