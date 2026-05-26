const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Invoice = require("../models/Invoice");
const { protect, restrictTo } = require("../middleware/auth");
const buildInvoicePDF = require("../utils/pdf");
const { priceCartItem } = require("../utils/promotions");

const router = express.Router();

router.use(protect, restrictTo("client", "admin"));

function makeInvoiceNumber() {
  const date = new Date();
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PL-${stamp}-${random}`;
}

router.get("/mine", async (req, res) => {
  const invoices = await Invoice.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.json(invoices);
});

router.post("/checkout", async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "El carrito está vacío" });
  }

  const items = [];
  for (const item of cart.items) {
    const product = item.product;
    if (!product || product.stock < item.quantity) {
      return res.status(400).json({ message: `Stock insuficiente para ${product?.name || "un producto"}` });
    }

    items.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
      ...priceCartItem(product, item.quantity)
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = items.reduce((sum, item) => sum + item.discount, 0);
  const total = items.reduce((sum, item) => sum + item.finalSubtotal, 0);

  const invoice = await Invoice.create({
    invoiceNumber: makeInvoiceNumber(),
    user: req.user._id,
    customerName: req.user.name,
    customerEmail: req.user.email,
    items,
    subtotal,
    discount,
    total
  });

  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  cart.items = [];
  await cart.save();

  return res.status(201).json(invoice);
});

router.get("/:id/pdf", async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id });

  if (!invoice) {
    return res.status(404).json({ message: "Factura no encontrada" });
  }

  const pdf = await buildInvoicePDF(invoice);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${invoice.invoiceNumber}.pdf`);
  return res.send(pdf);
});

module.exports = router;
