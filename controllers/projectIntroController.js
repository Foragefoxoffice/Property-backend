const ProjectOverview = require("../models/ProjectIntro");
const { getLocalizedMessage } = require("../utils/localize");

// Get Project Overview
const getProjectIntro = async (req, res) => {
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
        const lang = req.headers["accept-language"] || "en";
        res.status(500).json({
            success: false,
            message: getLocalizedMessage("failed_to_fetch", lang),
            error: error.message,
        });
    }
};

// Create Project Overview
const createProjectIntro = async (req, res) => {
    try {
        const existingOverview = await ProjectOverview.findOne();

        if (existingOverview) {
            const lang = req.headers["accept-language"] || "en";
            return res.status(400).json({
                success: false,
                message: getLocalizedMessage("already_exists", lang),
            });
        }

        const projectOverview = await ProjectOverview.create(req.body);

        const lang = req.headers["accept-language"] || "en";
        res.status(201).json({
            success: true,
            message: getLocalizedMessage("created_successfully", lang),
            data: projectOverview,
        });
    } catch (error) {
        console.error("Error creating project overview:", error);
        const lang = req.headers["accept-language"] || "en";
        res.status(500).json({
            success: false,
            message: getLocalizedMessage("failed_to_create", lang),
            error: error.message,
        });
    }
};

// Update Project Overview
const updateProjectIntro = async (req, res) => {
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
            data: projectOverview,
        });
    } catch (error) {
        console.error("Error updating project overview:", error);
        const lang = req.headers["accept-language"] || "en";
        res.status(500).json({
            success: false,
            message: getLocalizedMessage("failed_to_update", lang),
            error: error.message,
        });
    }
};

module.exports = {
    getProjectIntro,
    createProjectIntro,
    updateProjectIntro,
};
