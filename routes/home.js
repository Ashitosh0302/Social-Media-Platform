const express=require("express")
const router=express.Router()

const {home, logout}=require("../controllers/home")

router.get("/",home)
router.get("/logout", logout)

module.exports=router