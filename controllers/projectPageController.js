const ProjectPage = require("../models/ProjectPage");

// Get Project Page
const getProjectPage = async (req, res) => {
    try {
        const projectPage = await ProjectPage.findOne();

        if (!projectPage) {
            return res.status(200).json({
                success: true,
                data: null,
            });
        }

        res.status(200).json({
            success: true,
            data: projectPage,
        });
    } catch (error) {
        console.error("Error fetching project page:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch project page",
            error: error.message,
        });
    }
};

// Create Project Page
const createProjectPage = async (req, res) => {
    try {
        const existingPage = await ProjectPage.findOne();

        if (existingPage) {
            return res.status(400).json({
                success: false,
                message: "Project page already exists. Use update instead.",
            });
        }

        const projectPage = await ProjectPage.create(req.body);

        res.status(201).json({
            success: true,
            message: "Project page created successfully",
            data: projectPage,
        });
    } catch (error) {
        console.error("Error creating project page:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create project page",
            error: error.message,
        });
    }
};

// Update Project Page
const updateProjectPage = async (req, res) => {
    try {
        const { id } = req.params;

        const projectPage = await ProjectPage.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!projectPage) {
            return res.status(404).json({
                success: false,
                message: "Project page not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Project page updated successfully",
            data: projectPage,
        });
    } catch (error) {
        console.error("Error updating project page:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update project page",
            error: error.message,
        });
    }
};

module.exports = {
    getProjectPage,
    createProjectPage,
    updateProjectPage,
};
