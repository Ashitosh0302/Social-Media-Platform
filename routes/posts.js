const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const { createPost, toggleLike, addComment } = require("../controllers/posts");

// create a new post
router.post("/create", authMiddleware, upload.single("image"), createPost);

// like/unlike a post
router.post("/:id/like", authMiddleware, toggleLike);

// add comment to a post
router.post("/:id/comment", authMiddleware, addComment);

module.exports = router;

