const Blog = require("../models/Blog");
const Category = require("../models/Category"); // Ensure we can populate
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../utils/asyncHandler");

/* =========================================================
   📋 GET ALL BLOGS (PUBLIC)
   - For frontend listing
   - Should return only published blogs usually, but logic can vary
========================================================= */
exports.getAllBlogs = asyncHandler(async (req, res, next) => {
  const blogs = await Blog.find({ published: true })
    .populate("category")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: blogs.length,
    data: blogs,
  });
});

/* =========================================================
   📋 GET SINGLE BLOG BY SLUG (PUBLIC)
========================================================= */
exports.getBlogBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  
  // Try finding by English or Vietnamese slug
  const blog = await Blog.findOne({
    $or: [{ "slug.en": slug }, { "slug.vi": slug }],
    published: true,
  }).populate("category");

  if (!blog) {
    return next(new ErrorResponse("Blog not found", 404));
  }

  // Increment views
  blog.views += 1;
  await blog.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: blog,
  });
});

/* =========================================================
   📋 GET ALL BLOGS (ADMIN)
   - Returns ALL blogs (published & unpublished)
   - Used for the CMS list page
========================================================= */
exports.getAdminBlogs = asyncHandler(async (req, res, next) => {
  const blogs = await Blog.find()
    .populate("category")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: blogs.length,
    data: blogs,
  });
});

/* =========================================================
   📋 GET SINGLE BLOG BY ID (ADMIN)
========================================================= */
exports.getBlogById = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id).populate("category");

  if (!blog) {
    return next(new ErrorResponse("Blog not found", 404));
  }

  res.status(200).json({
    success: true,
    data: blog,
  });
});

/* =========================================================
   ✏️ CREATE NEW BLOG
========================================================= */
exports.createBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.create(req.body);

  res.status(201).json({
    success: true,
    data: blog,
  });
});

/* =========================================================
   🔄 UPDATE BLOG
========================================================= */
exports.updateBlog = asyncHandler(async (req, res, next) => {
  let blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new ErrorResponse("Blog not found", 404));
  }

  blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: blog,
  });
});

/* =========================================================
   🗑️ DELETE BLOG
========================================================= */
exports.deleteBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new ErrorResponse("Blog not found", 404));
  }

  await blog.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
