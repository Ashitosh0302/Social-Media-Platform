// Middleware: uploads req.file to Cloudinary when CLOUDINARY_URL is set
// Run AFTER multer. Sets req.file.imageUrl when upload succeeds.
const cloudinary = require("../config/cloudinary");

async function uploadToCloudinary(req, res, next) {
    if (!cloudinary || !req.file) return next();
    try {
        const b64 = req.file.buffer.toString("base64");
        const dataUri = `data:${req.file.mimetype};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataUri, {
            folder: "birdsky",
            resource_type: "image"
        });
        req.file.imageUrl = result.secure_url;
    } catch (err) {
        console.error("Cloudinary upload error:", err.message);
    }
    next();
}

module.exports = uploadToCloudinary;
