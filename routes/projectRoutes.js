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

const router = express.Router();

router.route("/").get(getAllProjects).post(createProject);
router.route("/admin/all").get(getAdminProjects);
router.route("/slug/:slug").get(getProjectBySlug);
router.route("/:id").get(getProjectById).put(updateProject).delete(deleteProject);

module.exports = router;
