// Optional: only used when CLOUDINARY_URL is set (for persistent images on deploy)
let cloudinary = null;
if (process.env.CLOUDINARY_URL) {
    try {
        cloudinary = require("cloudinary").v2;
        cloudinary.config();
        console.log("Cloudinary configured for image storage");
    } catch (e) {
        console.warn("Cloudinary URL set but package not installed. Run: npm install cloudinary");
    }
}
module.exports = cloudinary;
