const express = require("express");
const router = require("./routes/index");
const cors = require("cors")
const app = express()
const dbInit = require("./models/index")

const corsOptions = {
    origin: process.env.ORIGIN
}
app.use(express.urlencoded({ extended: true }));
app.use(router)
app.use(express.json())
app.use(cors(corsOptions))


const initialiseRoles = (Role) => {
    Role.findOrCreate({
        where: { id: 1 },
        defaults: {
            id: 1, name: "user"
        },
    }).then(([role, created]) => {
        if (created) {
            console.log('Role user created successfully!');
        } else {
            console.log('Role user already exists.');
        }
    }).catch((error) => {
        console.error('Error:', error);
    });

    Role.findOrCreate({
        where: { id: 2 },
        defaults: {
            id: 2, name: "admin"
        },
    }).then(([role, created]) => {
        if (created) {
            console.log('Role admin created successfully!');
        } else {
            console.log('Role admin already exists.');
        }
    }).catch((error) => {
        console.error('Error:', error);
    });
}

const init = async () => {
    db = await dbInit()
    await db.sequelize.sync()
    await initialiseRoles(db.role)
}
init()

module.exports = app

