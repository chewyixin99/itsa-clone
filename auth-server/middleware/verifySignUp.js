const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;
const UserRecord = db.userRecord

checkEmailValidDuplicateEmail = (req, res, next) => {
    // Email
    UserRecord.findOne({
        where: {
            email: req.body.email
        }
    }).then(user => {
        if (!user) {
            res.status(400).send({
                message: "Failed! Email not valid"
            })
            return;
        }

        User.findOne({
            where: {
                email: req.body.email
            }
        }).then(user => {
            if (user) {
                res.status(400).send({
                    message: "Failed! Account already created!"
                });
                return;
            }
            next()
        });
    })

};

checkRolesExisted = (req, res, next) => {
    if (req.body.roles) {
        for (let i = 0; i < req.body.roles.length; i++) {
            if (!ROLES.includes(req.body.roles[i])) {
                res.status(400).send({
                    message: "Failed! Role does not exist = " + req.body.roles[i]
                });
                return;
            }
        }
    }

    next();
};

const verifySignUp = {
    checkEmailValidDuplicateEmail: checkEmailValidDuplicateEmail,
    checkRolesExisted: checkRolesExisted
};

module.exports = verifySignUp;
