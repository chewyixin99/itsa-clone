module.exports = (sequelize, Sequelize) => {
  const GAuth = sequelize.define("gAuth", {
      userid: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true, 
      },
      email: {
          type: Sequelize.STRING
      },
      secret: {
          type: Sequelize.STRING
      },
  });

  return GAuth;
};