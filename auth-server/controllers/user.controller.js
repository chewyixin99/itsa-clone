const db = require("../models");
const User = db.user
var jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");

exports.userinfo = (req, res) => {
    User.findOne({
        where: {
            sub: req.userId,
        },
    }).then((user) => {
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
        });
    });
};

exports.getAllUsers = (req, res) => {
  User.findAll({
    attributes: {
      include: [
        [
          Sequelize.fn(
            "CONCAT",
            Sequelize.col("first_name"),
            " ",
            Sequelize.col("last_name")
          ),
          "Name",
        ],
      ],
      exclude: ["password", "id", "first_name", "last_name"], // Fields to exclude
    },
  })
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    });
};
exports.getAllUsers = (req, res) => {
  User.findAll({
    attributes: {
      include: [
        [
          Sequelize.fn(
            "CONCAT",
            Sequelize.col("first_name"),
            " ",
            Sequelize.col("last_name")
          ),
          "Name",
        ],
      ],
      exclude: ["password", "id", "first_name", "last_name"], // Fields to exclude
    },
  })
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    });
};

exports.editUserInfo = (req, res) => {
  const { email, first_name, last_name, status } = req.body;
  if (req.roles.includes("admin")) {
    return updateUser(email, first_name, last_name, status, res);
  } else {
    User.findOne({
      where: {
        sub: req.userId,
      },
    }).then((user) => {
      if (user.dataValues.email !== email) {
        return res.status(401).json({ message: "Unauthorized request" });
      }
      return updateUser(email, first_name, last_name, status, res);
    });
  }
};

function updateUser(email, first_name, last_name, status, res){
  User.update(
    {
      first_name: first_name,
      last_name: last_name,
      status: status,
    },
    {
      where: {
        email: email,
      },
    }
  ).then((user) => {
    user[0] === 0
      ? res.status(404).json({ message: "User not found" })
      : res.status(200).json({ message: "User updated successfully" });
    return res;
  });
}


