module.exports = (sequelize, Sequelize) => {
  const AuthType = sequelize.define("authTypes", {
      id: {
          type: Sequelize.INTEGER,
          primaryKey: true
      },
      name: {
          type: Sequelize.STRING
      }
  });

  return AuthType;
};