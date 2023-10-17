module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
        sub: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        first_name: {
            type: Sequelize.STRING
        },
        last_name: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        birthdate: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.STRING
        }
    });

    return User;
};