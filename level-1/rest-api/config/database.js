const { Sequelize } = require("sequelize");
require("dotenv").config();

/**
 * Local: MySQL via DB_* env vars
 * Render: Postgres via DATABASE_URL
 * - External URL (*.render.com) needs SSL
 * - Internal URL (dpg-xxxx-a) usually does NOT use SSL
 */
function createSequelize() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    const needsSsl =
      process.env.DB_SSL === "true" ||
      databaseUrl.includes("render.com") ||
      databaseUrl.includes("sslmode=require");

    console.log(
      `Using Postgres DATABASE_URL (ssl=${needsSsl ? "on" : "off"})`
    );

    return new Sequelize(databaseUrl, {
      dialect: "postgres",
      logging: false,
      dialectOptions: needsSsl
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
    });
  }

  console.log("Using local MySQL DB_* settings");
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
