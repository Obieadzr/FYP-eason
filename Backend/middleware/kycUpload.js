import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/kyc";
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/kyc/"),
  filename: (req, file, cb) => {
    const userId = req.user?.id || req.user?._id || "unknown";
    cb(null, `kyc-${userId}-${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

export const kycUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WEBP, and PDF files are allowed for KYC"));
    }
  },
});
