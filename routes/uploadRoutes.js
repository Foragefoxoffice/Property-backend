const express = require("express");
const path = require("path");
const fs = require("fs");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

const router = express.Router();

/* =========================================================
   📤 GENERAL FILE UPLOAD (for blogs, etc.)
========================================================= */
router.post(
  "/upload",
  asyncHandler(async (req, res) => {
    if (!req.files || !req.files.file)
      throw new ErrorResponse("No file uploaded", 400);

    const file = req.files.file;
    const uploadDir = path.join(__dirname, "..", "uploads");

    // ensure folder
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // detect type folder
    const ext = path.extname(file.name).toLowerCase();
    let subfolder = "misc";
    if ([".jpg", ".jpeg", ".png", ".webp", ".svg"].includes(ext))
      subfolder = "images";
    else if ([".mp4", ".webm", ".mov", ".avi", ".mkv"].includes(ext))
      subfolder = "videos";
    else if ([".pdf", ".doc", ".docx"].includes(ext)) subfolder = "docs";

    const folderPath = path.join(uploadDir, subfolder);
    if (!fs.existsSync(folderPath))
      fs.mkdirSync(folderPath, { recursive: true });

    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const filePath = path.join(folderPath, fileName);
    await file.mv(filePath);

    const fileUrl = `${req.protocol}://${req.get(
      "host"
    )}/uploads/${subfolder}/${fileName}`;

    res.json({ success: true, url: fileUrl });
  })
);

/* =========================================================
   🏠 PROPERTY MEDIA UPLOAD (images, videos, floor plans)
   Supports up to 50MB for videos
========================================================= */
router.post(
  "/upload/property-media",
  asyncHandler(async (req, res) => {
    if (!req.files || !req.files.file) {
      throw new ErrorResponse("No file uploaded", 400);
    }

    const file = req.files.file;
    const { type } = req.body; // 'image', 'video', or 'floor'

    // Validate file size based on type
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB for images
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB for videos

    if (type === 'video' && file.size > MAX_VIDEO_SIZE) {
      throw new ErrorResponse("Video file size must be under 50MB", 400);
    }

    if ((type === 'image' || type === 'floor') && file.size > MAX_IMAGE_SIZE) {
      throw new ErrorResponse("Image file size must be under 5MB", 400);
    }

    // Validate file type
    const ext = path.extname(file.name).toLowerCase();
    const imageExts = [".jpg", ".jpeg", ".png", ".webp", ".svg"];
    const videoExts = [".mp4", ".webm", ".mov", ".avi", ".mkv"];

    if (type === 'video' && !videoExts.includes(ext)) {
      throw new ErrorResponse("Invalid video file type. Allowed: mp4, webm, mov, avi, mkv", 400);
    }

    if ((type === 'image' || type === 'floor') && !imageExts.includes(ext)) {
      throw new ErrorResponse("Invalid image file type. Allowed: jpg, jpeg, png, webp, svg", 400);
    }

    // Create upload directory structure
    const uploadDir = path.join(__dirname, "..", "uploads", "properties");
    let subfolder = type === 'video' ? 'videos' : type === 'floor' ? 'floorplans' : 'images';
    
    const folderPath = path.join(uploadDir, subfolder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/\s+/g, "_");
    const fileName = `${timestamp}_${sanitizedName}`;
    const filePath = path.join(folderPath, fileName);

    // Save file
    await file.mv(filePath);

    // Generate URL
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/properties/${subfolder}/${fileName}`;

    console.log(`✅ Uploaded ${type}: ${fileName} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    res.json({ 
      success: true, 
      url: fileUrl,
      fileName: fileName,
      size: file.size,
      type: type
    });
  })
);

module.exports = router;

