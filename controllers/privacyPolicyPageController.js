const PrivacyPolicyPage = require("../models/PrivacyPolicyPage");

// Get Privacy Policy Page
const getPrivacyPolicyPage = async (req, res) => {
    try {
        const page = await PrivacyPolicyPage.findOne();

        if (!page) {
            return res.status(404).json({
                success: false,
                message: "Privacy Policy page not found",
            });
        }

        res.status(200).json({
            success: true,
            data: page,
        });
    } catch (error) {
        console.error("Error fetching Privacy Policy page:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Privacy Policy page",
            error: error.message,
        });
    }
};

// Create or Update Privacy Policy Page
const updatePrivacyPolicyPage = async (req, res) => {
    try {
        let page = await PrivacyPolicyPage.findOne();

        if (page) {
            // Update
            page = await PrivacyPolicyPage.findByIdAndUpdate(page._id, req.body, {
                new: true,
                runValidators: true,
            });
        } else {
            // Create
            page = await PrivacyPolicyPage.create(req.body);
        }

        res.status(200).json({
            success: true,
            message: "Privacy Policy page updated successfully",
            data: page,
        });
    } catch (error) {
        console.error("Error updating Privacy Policy page:", error);

        let errorMessage = "Failed to update Privacy Policy page";
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

// Upload Privacy Policy Page Image
const uploadPrivacyPolicyPageImage = async (req, res) => {
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
        const uploadDir = path.join(__dirname, "..", "uploads", "privacypolicypage");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.name)}`;
        const filePath = path.join(uploadDir, fileName);

        await file.mv(filePath);

        const fileUrl = `/uploads/privacypolicypage/${fileName}`;

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
    getPrivacyPolicyPage,
    updatePrivacyPolicyPage,
    uploadPrivacyPolicyPageImage,
};
