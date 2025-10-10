const express = require("express");
const path = require("path");
const fs = require("fs");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

const router = express.Router();

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

module.exports = router;
