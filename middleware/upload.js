const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure folder exists dynamically
function ensureFolderExists(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Default folder = /uploads
    let uploadPath = path.join(__dirname, "../uploads");

    // If uploading profile images, put them in /uploads/profile
    if (file.fieldname === "profile") {
      uploadPath = path.join(uploadPath, "profile");
    }

    // If uploading banner, put in /uploads/banner
    else if (file.fieldname === "banner") {
      uploadPath = path.join(uploadPath, "banner");
    }

    // If uploading dynamic section images (sectionImage_0, sectionImage_1, etc.)
    else if (file.fieldname.startsWith("sectionImage_")) {
      uploadPath = path.join(uploadPath, "sections");
    }

    // Ensure folder exists
    ensureFolderExists(uploadPath);

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// File filter (only images)
function fileFilter(req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

module.exports = upload;
