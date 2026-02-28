const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// render login page
async function loginPage(req, res) {
    res.render("login_page", { error: null });
}

// login user
async function loginUser(req, res) {
    try {
        const { login, password } = req.body;

        const sql = `
            SELECT * FROM users
            WHERE username = ? OR email = ?
        `;

        db.query(sql, [login, login], async (err, result) => {
            if (err) {
                return res.render("login_page", { error: "Something went wrong" });
            }

            if (result.length === 0) {
                return res.render("login_page", { error: "User not found" });
            }

            const user = result[0];

            const isMatch = await bcrypt.compare(password, user.password_hash);

            if (!isMatch) {
                return res.render("login_page", { error: "Invalid password" });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    email: user.email
                },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            res.cookie("token", token,
                {
                    httpOnly: true,
                    sameSite: "lax",
                    secure: false,       // REQUIRED for localhost
                    path: "/"
                });


            return res.status(302).redirect("/dashboard");
        });
    }
    catch (error) {
        console.log(error);
        res.render("login_page", { error: "Something went wrong" });
    }
}

module.exports =
{
    loginPage,
    loginUser
};
