const ProjectOverview = require("../models/ProjectOverview");

// Get Project Overview
const getProjectOverview = async (req, res) => {
    try {
        const projectOverview = await ProjectOverview.findOne();

        if (!projectOverview) {
            return res.status(200).json({
                success: true,
                data: null,
            });
        }

        res.status(200).json({
            success: true,
            data: projectOverview,
        });
    } catch (error) {
        console.error("Error fetching project overview:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch project overview",
            error: error.message,
        });
    }
};

// Create Project Overview
const createProjectOverview = async (req, res) => {
    try {
        const existingOverview = await ProjectOverview.findOne();

        if (existingOverview) {
            return res.status(400).json({
                success: false,
                message: "Project overview already exists. Use update instead.",
            });
        }

        const projectOverview = await ProjectOverview.create(req.body);

        res.status(201).json({
            success: true,
            message: "Project overview created successfully",
            data: projectOverview,
        });
    } catch (error) {
        console.error("Error creating project overview:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create project overview",
            error: error.message,
        });
    }
};

// Update Project Overview
const updateProjectOverview = async (req, res) => {
    try {
        const { id } = req.params;

        const projectOverview = await ProjectOverview.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!projectOverview) {
            return res.status(404).json({
                success: false,
                message: "Project overview not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Project overview updated successfully",
            data: projectOverview,
        });
    } catch (error) {
        console.error("Error updating project overview:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update project overview",
            error: error.message,
        });
    }
};

module.exports = {
    getProjectOverview,
    createProjectOverview,
    updateProjectOverview,
};
