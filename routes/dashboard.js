const express=require("express")
const router=express.Router()

const {dashboard}=require("../controllers/dashboard")
const authMiddleware=require("../middlewares/authMiddleware")

router.get("/",authMiddleware,dashboard)

module.exports=router