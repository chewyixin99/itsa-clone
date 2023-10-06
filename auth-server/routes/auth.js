const express = require('express');

// const router = express.Router({ mergeParams: true });
const router = express.Router();

const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");


router.post(
    "/signup",
    verifySignUp.checkEmailValidDuplicateEmail,
    verifySignUp.checkRolesExisted,
    controller.signup
);

router.post("/signin", controller.signin);


module.exports = router;