const mysql = require("mysql2")
const Sequelize = require("sequelize");

// const setUpDB = async () => {
//     const connection = await mysql.createConnection({
//         host: process.env.HOST,
//         user: process.env.USERNAME,
//         password: process.env.PASSWORD,
//     });

//     // Run create database statement
//     await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DATABASE}`);
//     // await connection.end()
// }

// await setUpDB()
const sequelize = new Sequelize(
        process.env.DATABASE,
        process.env.USERNAME,
        process.env.PASSWORD,
        {
            host: process.env.HOST,
            dialect: process.env.DIALECT,
        }
    );

    const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.userRecord = require("../models/userRecord.model.js")(sequelize, Sequelize);

db.role.belongsToMany(db.user, {
    through: "user_roles"
});
db.user.belongsToMany(db.role, {
    through: "user_roles"
});

db.ROLES = ["user", "admin"];

module.exports = db