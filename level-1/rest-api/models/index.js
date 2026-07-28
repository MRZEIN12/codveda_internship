const sequelize = require("../config/database");
const User = require("./User");
const Product = require("./Product");

// Relationships (Level 2 Task 3 objective)
User.hasMany(Product, {
  foreignKey: "user_id",
  as: "products",
});

Product.belongsTo(User, {
  foreignKey: "user_id",
  as: "creator",
});

module.exports = { sequelize, User, Product };
