const db = require("../config/db");
const bcrypt = require("bcrypt");

// render register page
async function register_page(req, res)
{
    res.render("register_page");
}

// register user
async function registerUser(req, res)
{
    try
    {
        const {
            username,
            email,
            password,
            full_name,
            phone_number,
            date_of_birth,
            gender,
            account_type
        } = req.body;

        const password_hash = await bcrypt.hash(password, 10);

        const userSql = `
            INSERT INTO users
            (username, email, password_hash, phone_number, date_of_birth, gender, account_type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const accountType = (account_type === "public" || account_type === "private") ? account_type : "private";

        db.query(
            userSql,
            [
                username,
                email,
                password_hash,
                phone_number || null,
                date_of_birth || null,
                gender || null,
                accountType
            ],
            (err, userResult) =>
            {
                if (err)
                {
                    console.error("Registration DB error:", err.code, err.sqlMessage);
                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(400).send("Email or username already in use. Please try another.");
                    }
                    if (err.code === "ER_NO_SUCH_TABLE") {
                        return res.status(500).send("Database not configured. Please run the SQL scripts in the db/ folder on your database.");
                    }
                    return res.status(500).send("User registration failed. Please try again.");
                }

                const user_id = userResult.insertId;

                const profileSql = `
                    INSERT INTO profiles (user_id, full_name)
                    VALUES (?, ?)
                `;

                db.query(profileSql, [user_id, full_name || ""], (err2) =>
                {
                    if (err2)
                    {
                        console.error("Profile creation error:", err2.code, err2.sqlMessage);
                        return res.status(500).send("Profile creation failed. Please try again.");
                    }
                    res.redirect("/");
                });
            }
        );
    }
    catch (error)
    {
        console.error(error);
        res.send("Something went wrong");
    }
}

module.exports =
{
    register_page,
    registerUser
};
