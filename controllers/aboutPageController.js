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
        res.status(500).json({
            success: false,
            message: "Failed to create about page",
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
        res.status(500).json({
            success: false,
            message: "Failed to update about page",
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
                message: "No image file provided",
            });
        }

        const imageFile = req.files.image;

        // Convert to base64
        const base64Image = `data:${imageFile.mimetype};base64,${imageFile.data.toString('base64')}`;

        res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            data: {
                url: base64Image,
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
