const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del trabajador es obligatorio"],
      trim: true
    },
    phone: {
      type: String,
      required: [true, "El teléfono es obligatorio"],
      trim: true
    },
    address: {
      type: String,
      required: [true, "La dirección es obligatoria"],
      trim: true
    },
    bankAccount: {
      type: String,
      required: [true, "La cuenta bancaria es obligatoria"],
      trim: true
    },
    profession: {
      type: String,
      default: "Chofer",
      trim: true
    },
    laborStatus: {
      type: String,
      enum: ["Disponible", "En viaje", "Descanso", "Inactivo"],
      default: "Disponible"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Worker", workerSchema);
