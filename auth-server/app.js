const express = require("express");
const router = require("./routes/index");
const cors = require("cors")
const app = express()
const db = require("./models/index")
const excelToJson = require('convert-excel-to-json');


const corsOptions = {
    // origin: process.env.ORIGIN
    origin: "*"
}
app.use(cors(corsOptions))

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});
app.use(router)


const initialiseUserRecords = (UserRecord) => {
    const userRecords = excelToJson({
        sourceFile: './data/users.xlsx',
        header: {
            // Is the number of rows that will be skipped and will not be present at our result object. Counting from top to bottom
            rows: 1 // 2, 3, 4, etc.
        }
    }).users

    if(userRecords.length <= 0){
        userRecords.map((record) => {
            // console.log((record.F.getMonth()))
            UserRecord.findOrCreate({
                where: { email: record.B },
                defaults: {
                    sub: record.A,
                    email: record.B,
                    first_name: record.C,
                    last_name: record.D,
                    status: record.E,
                    birthdate: record.F.toISOString().split('T')[0]
                }
            })
        })
    }
}

// Role.

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
    await db.sequelize.sync()
    initialiseRoles(db.role)
    initialiseUserRecords(db.userRecord)
}
init()

module.exports = app

