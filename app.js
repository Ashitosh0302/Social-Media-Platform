const express=require("express")
const cookieParser=require("cookie-parser")
const path=require("path")
require("dotenv").config();

const app=express()
const PORT=process.env.PORT || 3020

//view engine
app.set("view engine","ejs")

//middlewares
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("public/uploads"));
app.use(express.json());
app.use(cookieParser());

//routes
const home_route=require("./routes/home")
const register_route=require("./routes/user_register_login")
const login_route=require("./routes/user_login")
const dashboard_route=require("./routes/dashboard")
const profile_route=require("./routes/profile")
const posts_route=require("./routes/posts")
const notifications_route=require("./routes/notifications")

//app routes
app.use("/",home_route)
app.use("/register",register_route)
app.use("/login",login_route)
app.use("/dashboard",dashboard_route)
app.use("/profile",profile_route)
app.use("/posts",posts_route)
app.use("/notifications",notifications_route)

// global error handler (including multer upload errors)
app.use((err, req, res, next) =>
{
    if (!err) return next();

    const status = err.statusCode || 400;

    // Multer file size limit
    if (err && err.code === "LIMIT_FILE_SIZE")
    {
        return res.status(400).send("File too large. Max 5MB allowed.");
    }

    // Generic multer errors
    if (err && err.name === "MulterError")
    {
        return res.status(400).send("Upload error: " + err.message);
    }

    console.log("Unhandled error:", err);
    return res.status(status).send(err.message || "Something went wrong");
});

app.listen(PORT,()=>console.log("Server is running"))