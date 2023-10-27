const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const db = require("../models");
const UserRecord = db.userRecord;

const oAuth2Client = new google.auth.OAuth2(
	process.env.CLIENT_ID,
	process.env.CLIENT_SECRET,
	process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

async function sendMail2(req, res) {
    const mailStatus = sendMail(req.body)
    if (mailStatus !== 1){
        res.status(400)
        res.send("Bad Request")
    } else {
        res.status(200)
        res.send("Email sent successfully")
    }

}

async function sendMail(data) {
    const { email, code } = data

    // Check for valid inputs
    if (!email){
        return 0
    } 

    if (!code){
        return 0
    }
    
    // Check for valid user 
    const resp = await UserRecord.findOne({
        where: {
            email: email
        }
    })
    
    if (!resp){
        return 0
    } 

	try {
		const accessToken = await oAuth2Client.getAccessToken();
		const transport = nodemailer.createTransport({
			service: "gmail",
			auth: {
                type: "OAuth2",
                user: process.env.EMAIL_SENDER,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
				accessToken: accessToken,
			},
		});

		const mailOptions = {
            from: "CS301 Application",
            to: email,
            subject: "Verification Code to access CS301",

            // See if want to zeng until got html or not
			text: `Verification Code: ${code}`,
		};

		const result = await transport.sendMail(mailOptions)

        if (result && result.accepted && result.accepted.length > 0){
            return 1
        } else {
            return 0
        }
		
	} catch (error) {
		return 0
	}
}

module.exports = {
	sendMail,
    sendMail2,
};
