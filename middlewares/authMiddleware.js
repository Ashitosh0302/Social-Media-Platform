const jwt = require("jsonwebtoken");

module.exports = (req, res, next) =>
{
    // Debug: log received cookies
    console.log("Cookies received:", req.cookies);

    const token = req.cookies.token;

    // If no token, redirect to login
    if (!token)
    {
        console.log("No JWT token found in cookies");
        return res.redirect("/login");
    }

    try
    {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Make sure the token includes user id
        if (!decoded.id)
        {
            console.log("JWT token does not include user id");
            return res.redirect("/login");
        }

        // Attach user info to req.user
        req.user = {
            id: decoded.id,         // integer user id
            email: decoded.email,   // user's email
            username: decoded.username // username
        };

        next();
    }
    catch (err)
    {
        console.log("JWT verification failed:", err.message);
        return res.redirect("/login");
    }
};
