const express = require("express");
const {
    getBlogPage,
    createBlogPage,
    updateBlogPage,
} = require("../controllers/blogPageController");

const router = express.Router();

router.get("/", getBlogPage);
router.post("/", createBlogPage);
router.put("/:id", updateBlogPage);

module.exports = router;
