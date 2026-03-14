const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const uploadToCloudinary = require("../middlewares/uploadCloudinary");
const { createPost, toggleLike, addComment } = require("../controllers/posts");

// create a new post (optionally uploads image to Cloudinary when CLOUDINARY_URL is set)
router.post("/create", authMiddleware, upload.single("image"), uploadToCloudinary, createPost);

// like/unlike a post
router.post("/:id/like", authMiddleware, toggleLike);

// add comment to a post
router.post("/:id/comment", authMiddleware, addComment);

module.exports = router;

