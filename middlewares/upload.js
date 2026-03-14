const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsPath = path.join(__dirname, "..", "public", "uploads");

if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
]);

// Use memory storage when Cloudinary is configured (for deploy - persistent images)
const useCloudinary = !!process.env.CLOUDINARY_URL;

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
        cb(null, Date.now() + ext);
    }
});

const storage = useCloudinary ? multer.memoryStorage() : diskStorage;

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (!file || !ALLOWED_MIME_TYPES.has(file.mimetype)) {
            const err = new Error("Only image files are allowed (jpg, png, webp, gif)");
            err.statusCode = 400;
            return cb(err);
        }
        cb(null, true);
    }
});

module.exports = upload;
