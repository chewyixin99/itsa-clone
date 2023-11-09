const jwt = require("jsonwebtoken");
const db = require("../models");
const fs = require("fs");

const publicKey = fs.readFileSync('public.key', 'utf8');
const User = db.user;
verifyToken = (req, res, next) => {
    let tokenHeader = req.headers.authorization;

    if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
        return res.status(403).send({
            message: "No token provided!"
        });
    }
    let token = tokenHeader.substring(7, tokenHeader.length)
    jwt.verify(token,
        publicKey,
        (err, decoded) => {
            // if (err.name === "TokenExpiredError") {
            // return res.status()
            // }
            if (err) {
                return res.status(401).send({
                    message: "Unauthorized!",
                });
            }
            req.userId = decoded.id;
            req.roles = decoded.roles;
            next();
        });
};

isAdmin = (req, res, next) => {
    const { roles } = req;
    if (['admin'].some(role => roles.includes(role))) {
        next();
        return;
    }
};

isModerator = (req, res, next) => {
    const { roles } = req;
    if (['moderator'].some(role => roles.includes(role))) {
        next();
        return;
    }
};

isModeratorOrAdmin = (req, res, next) => {
    const { roles } = req;
    if (['admin', 'moderator'].some(role => roles.includes(role))) {
        next();
        return;
    }
};

const authJwt = {
    verifyToken: verifyToken,
    isAdmin: isAdmin,
    isModerator: isModerator,
    isModeratorOrAdmin: isModeratorOrAdmin
};
module.exports = authJwt;
