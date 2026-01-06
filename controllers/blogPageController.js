const BlogPage = require("../models/BlogPage");

// Get Blog Page
const getBlogPage = async (req, res) => {
    try {
        const blogPage = await BlogPage.findOne();

        // If no page exists, return null or empty object instead of 404 to allow creation
        if (!blogPage) {
            return res.status(200).json({
                success: true,
                data: null,
            });
        }

        res.status(200).json({
            success: true,
            data: blogPage,
        });
    } catch (error) {
        console.error("Error fetching blog page:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch blog page",
            error: error.message,
        });
    }
};

// Create Blog Page
const createBlogPage = async (req, res) => {
    try {
        // Check if blog page already exists
        const existingPage = await BlogPage.findOne();

        if (existingPage) {
            return res.status(400).json({
                success: false,
                message: "Blog page already exists. Use update instead.",
            });
        }

        const blogPage = await BlogPage.create(req.body);

        res.status(201).json({
            success: true,
            message: "Blog page created successfully",
            data: blogPage,
        });
    } catch (error) {
        console.error("Error creating blog page:", error);

        let errorMessage = "Failed to create blog page";
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

// Update Blog Page
const updateBlogPage = async (req, res) => {
    try {
        const { id } = req.params;

        const blogPage = await BlogPage.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!blogPage) {
            return res.status(404).json({
                success: false,
                message: "Blog page not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Blog page updated successfully",
            data: blogPage,
        });
    } catch (error) {
        console.error("Error updating blog page:", error);

        let errorMessage = "Failed to update blog page";
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

module.exports = {
    getBlogPage,
    createBlogPage,
    updateBlogPage,
};
