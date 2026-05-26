const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect, restrictTo } = require("../middleware/auth");
const { priceCartItem } = require("../utils/promotions");

const router = express.Router();

router.use(protect, restrictTo("client", "admin"));

async function getUserCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await cart.populate("items.product");
  }
  return cart;
}

function cartTotals(cart) {
  const items = cart.items
    .filter((item) => item.product)
    .map((item) => ({
      product: item.product,
      quantity: item.quantity,
      ...priceCartItem(item.product, item.quantity)
    }));
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = items.reduce((sum, item) => sum + item.discount, 0);
  const total = items.reduce((sum, item) => sum + item.finalSubtotal, 0);
  return { id: cart._id, items, subtotal, discount, total };
}

router.get("/", async (req, res) => {
  const cart = await getUserCart(req.user._id);
  return res.json(cartTotals(cart));
});

router.post("/items", async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }

  if (product.stock < quantity) {
    return res.status(400).json({ message: "Stock insuficiente" });
  }

  const cart = await getUserCart(req.user._id);
  const existing = cart.items.find((item) => item.product._id.toString() === productId);

  if (existing) {
    if (product.stock < existing.quantity + Number(quantity)) {
      return res.status(400).json({ message: "Stock insuficiente" });
    }
    existing.quantity += Number(quantity);
  } else {
    cart.items.push({ product: product._id, quantity: Number(quantity) });
  }

  await cart.save();
  await cart.populate("items.product");
  return res.status(201).json(cartTotals(cart));
});

router.put("/items/:productId", async (req, res) => {
  const quantity = Number(req.body.quantity);

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "La cantidad debe ser mayor a cero" });
  }

  const product = await Product.findById(req.params.productId);
  if (!product || product.stock < quantity) {
    return res.status(400).json({ message: "Stock insuficiente o producto inválido" });
  }

  const cart = await getUserCart(req.user._id);
  const item = cart.items.find((entry) => entry.product._id.toString() === req.params.productId);

  if (!item) {
    return res.status(404).json({ message: "Producto no está en el carrito" });
  }

  item.quantity = quantity;
  await cart.save();
  await cart.populate("items.product");
  return res.json(cartTotals(cart));
});

router.delete("/items/:productId", async (req, res) => {
  const cart = await getUserCart(req.user._id);
  cart.items = cart.items.filter((item) => item.product._id.toString() !== req.params.productId);
  await cart.save();
  await cart.populate("items.product");
  return res.json(cartTotals(cart));
});

module.exports = router;
