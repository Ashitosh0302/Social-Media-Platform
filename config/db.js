const mysql = require("mysql2");

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// SSL required for Aiven and cloud MySQL
dbConfig.ssl = { rejectUnauthorized: false };

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err.code, err.message);
    } else {
        console.log("Database connected");
    }
});

module.exports = db;