module.exports = (sequelize, Sequelize) => {
    const UserValidate = sequelize.define("userValidate", {
        email: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        otp: {
            type: Sequelize.STRING
        },
        status: {
            // 0 = invalid, 1 = valid
            type: Sequelize.BOOLEAN
        },
        updatedAt: {
            type: Sequelize.DATE,
        },
    });

    return UserValidate;
};