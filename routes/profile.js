const express=require("express")
const router=express.Router()

const authMiddleware=require("../middlewares/authMiddleware")
const upload=require("../middlewares/upload")
const {profilePage, viewUserProfile, toggleFollow, searchUsers, updateProfileImage}=require("../controllers/profile")

// own profile
router.get("/",authMiddleware,profilePage)

// search endpoint for username suggestions
router.get("/search", authMiddleware, searchUsers)

// upload/change own profile image
router.post("/upload", authMiddleware, upload.single("profile_image"), updateProfileImage);

// follow/unfollow user (toggle)
router.post("/:id/follow", authMiddleware, toggleFollow)

// view another user's profile by id
router.get("/:id", authMiddleware, viewUserProfile)

module.exports=router