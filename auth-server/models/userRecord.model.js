module.exports = (sequelize, Sequelize) => {
    const UserRecord = sequelize.define("userRecords", {
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
        birthdate: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.STRING
        }
    });

    return UserRecord;
};