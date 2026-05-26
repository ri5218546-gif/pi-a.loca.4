const express = require("express");
const Worker = require("../models/Worker");
const Truck = require("../models/Truck");
const Trip = require("../models/Trip");
const Report = require("../models/Report");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

router.use(protect, restrictTo("driver"));

async function currentWorker(userId) {
  return Worker.findOne({ user: userId });
}

router.get("/trips", async (req, res) => {
  const worker = await currentWorker(req.user._id);
  if (!worker) return res.status(404).json({ message: "Perfil de chofer no encontrado" });

  const trips = await Trip.find({ driver: worker._id }).sort({ createdAt: -1 }).populate("truck", "name plate condition");
  return res.json(trips);
});

router.get("/reports", async (req, res) => {
  const worker = await currentWorker(req.user._id);
  if (!worker) return res.status(404).json({ message: "Perfil de chofer no encontrado" });

  const reports = await Report.find({ driver: worker._id }).sort({ createdAt: -1 }).populate("trip", "destination destinationPlace fruitType");
  return res.json(reports);
});

router.post("/reports", async (req, res) => {
  try {
    const worker = await currentWorker(req.user._id);
    if (!worker) return res.status(404).json({ message: "Perfil de chofer no encontrado" });

    const trip = await Trip.findOne({ _id: req.body.trip, driver: worker._id });
    if (!trip) return res.status(404).json({ message: "Viaje no encontrado" });

    const truckConditionUpdate = req.body.type === "Falla mecánica" ? "En reparación" : "Óptimas condiciones";

    const report = await Report.create({
      driver: worker._id,
      trip: trip._id,
      truck: trip.truck,
      type: req.body.type,
      message: req.body.message,
      truckConditionUpdate
    });

    await Truck.findByIdAndUpdate(trip.truck, { condition: report.truckConditionUpdate });
    return res.status(201).json(report);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
