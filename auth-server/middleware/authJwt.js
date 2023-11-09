const jwt = require("jsonwebtoken");
const db = require("../models");
const fs = require("fs");

const publicKey = fs.readFileSync('public.key', 'utf8');
const ssoPublicKey = fs.readFileSync('keys/sso_public_key.pem', 'utf8');
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
                jwt.verify(token, ssoPublicKey, (err2, decoded2) => {
                    if (err2) {
                        return res.status(401).send({
                            message: "Unauthorized!",
                        });
                    }
                    console.log(decoded2)
                    req.userId = decoded2.user.id;
                    req.roles = decoded2.user.roles;
                    next();
                    return
                })
            } else {
                req.userId = decoded.user.id;
                req.roles = decoded.user.roles;
                next();
            }

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
