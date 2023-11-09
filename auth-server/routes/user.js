const express = require('express');

// const router = express.Router({ mergeParams: true });
const router = express.Router();

const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");

router.get("/userinfo", authJwt.verifyToken, controller.userinfo);

router.get("/getallusers", authJwt.verifyToken, authJwt.isModeratorOrAdmin, controller.getAllUsers);

module.exports = router;