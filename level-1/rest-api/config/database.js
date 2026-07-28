const { Sequelize } = require("sequelize");
require("dotenv").config();

// Sequelize = ORM that talks to MySQL using models instead of raw SQL
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD || null,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false, // set to console.log to see SQL queries
  }
);

module.exports = sequelize;
