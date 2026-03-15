// Cloudinary config helper.
// Supports either CLOUDINARY_URL or individual CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET.
let cloudinary = null;

try {
    const { v2 } = require("cloudinary");
    cloudinary = v2;

    if (process.env.CLOUDINARY_URL) {
        cloudinary.config(); // will read CLOUDINARY_URL
        console.log("Cloudinary configured from CLOUDINARY_URL");
    } else if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    ) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        console.log("Cloudinary configured from CLOUDINARY_* variables");
    } else {
        // Missing config – keep cloudinary null so upload middleware skips
        cloudinary = null;
        console.warn("Cloudinary not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET.");
    }
} catch (e) {
    console.warn("Cloudinary package not installed. Run: npm install cloudinary");
    cloudinary = null;
}

module.exports = cloudinary;
