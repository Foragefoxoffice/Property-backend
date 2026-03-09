const ProjectBanner = require("../models/ProjectBanner");

// Get Project Banner
const getProjectBanner = async (req, res) => {
    try {
        const projectBanner = await ProjectBanner.findOne();

        if (!projectBanner) {
            return res.status(200).json({
                success: true,
                data: null,
            });
        }

        res.status(200).json({
            success: true,
            data: projectBanner,
        });
    } catch (error) {
        console.error("Error fetching project banner:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch project banner",
            error: error.message,
        });
    }
};

// Create Project Banner
const createProjectBanner = async (req, res) => {
    try {
        const existingBanner = await ProjectBanner.findOne();

        if (existingBanner) {
            return res.status(400).json({
                success: false,
                message: "Project banner already exists. Use update instead.",
            });
        }

        const projectBanner = await ProjectBanner.create(req.body);

        res.status(201).json({
            success: true,
            message: "Project banner created successfully",
            data: projectBanner,
        });
    } catch (error) {
        console.error("Error creating project banner:", error);

        let errorMessage = "Failed to create project banner";
        if (error.name === "ValidationError") {
            errorMessage = `Validation error: ${error.message}`;
        }

        res.status(500).json({
            success: false,
            message: errorMessage,
            error: error.message,
        });
    }
};

// Update Project Banner
const updateProjectBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const projectBanner = await ProjectBanner.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!projectBanner) {
            return res.status(404).json({
                success: false,
                message: "Project banner not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Project banner updated successfully",
            data: projectBanner,
        });
    } catch (error) {
        console.error("Error updating project banner:", error);

        let errorMessage = "Failed to update project banner";
        if (error.name === "ValidationError") {
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
    getProjectBanner,
    createProjectBanner,
    updateProjectBanner,
};
