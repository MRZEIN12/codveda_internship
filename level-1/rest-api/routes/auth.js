const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

function validationError(err, res) {
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({ error: err.errors.map((e) => e.message).join(", ") });
  }
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({ error: "Email already registered" });
  }
  return null;
}

// SIGNUP — POST /api/auth/signup
router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    if (validationError(err, res)) return;
    next(err);
  }
});

// LOGIN — POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

// ME — GET /api/auth/me
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role", "created_at"],
      include: [{ association: "products", attributes: ["id", "name", "price"] }],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
