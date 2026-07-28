const http = require("http");
const path = require("path");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const { sequelize, User } = require("./models");
const { initSocket } = require("./socket");
const productRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ message: "Codveda REST API + WebSockets running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@coveda.test";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const hashed = await bcrypt.hash(password, 10);

  const [user, created] = await User.findOrCreate({
    where: { email },
    defaults: {
      name: "Admin User",
      password: hashed,
      role: "admin",
    },
  });

  if (!created && !user.password) {
    await user.update({ password: hashed, role: "admin" });
  }

  if (created) {
    console.log(`Admin ready: ${email}`);
  }
}

async function start() {
  try {
    if (!process.env.DATABASE_URL && !process.env.DB_NAME) {
      throw new Error(
        "Missing DATABASE_URL (Render) or DB_NAME (local). Add DATABASE_URL in Render Environment."
      );
    }

    await sequelize.authenticate();
    // alter:true can break on Postgres enums; create missing tables only
    await sequelize.sync();
    console.log("Database connected via Sequelize");

    await ensureAdmin();
    initSocket(server);

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    console.error(err);
    process.exit(1);
  }
}

start();
