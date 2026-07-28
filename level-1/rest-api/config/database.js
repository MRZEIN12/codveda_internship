const { Sequelize } = require("sequelize");
require("dotenv").config();

/**
 * Local: MySQL via DB_* env vars
 * Render: Postgres via DATABASE_URL
 */
function createSequelize() {
  if (process.env.DATABASE_URL) {
    return new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    });
  }

  return new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD || null,
    {
      host: process.env.DB_HOST || "localhost",
      dialect: "mysql",
      logging: false,
    }
  );
}

const sequelize = createSequelize();

module.exports = sequelize;
