// backend/models/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Create folder if not exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, "product-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    // Check if the file's mimetype starts with 'image/'
    if (file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }
    // Fallback error if someone tries to upload a non-image file
    cb(new Error("Only image files (e.g. jpeg, png, webp, avif) are allowed"));
  },
});

export default upload;