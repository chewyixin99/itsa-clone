const db = require("../models");
const User = db.user;
const Role = db.role;
const UserRecord = db.userRecord;
const Op = db.Sequelize.Op;
const UserValidate = db.userValidate;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const { sendMail } = require("./mail.controller");

function generateOTP() {
	let code = Math.floor(Math.random() * 1000000);
	code = code.toString().padStart(6, "0");
	return code;
}

exports.signup = (req, res) => {
    // Save User to Database
    let sub = null
    let status = null

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

// exports.signin = (req, res) => {
//     User.findOne({
//         where: {
//             email: req.body.email
//         }
//     }).then(user => {
//         if (!user) {
//             return res.status(404).send({ message: "User Not found." });
//         }

//         var passwordIsValid = bcrypt.compareSync(
//             req.body.password,
//             user.password
//         );

//         if (!passwordIsValid) {
//             return res.status(401).send({
//                 accessToken: null,
//                 message: "Invalid Password!"
//             });
//         }

//         const token = jwt.sign({ id: user.sub },
//             process.env.TOKENSECRET,
//             {
//                 algorithm: 'HS256',
//                 allowInsecureKeySizes: true,
//                 expiresIn: 3600, // 1 hour
//             });
//         const refreshToken = jwt.sign({ id: user.sub },
//             process.env.REFRESHSECRET,
//             {
//                 algorithm: 'HS256',
//                 allowInsecureKeySizes: true,
//                 expiresIn: 86400, // 24 hours
//             });

//         var authorities = [];
//         user.getRoles().then(roles => {
//             for (let i = 0; i < roles.length; i++) {
//                 authorities.push("ROLE_" + roles[i].name.toUpperCase());
//             }
//             res.cookie('jwt', refreshToken, {
//                 httpOnly: true,
//                 sameSite: 'None', secure: true,
//                 maxAge: 24 * 60 * 60 * 1000
//             }); 
//             res.status(200).send({
//                 sub: user.sub,
//                 username: user.username,
//                 email: user.email,
//                 roles: authorities,
//                 accessToken: token,
//             });
//         });
//     }).catch(err => {
//         res.status(500).send({ message: err.message });
//     });
// };

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


exports.signin = async (req, res) => {
    const { email, password } = req.body;

	if (!email || email === "") {
		res.status(400);
		res.send("Please enter an email");
		return;
	}

	if (!password || password === "") {
		res.status(400);
		res.send("Please enter a password");
		return;
	}

	const user = await User.findOne({
		where: {
			email: email,
		},
	});

	if (!user) {
		res.status(400);
		res.send("Invalid Username / Password");
		return;
	}

	const passwordMatch = bcrypt.compareSync(password, user.password);

	if (!passwordMatch) {
		res.status(400);
		res.send("Invalid Username or Password");
		return;
	}

	// Send OTP function
	const otpCode = generateOTP();
	try {
		// Find the record based on a unique identifier (e.g., primary key)
		const [record, created] = await UserValidate.findOrCreate({
			where: { email: email },
			defaults: { email: email, otp: bcrypt.hashSync(otpCode, 8), status: 1 },
		});

		if (created) {
			console.log("New record created:", record.toJSON());
		} else {
			const updatedRecord = await record.update({
				email: email,
				otp: bcrypt.hashSync(otpCode, 8),
				status: 1,
			});
			console.log("Existing record updated:", record.toJSON());
		}

		if (record) {
			data = {
				email: email,
				code: otpCode,
			};

			// Async call to email, if fail then call again
			await sendMail(data);
			res.send("Please enter OTP");
		}
	} catch (error) {
		res.status(500);
		res.send(error);
	}
};

exports.signinOtp = async (req, res) => {
    const { email, code } = req.body;
	if (!email || email === "") {
		res.status(400);
		res.send("Please enter an email");
		return;
	}

	if (!code || code === "") {
		res.status(400);
		res.send("Please enter the otp");
		return;
	}

	const validUser = await UserValidate.findOne({
		where: {
			email: email,
		},
	});

	// User doesnt exist
	if (!validUser || validUser.status === 0) {
		res.status(400);
		res.send("Bad Request");
		return;
	}

	// OTP password expired
	const updateTime = new Date(validUser.updatedAt);
	const currentTime = new Date();
	const timeDiffMins = (currentTime - updateTime) / 60000;
	if (timeDiffMins > 5) {
		await UserValidate.update({ status: 0 }, { where: { email: email } });
		res.status(400);
		res.send("OTP expired, please request a new OTP");
		return;
	}

	// OTP doesnt exist
	if (validUser.status === 0) {
		res.status(400);
		res.send("Invalid request, please try again");
		return;
	}

	const validateOTP = bcrypt.compareSync(code, validUser.otp);

	if (!validateOTP) {
		res.status(400);
		res.send("Invalid OTP, please try again");
		return;
	}

	// make the otp invalid
	await UserValidate.update({ status: 0 }, { where: { email: email } });

    // Update user Status if not activated
    await User.update({ status: "active" }, { where: { email: email } });

	const user = await User.findOne({
		where: {
			email: email,
		},
	});

	// Grant user access, generate and provide the token?
	const token = jwt.sign({ id: user.sub }, process.env.TOKENSECRET, {
		algorithm: "HS256",
		allowInsecureKeySizes: true,
		expiresIn: 3600, // 1 hour
	});

	const refreshToken = jwt.sign({ id: user.sub }, process.env.REFRESHSECRET, {
		algorithm: "HS256",
		allowInsecureKeySizes: true,
		expiresIn: 86400, // 24 hours
	});

	var authorities = [];

	user.getRoles().then((roles) => {
		for (let i = 0; i < roles.length; i++) {
			authorities.push("ROLE_" + roles[i].name.toUpperCase());
		}
		res.cookie("jwt", refreshToken, {
			httpOnly: true,
			sameSite: "None",
			secure: true,
			maxAge: 24 * 60 * 60 * 1000,
		});
		res.status(200).send({
			sub: user.sub,
			username: user.username,
			email: user.email,
			roles: authorities,
			accessToken: token,
		});
	});
};