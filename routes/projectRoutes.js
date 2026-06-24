const express = require("express");
const {
    getAllProjects,
    getAdminProjects,
    getProjectById,
    getProjectBySlug,
    createProject,
    updateProject,
    deleteProject,
} = require("../controllers/projectController");
const { protect, optionalProtect } = require("../middleware/auth");

const router = express.Router();

router.route("/").get(getAllProjects).post(createProject);
router.route("/admin/all").get(protect, getAdminProjects);
router.route("/slug/:slug").get(optionalProtect, getProjectBySlug);
router.route("/:id").get(getProjectById).put(updateProject).delete(deleteProject);

module.exports = router;
