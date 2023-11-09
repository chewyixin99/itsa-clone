const express = require("express");
const router = require("./routes/index");
const cors = require("cors")
const app = express()
const db = require("./models/index")
const excelToJson = require('convert-excel-to-json');
const Op = db.Sequelize.Op;
var bcrypt = require("bcryptjs");
const { config, createDatabaseIfNotExists } = require("./models/setup")

const corsOptions = {
    origin: process.env.ORIGIN
    // origin: "*"
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

    if (process.env.NODE_ENV) {
        // UserRecord.create({
        //     sub: "testsub1",
        //     email: "test@email.com",
        //     first_name: "test",
        //     last_name: "user",
        //     status: "valid",
        //     birthdate: "1999-9-9"
        // })
        return
    } 
    UserRecord.count().then(count=>{

        if (count <= 0){
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
    }) 
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
    Role.findOrCreate({
        where: { id: 3 },
        defaults: {
            id: 3, name: "moderator"
        },
    }).then(([role, created]) => {
        if (created) {
            console.log('Role moderator created successfully!');
        } else {
            console.log('Role moderator already exists.');
        }
    }).catch((error) => {
        console.error('Error:', error);
    });
}
const initialiseDemoUsers = async (User, Role) => {
    const user1 = await User.findOne({
        where: {
            sub: "testsub1"
        }
    })
    const user2 = await User.findOne({
        where: {
            sub: "testsub2"
        }
    })
    const user3 = await User.findOne({
        where: {
            sub: "testsub3"
        }
    })
    if (!user1) {
        await User.create({
            sub: "testsub1",
            email: "demouser@example.com",
            password: bcrypt.hashSync("password", 8),
            first_name: "Demo",
            last_name: "User",
            birthdate: "10/10/10",
            status: "valid",
        }).then((user) => {
            // user role = 1
            user.setAuthTypes(3);
            user.setRoles([1]);
        });
    }
    if (!user2) {
        await User.create({
            sub: "testsub2",
            email: "demomod@example.com",
            password: bcrypt.hashSync("password", 8),
            first_name: "Demo",
            last_name: "Moderator",
            birthdate: "11/11/11",
            status: "valid",
        }).then((user) => {
            console.log("AAAAAAAAAAAA")
            // user role = 1
            user.setAuthTypes(3);
            user.setRoles([1, 2]);
        });
    }
    if (!user3) {
        await User.create({
            sub: "testsub3",
            email: "demoadmin@example.com",
            password: bcrypt.hashSync("password", 8),
            first_name: "Demo",
            last_name: "Admin",
            birthdate: "12/12/12",
            status: "valid",
        }).then((user) => {
            // user role = 1
            user.setAuthTypes(3);
            user.setRoles([1, 2, 3]);
        });
    }
}

const initialiseAuthType = (AuthType) => {
    AuthType.findOrCreate({
        where: { id: 1 },
        defaults: {
            id: 1, name: "otp"
        },
    }).then(([role, created]) => {
        if (created) {
            console.log('OTP auth created successfully!');
        } else {
            console.log('OTP auth already exists.');
        }
    }).catch((error) => {
        console.error('Error:', error);
    });

    AuthType.findOrCreate({
        where: { id: 2 },
        defaults: {
            id: 2, name: "gauth"
        },
    }).then(([role, created]) => {
        if (created) {
            console.log('gauth created successfully!');
        } else {
            console.log('gauth already exists.');
        }
    }).catch((error) => {
        console.error('Error:', error);
    });
    AuthType.findOrCreate({
        where: { id: 3 },
        defaults: {
            id: 3, name: "custom"
        },
    }).then(([role, created]) => {
        if (created) {
            console.log('custom created successfully!');
        } else {
            console.log('custom already exists.');
        }
    }).catch((error) => {
        console.error('Error:', error);
    });
}

const init = async () => {
    await createDatabaseIfNotExists(config)
    await db.sequelize.sync()
    await Promise.all([initialiseRoles(db.role),
    initialiseUserRecords(db.userRecord),
    initialiseAuthType(db.authType),
    initialiseDemoUsers(db.user, db.role)])
}
module.exports = { app, init }

