const db = require("../models");
const User = db.user;
const Role = db.role;
const UserRecord = db.userRecord;
const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
    // Save User to Database
    let sub = null
    let status = null
    console.log(req.body, "AAAAAA")
    UserRecord.findOne({
        where: {
            email: req.body.email
        }
    }).then(user => {
        if (user) {
            sub = user.sub
            status = user.status
        }
        User.create({
            sub: sub,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            birthdate: req.body.birthdate,
            status: status
        }).then(user => {
            if (req.body.roles) {
                Role.findAll({
                    where: {
                        name: {
                            [Op.or]: req.body.roles
                        }
                    }
                }).then(roles => {
                    user.setRoles(roles).then(() => {
                        res.send({ message: "User was registered successfully!" });
                    });
                });
            } else {
                // user role = 1
                user.setRoles([1]).then(() => {
                    res.send({ message: "User was registered successfully!" });
                });
            }
        })
    }).catch(err => {
        res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }

        var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password!"
            });
        }

        const token = jwt.sign({ id: user.sub },
            process.env.TOKENSECRET,
            {
                algorithm: 'HS256',
                allowInsecureKeySizes: true,
                expiresIn: 3600, // 1 hour
            });
        const refreshToken = jwt.sign({ id: user.sub },
            process.env.REFRESHSECRET,
            {
                algorithm: 'HS256',
                allowInsecureKeySizes: true,
                expiresIn: 86400, // 24 hours
            });

        var authorities = [];
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                authorities.push("ROLE_" + roles[i].name.toUpperCase());
            }
            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                sameSite: 'None', secure: true,
                maxAge: 24 * 60 * 60 * 1000
            }); 
            res.status(200).send({
                sub: user.sub,
                username: user.username,
                email: user.email,
                roles: authorities,
                accessToken: token,
            });
        });
    }).catch(err => {
        res.status(500).send({ message: err.message });
    });
};

exports.userinfo = (req, res) => {

    let token = req.headers.authorization.split(" ")[1]
    let content = jwt.decode(token)
    console.log(content)
    User.findOne({
        where: {
            sub: content.id
        }
    }).then(user => {
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
        })
    })
}
