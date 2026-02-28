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

        db.query(
            userSql,
            [
                username,
                email,
                password_hash,
                phone_number || null,
                date_of_birth || null,
                gender || null,
                account_type
            ],
            (err, userResult) =>
            {
                if (err)
                {
                    console.error(err);
                    return res.send("User registration failed");
                }

                const user_id = userResult.insertId;

                const profileSql = `
                    INSERT INTO profiles (user_id, full_name)
                    VALUES (?, ?)
                `;

                db.query(profileSql, [user_id, full_name], (err2) =>
                {
                    if (err2)
                    {
                        console.error(err2);
                        return res.send("Profile creation failed");
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
