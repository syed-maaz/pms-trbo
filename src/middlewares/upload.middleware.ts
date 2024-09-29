// upload.middleware.ts
import fs from "fs";
import multer from "multer";
import path from "path";

// Configure multer to store files on disk with custom options
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");

    // Create the folder if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }

    cb(null, uploadPath); // Use the uploads folder
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`; // Timestamp + original filename
    cb(null, filename); // Save with this name
  },
});

// Filter files to only allow CSV
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype === "text/csv") {
    cb(null, true); // Accept file
  } else {
    cb(new Error("Only CSV files are allowed"), false); // Reject file
  }
};

// Configure multer with storage and file filter
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB size limit
});
