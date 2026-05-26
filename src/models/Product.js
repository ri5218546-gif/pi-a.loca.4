const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true
    },
    description: {
      type: String,
      required: [true, "La descripción es obligatoria"],
      trim: true
    },
    price: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: 0
    },
    image: {
      type: String,
      required: [true, "La imagen es obligatoria"]
    },
    stock: {
      type: Number,
      required: [true, "El stock es obligatorio"],
      min: 0,
      default: 0
    },
    category: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      trim: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    promotion: {
      type: {
        type: String,
        enum: ["none", "2x1", "discount5", "discount10", "day"],
        default: "none"
      },
      dayOfWeek: {
        type: Number,
        min: 0,
        max: 6
      },
      label: {
        type: String,
        trim: true,
        default: ""
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
