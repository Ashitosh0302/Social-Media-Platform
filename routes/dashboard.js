const express=require("express")
const router=express.Router()

const {dashboard, publicPosts}=require("../controllers/dashboard")
const authMiddleware=require("../middlewares/authMiddleware")

router.get("/",authMiddleware,dashboard)
router.get("/public-posts",authMiddleware,publicPosts)

module.exports=router