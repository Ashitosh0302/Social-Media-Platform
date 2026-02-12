const express=require("express")
const router=express.Router()

//controllers
const {registerUser,register_page}=require("../controllers/user_register_login")

//routes
//register routes
router.get("/",register_page)
router.post("/",registerUser)

//exports
module.exports=router

