const http = require("http");
const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { sequelize } = require("./models");
const { initSocket } = require("./socket");
const productRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health / API info
app.get("/api", (req, res) => {
  res.json({ message: "Codveda REST API + WebSockets running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// Serve frontend (full-stack integration)
app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("MySQL connected via Sequelize");

    initSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Frontend: http://localhost:${PORT}/index.html`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
