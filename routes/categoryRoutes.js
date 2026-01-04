const express = require("express");
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

const { protect } = require("../middleware/auth");

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Protected routes (authenticated users only)
router.post("/", protect, createCategory);
router.put("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteCategory);

module.exports = router;
