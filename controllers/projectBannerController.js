const ProjectBanner = require("../models/ProjectBanner");
const { getLocalizedMessage } = require("../utils/localize");

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
        const lang = req.headers["accept-language"] || "en";
        res.status(500).json({
            success: false,
            message: getLocalizedMessage("failed_to_fetch", lang),
            error: error.message,
        });
    }
};

// Create Project Banner
const createProjectBanner = async (req, res) => {
    try {
        const existingBanner = await ProjectBanner.findOne();

        if (existingBanner) {
            const lang = req.headers["accept-language"] || "en";
            return res.status(400).json({
                success: false,
                message: getLocalizedMessage("already_exists", lang),
            });
        }

        const projectBanner = await ProjectBanner.create(req.body);

        const lang = req.headers["accept-language"] || "en";
        res.status(201).json({
            success: true,
            message: getLocalizedMessage("created_successfully", lang),
            data: projectBanner,
        });
    } catch (error) {
        console.error("Error creating project banner:", error);
        const lang = req.headers["accept-language"] || "en";
        res.status(500).json({
            success: false,
            message: getLocalizedMessage("failed_to_create", lang),
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
            data: projectBanner,
        });
    } catch (error) {
        console.error("Error updating project banner:", error);
        const lang = req.headers["accept-language"] || "en";
        res.status(500).json({
            success: false,
            message: getLocalizedMessage("failed_to_update", lang),
            error: error.message,
        });
    }
};

module.exports = {
    getProjectBanner,
    createProjectBanner,
    updateProjectBanner,
};
