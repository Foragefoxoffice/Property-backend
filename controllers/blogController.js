const Blog = require("../models/Blog");
const Category = require("../models/Category"); // Ensure we can populate
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../utils/asyncHandler");
const generateSlug = require("../utils/generateSlug");

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

  const isAdmin = req.user && req.user.role && req.user.role !== 'user';

  let query = {
    $or: [
        { "slug.en": slug }, 
        { "slug.vi": slug },
        { "blogSeoSlugUrl_en": slug },
        { "blogSeoSlugUrl_vn": slug },
        { "blogSeoSlugUrl_vi": slug }
    ],
  };

  if (!isAdmin) {
    query.published = true;
  }

  // Try finding by English or Vietnamese slug
  const blog = await Blog.findOne(query).populate("category");

  if (!blog) {
    return next(new ErrorResponse("Blog not found", 404));
  }

  // Increment views only for public users
  if (!isAdmin) {
    blog.views += 1;
    await blog.save({ validateBeforeSave: false });
  }

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
  const data = { ...req.body };

  // Ensure slug exists
  if (!data.slug) {
    data.slug = {};
  }

  if (!data.slug.en && data.title?.en) {
    data.slug.en = generateSlug(data.title.en);
  }

  if (!data.slug.vi && data.title?.vi) {
    data.slug.vi = generateSlug(data.title.vi);
  }

  const blog = await Blog.create(data);

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

  const data = { ...req.body };

  // Ensure slug object exists
  if (!data.slug) {
    data.slug = {};
  }

  // Auto generate English slug
  if (!data.slug.en && data.title?.en) {
    data.slug.en = generateSlug(data.title.en);
  }

  // Auto generate Vietnamese slug
  if (!data.slug.vi && data.title?.vi) {
    data.slug.vi = generateSlug(data.title.vi);
  }

  blog = await Blog.findByIdAndUpdate(
    req.params.id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );

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
