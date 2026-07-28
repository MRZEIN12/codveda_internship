/**
 * One-time script: create an admin user with a hashed password.
 * Run: node scripts/seedAdmin.js
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize, User } = require("../models");

async function seedAdmin() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const name = "Admin User";
  const email = "admin@coveda.test";
  const password = "admin123";
  const hashed = await bcrypt.hash(password, 10);

  const [user, created] = await User.findOrCreate({
    where: { email },
    defaults: { name, password: hashed, role: "admin" },
  });

  if (!created) {
    await user.update({ password: hashed, role: "admin", name });
    console.log("Admin password updated.");
  } else {
    console.log("Admin user created.");
  }

  console.log({ email, password, role: "admin" });
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
