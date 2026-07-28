const express = require("express");
const { Product, User } = require("../models");
const { authenticate, authorize } = require("../middleware/auth");
const { getIO } = require("../socket");

const router = express.Router();

function validationError(err, res) {
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({ error: err.errors.map((e) => e.message).join(", ") });
  }
  return null;
}

function emitProductEvent(type, payload, userId) {
  try {
    const io = getIO();
    // Broadcast to everyone
    io.emit("product:event", { type, product: payload, at: new Date().toISOString() });

    // User-specific notification room
    if (userId) {
      io.to(`user_${userId}`).emit("notification", {
        message: `Your product action (${type}) completed`,
        type,
        product: payload,
      });
    }
  } catch (err) {
    console.error("Socket emit failed:", err.message);
  }
}

// CREATE — logged-in users only
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { name, description, price, stock } = req.body;

    const product = await Product.create({
      name,
      description: description || null,
      price,
      stock: stock ?? 0,
      user_id: req.user.id,
    });

    emitProductEvent("created", product, req.user.id);
    res.status(201).json(product);
  } catch (err) {
    if (validationError(err, res)) return;
    next(err);
  }
});

// READ ALL — public
router.get("/", async (req, res, next) => {
  try {
    const products = await Product.findAll({
      order: [["id", "ASC"]],
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// READ ONE — public
router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: User, as: "creator", attributes: ["id", "name", "email"] }],
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
});

// UPDATE — logged-in users only
router.put("/:id", authenticate, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { name, description, price, stock } = req.body;
    await product.update({ name, description, price, stock });

    emitProductEvent("updated", product, req.user.id);
    res.json(product);
  } catch (err) {
    if (validationError(err, res)) return;
    next(err);
  }
});

// DELETE — admin only
router.delete("/:id", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const snapshot = product.toJSON();
    await product.destroy();

    emitProductEvent("deleted", snapshot, req.user.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
