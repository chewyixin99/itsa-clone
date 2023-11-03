const mysql = require("mysql2/promise")

const createDatabaseIfNotExists = async (config) => {
    const connection = await mysql.createConnection({
        host: config[3].host,
        user: config[1],
        password: config[2],
    });

    // Run create database statement only if it doesn't exist
    try {
        const resp = await connection.query(`CREATE DATABASE IF NOT EXISTS ${config[0]}`);
        console.log(`Database ${config[0]} created.`);
    } catch (error) {
        if (error.code === "ER_DB_CREATE_EXISTS") {
            console.log(`Database ${config[0]} already exists.`);
        } else {
            console.error("Error creating the database:", error);
        }
    } finally {
        connection.end();
    }
};

let config = [
    process.env.DATABASE,
    process.env.DBUSER,
    process.env.PASSWORD,
    {
        host: process.env.HOST,
        dialect: process.env.DIALECT,
    }
]
if (process.env.NODE_ENV) {
    config = [
        "testdb",
        "root",
        "password",
        {
            host: "localhost",
            dialect: "mysql"
        }
    ]
}

module.exports = { config, createDatabaseIfNotExists }