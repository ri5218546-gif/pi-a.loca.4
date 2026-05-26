const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true
    },
    truck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
      required: true
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true
    },
    type: {
      type: String,
      enum: ["Falla mecánica", "Producto dañado", "Accidente", "Contratiempo", "Retraso"],
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    truckConditionUpdate: {
      type: String,
      enum: ["Óptimas condiciones", "En reparación", "En mantenimiento"],
      default: "Óptimas condiciones"
    },
    status: {
      type: String,
      enum: ["Nuevo", "Revisado"],
      default: "Nuevo"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
