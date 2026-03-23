async function home(req,res) {
    return res.render("home")
}

function logout(req, res) {
    res.clearCookie("token");
    res.redirect("/login");
}

module.exports={
    home,
    logout
}