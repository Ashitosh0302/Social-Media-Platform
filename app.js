const express=require("express")
require("dotenv").config();

const app=express()
const PORT=process.env.PORT || 3020

//view engine
app.set("view engine","ejs")

//middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//routes
const register_route=require("./routes/user_register_login")

//app routes
app.use("/register",register_route)

app.listen(PORT,()=>console.log("Server is running"))