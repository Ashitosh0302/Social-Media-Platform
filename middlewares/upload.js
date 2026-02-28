const multer = require("multer");
const path = require("path");

const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
]);

const storage = multer.diskStorage({
    destination: (req, file, cb) =>
    {
        cb(null, "public/uploads");
    },
    filename: (req, file, cb) =>
    {
        const ext = path.extname(file.originalname || "").toLowerCase();
        const uniqueName = Date.now() + ext;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
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
