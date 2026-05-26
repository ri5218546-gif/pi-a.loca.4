const mongoose = require("mongoose");

const truckSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del camión es obligatorio"],
      trim: true
    },
    plate: {
      type: String,
      required: [true, "La placa es obligatoria"],
      trim: true,
      unique: true
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker"
    },
    condition: {
      type: String,
      enum: ["Óptimas condiciones", "En reparación", "En mantenimiento"],
      default: "Óptimas condiciones"
    },
    availability: {
      type: String,
      enum: ["Disponible", "En viaje"],
      default: "Disponible"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Truck", truckSchema);
