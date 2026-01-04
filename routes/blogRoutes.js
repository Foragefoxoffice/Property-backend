const express = require("express");
const {
  getAllBlogs,
  getBlogBySlug,
  getAdminBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");

const router = express.Router();

const { protect } = require("../middleware/auth");

/* =========================================================
   🔒 ADMIN ROUTES (Must come before public dynamic routes)
========================================================= */
// Get all blogs for admin dashboard
router.get("/admin/all", protect, getAdminBlogs);

// Get single blog by ID for editing
router.get("/admin/:id", protect, getBlogById);

/* =========================================================
   🌍 PUBLIC ROUTES
========================================================= */
router.get("/", getAllBlogs);

// Get by slug (Public view)
// Placed last to avoid intercepting "admin" or other paths
router.get("/:slug", getBlogBySlug);

/* =========================================================
   ✏️ WRITE OPERATIONS (Protected)
========================================================= */
router.post("/", protect, createBlog);
router.put("/:id", protect, updateBlog);
router.delete("/:id", protect, deleteBlog);

module.exports = router;
