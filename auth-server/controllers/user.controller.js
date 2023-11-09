const db = require("../models");
const User = db.user
var jwt = require("jsonwebtoken");

exports.userinfo = (req, res) => {
    User.findOne({
        where: {
            sub: req.userId,
        },
    }).then((user) => {
        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }
        res.send({
            sub: user.sub,
            email: user.email,
            given_name: user.first_name,
            family_name: user.last_name,
            name: user.first_name + " " + user.last_name,
            birthdate: new Date(user.birthdate),
            // "gender": "Female",
            // "phone_number": "+967 (103) 878-2610"
        });
    });
};

exports.getAllUsers = (req, res) => {
    User.findAll({
        attributes:{exclude: ["password", "createdAt", "updatedAt", "status"]},
    })
        .then(users => {
            res.status(200).json(users);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        });
};

