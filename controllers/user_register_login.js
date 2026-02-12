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
        const
        {
            username,
            email,
            password,
            phone_number,
            date_of_birth,
            gender,
            account_type
        } = req.body;

        const password_hash = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users
            (username, email, password_hash, phone_number, date_of_birth, gender, account_type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                username,
                email,
                password_hash,
                phone_number,
                date_of_birth,
                gender,
                account_type
            ],
            (err, result) =>
            {
                if(err)
                {
                    console.log(err);
                    return res.send("Registration Failed");
                }

                res.send("User Registered Successfully");
            }
        );
    }
    catch(error)
    {
        console.log(error);
        res.send("Something went wrong");
    }
}

module.exports =
{
    register_page,
    registerUser
};
