const path = require("path");
const fs = require("fs");

const saveFile = (file, folder = "cotton") => {
  const uploadDir = path.join(__dirname, `../uploads/${folder}`);
  fs.mkdirSync(uploadDir, { recursive: true });

  // Generate unique filename
  const uniqueName = `${Date.now()}_${file.name}`;
  const filePath = path.join(uploadDir, uniqueName);

  file.mv(filePath);

  // ✅ return only relative path (no domain)
  return `/uploads/${folder}/${uniqueName}`;
};

module.exports = saveFile;
