const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    message: String,
    sentAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
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
    destination: {
      type: String,
      enum: ["Potra", "Frutexpo", "Costeña"],
      required: true
    },
    destinationPlace: {
      type: String,
      enum: ["Jocotillo Escuintla", "Zacapa", "Honduras"],
      required: true
    },
    fruitType: {
      type: String,
      enum: ["Piña", "Sandía"],
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    departureDate: {
      type: Date,
      required: true
    },
    estimatedReturnDate: {
      type: Date,
      required: true
    },
    notifications: [notificationSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
