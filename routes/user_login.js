const express=require("express")
const router=express.Router()

const {loginPage,loginUser}=require("../controllers/user_login")

router.get("/",loginPage)
router.post("/",loginUser)

module.exports=router