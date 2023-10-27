const express = require("express");
const router = express.Router();

const mailController = require("../controllers/mail.controller");

router.get("/health", (req, res) => {
    const healthcheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now()
    };
    res.send(JSON.stringify(healthcheck));
});

router.post(
	"/send", mailController.sendMail2
);

module.exports = router;
