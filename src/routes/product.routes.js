const express = require("express");
const Product = require("../models/Product");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  const { search = "", category = "", promotion = "" } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (promotion === "with") {
    filter["promotion.type"] = { $ne: "none" };
  }

  if (promotion === "without") {
    filter["promotion.type"] = { $in: ["none", null] };
  }

  const products = await Product.find(filter).sort({ featured: -1, createdAt: -1 });
  return res.json(products);
});

router.get("/categories", async (req, res) => {
  const categories = await Product.distinct("category");
  return res.json(categories.sort());
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }

  return res.json(product);
});

router.post("/", protect, restrictTo("admin"), async (req, res) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json(product);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.put("/:id", protect, restrictTo("admin"), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.json(product);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", protect, restrictTo("admin"), async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }

  return res.json({ message: "Producto eliminado" });
});

module.exports = router;
