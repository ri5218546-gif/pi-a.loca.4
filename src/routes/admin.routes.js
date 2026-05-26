const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const Invoice = require("../models/Invoice");
const Worker = require("../models/Worker");
const Truck = require("../models/Truck");
const Trip = require("../models/Trip");
const Report = require("../models/Report");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

router.use(protect, restrictTo("admin"));

router.get("/dashboard", async (req, res) => {
  const [totalProducts, totalUsers, invoices, recentInvoices] = await Promise.all([
    Product.countDocuments(),
    User.countDocuments(),
    Invoice.find(),
    Invoice.find().sort({ createdAt: -1 }).limit(6)
  ]);

  const totalSales = invoices.reduce((sum, invoice) => sum + invoice.total, 0);

  return res.json({
    totalProducts,
    totalUsers,
    totalWorkers: await Worker.countDocuments(),
    activeTrips: await Trip.countDocuments(),
    openReports: await Report.countDocuments({ status: "Nuevo" }),
    totalSales,
    recentInvoices
  });
});

router.get("/users", async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  return res.json(users);
});

router.get("/invoices", async (req, res) => {
  const invoices = await Invoice.find().sort({ createdAt: -1 }).populate("user", "name email");
  return res.json(invoices);
});

router.get("/workers", async (req, res) => {
  const { search = "" } = req.query;
  const filter = search
    ? { $or: [{ name: { $regex: search, $options: "i" } }, { phone: { $regex: search, $options: "i" } }] }
    : {};
  const workers = await Worker.find(filter).sort({ createdAt: -1 }).populate({
    path: "user",
    select: "name email role +password"
  });
  return res.json(workers);
});

router.post("/workers", async (req, res) => {
  try {
    const { name, email, password, phone, address, bankAccount, profession, laborStatus } = req.body;
    if (!password) return res.status(400).json({ message: "La contraseña inicial es obligatoria" });
    const user = await User.create({ name, email, password, role: "driver" });
    const worker = await Worker.create({
      name,
      phone,
      address,
      bankAccount,
      profession,
      laborStatus,
      user: user._id
    });
    return res.status(201).json(await worker.populate("user", "name email role"));
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.put("/workers/:id", async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ message: "Trabajador no encontrado" });

    const { name, email, password, phone, address, bankAccount, profession, laborStatus } = req.body;
    Object.assign(worker, { name, phone, address, bankAccount, profession, laborStatus });
    await worker.save();

    const userUpdate = { name, email, role: "driver" };
    if (password) userUpdate.password = password;
    const user = await User.findById(worker.user);
    Object.assign(user, userUpdate);
    await user.save();

    return res.json(await worker.populate("user", "name email role"));
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.delete("/workers/:id", async (req, res) => {
  const worker = await Worker.findByIdAndDelete(req.params.id);
  if (!worker) return res.status(404).json({ message: "Trabajador no encontrado" });
  await User.findByIdAndDelete(worker.user);
  return res.json({ message: "Trabajador eliminado" });
});

router.get("/trucks", async (req, res) => {
  const trucks = await Truck.find().sort({ createdAt: -1 }).populate("driver", "name phone laborStatus");
  const summary = {
    total: trucks.length,
    available: trucks.filter((truck) => truck.availability === "Disponible").length,
    optimal: trucks.filter((truck) => truck.condition === "Óptimas condiciones").length,
    repair: trucks.filter((truck) => truck.condition === "En reparación").length,
    maintenance: trucks.filter((truck) => truck.condition === "En mantenimiento").length
  };
  return res.json({ trucks, summary });
});

router.post("/trucks", async (req, res) => {
  try {
    const truck = await Truck.create(req.body);
    return res.status(201).json(truck);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.put("/trucks/:id", async (req, res) => {
  try {
    const truck = await Truck.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!truck) return res.status(404).json({ message: "Camión no encontrado" });
    return res.json(truck);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.delete("/trucks/:id", async (req, res) => {
  const truck = await Truck.findByIdAndDelete(req.params.id);
  if (!truck) return res.status(404).json({ message: "Camión no encontrado" });
  return res.json({ message: "Camión eliminado" });
});

router.get("/trips", async (req, res) => {
  const trips = await Trip.find().sort({ createdAt: -1 }).populate("driver", "name phone").populate("truck", "name plate condition");
  return res.json(trips);
});

router.post("/trips", async (req, res) => {
  try {
    const trip = await Trip.create(req.body);
    await Promise.all([
      Truck.findByIdAndUpdate(req.body.truck, { availability: "En viaje", driver: req.body.driver }),
      Worker.findByIdAndUpdate(req.body.driver, { laborStatus: "En viaje" })
    ]);
    return res.status(201).json(await trip.populate(["driver", "truck"]));
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.put("/trips/:id", async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!trip) return res.status(404).json({ message: "Viaje no encontrado" });
    return res.json(await trip.populate(["driver", "truck"]));
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.post("/trips/:id/notify", async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) return res.status(404).json({ message: "Viaje no encontrado" });
  trip.notifications.push({ message: req.body.message });
  await trip.save();
  return res.json(trip);
});

router.get("/reports", async (req, res) => {
  const reports = await Report.find({ status: "Nuevo" })
    .sort({ createdAt: -1 })
    .populate("driver", "name phone")
    .populate("truck", "name plate condition")
    .populate("trip", "destination destinationPlace fruitType");
  return res.json(reports);
});

router.patch("/reports/:id/review", async (req, res) => {
  const report = await Report.findByIdAndUpdate(req.params.id, { status: "Revisado" }, { new: true });
  if (!report) return res.status(404).json({ message: "Reporte no encontrado" });
  return res.json(report);
});

module.exports = router;
