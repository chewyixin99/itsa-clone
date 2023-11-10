const express = require('express');

// const router = express.Router({ mergeParams: true });
const router = express.Router();

const { verifySignUp, authJwt } = require("../middleware");
const controller = require("../controllers/auth.controller");

router.post(
    "/signup",
    verifySignUp.checkEmailValidDuplicateEmail,
    verifySignUp.checkRolesExisted,
    controller.signup
);

router.post("/signin", controller.signin);

router.post("/signinOtp", controller.signinOtp);

router.post("/validateqr", controller.validateQR);

router.post("/qr", controller.generateQR);

router.get("/jwks", controller.jwks);

router.delete("/deleteaccount", authJwt.verifyToken, controller.deleteAccount);

router.post("/tokenExchange", controller.tokenExchange)

router.get("/userinfo", authJwt.verifyToken, controller.userInfo)

module.exports = router;