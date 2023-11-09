const AWS = require("aws-sdk");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const db = require("../models");
const UserRecord = db.userRecord;

AWS.config.credentials = new AWS.Credentials(
    process.env.AWSACCESSKEYID,
    process.env.AWSSECRETACCESSKEY
);
AWS.config.update({ region: "ap-southeast-1" });

async function sendMail2(req, res) {
    const mailStatus = sendMail(req.body);
    if (mailStatus !== 1) {
        res.status(400);
        res.send("Bad Request");
    } else {
        res.status(200);
        res.send("Email sent successfully");
    }
}

async function sendMail(data) {
    const { email, code } = data;

    // Check for valid inputs
    if (!email) {
        return 0;
    }

    if (!code) {
        return 0;
    }

    // Check for valid user
    const resp = await UserRecord.findOne({
        where: {
            email: email,
        },
    });

    if (!resp) {
        return 0;
    }

    const ses = new AWS.SES();
    var params = {
        Destination: {
            ToAddresses: [
                `${email}`, // The recipient's email address
            ],
        },
        Message: {
            Body: {
                Html: {
                    Data: `<html><body><h1>Login OTP</h1><p>Your One-Time Password (OTP) is <strong>${code}</strong>. It is valid for 5 minutes.</p></body></html>`,
                    Charset: "UTF-8",
                },
                Text: {
                    Data: `Your OTP is ${code}. It is valid for 5 minutes.`,
                    Charset: "UTF-8",
                },
            },
            Subject: {
                Data: "OTP (One-Time Password)",
                Charset: "UTF-8",
            },
        },
        Source: "cs301g3t6@gmail.com", // Your verified sender email address
        Tags: [
            {
                Name: "otp-email", // Tag name to categorize or track emails
                Value: "otp", // Tag value
            },
        ],
    };

    ses.sendEmail(params, function (err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            return 0;
        } else {
            console.log(data); // successful response
            return 1;
        }
    });
}

// FOR GMAIL

// const oAuth2Client = new google.auth.OAuth2(
// 	process.env.CLIENT_ID,
// 	process.env.CLIENT_SECRET,
// 	process.env.REDIRECT_URI
// );

// oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// async function old_email () {
//     try {
// 		const accessToken = await oAuth2Client.getAccessToken();
// 		const transport = nodemailer.createTransport({
// 			service: "gmail",
// 			auth: {
//                 type: "OAuth2",
//                 user: process.env.EMAIL_SENDER,
//                 clientId: process.env.CLIENT_ID,
//                 clientSecret: process.env.CLIENT_SECRET,
//                 refreshToken: process.env.REFRESH_TOKEN,
// 				accessToken: accessToken,
// 			},
// 		});

// 		const mailOptions = {
//             from: "CS301 Application",
//             to: email,
//             subject: "Verification Code to access CS301",

//             // See if want to zeng until got html or not
// 			text: `Verification Code: ${code}`,
// 		};

// 		const result = await transport.sendMail(mailOptions)

//         if (result && result.accepted && result.accepted.length > 0){
//             return 1
//         } else {
//             return 0
//         }

// 	} catch (error) {
// 		return 0
// 	}
// }

module.exports = {
    sendMail,
    sendMail2,
};
