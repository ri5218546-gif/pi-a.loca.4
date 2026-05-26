require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/User");
const Product = require("../models/Product");
const Worker = require("../models/Worker");
const Truck = require("../models/Truck");

const sampleProducts = [
  {
    name: "Piña dorada",
    description: "Piña dulce, jugosa y lista para compartir.",
    price: 18,
    image: "/assets/product-pina.svg",
    stock: 40,
    category: "Piñas",
    featured: true,
    promotion: { type: "2x1", label: "2x1 los jueves", dayOfWeek: 4 }
  },
  {
    name: "Mango tropical",
    description: "Mangos maduros con sabor intenso y textura suave.",
    price: 9,
    image: "/assets/product-mango.svg",
    stock: 55,
    category: "Frutas tropicales",
    featured: true,
    promotion: { type: "discount5", label: "5% de descuento" }
  },
  {
    name: "Canasta fiesta",
    description: "Selección colorida de frutas para reuniones.",
    price: 85,
    image: "/assets/product-basket.svg",
    stock: 18,
    category: "Combos",
    featured: true,
    promotion: { type: "none" }
  }
];

async function ensureAdminUser() {
  const email = (process.env.ADMIN_EMAIL || "admin@pinaloca.com").toLowerCase();
  const exists = await User.findOne({ email });

  if (!exists) {
    await User.create({
      name: process.env.ADMIN_NAME || "Administrador Piña Loca",
      email,
      password: process.env.ADMIN_PASSWORD || "Admin12345",
      role: "admin"
    });
    console.log(`Admin creado: ${email}`);
  }

  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(sampleProducts);
    console.log("Productos de ejemplo creados");
  }

  let driver = await User.findOne({ email: "chofer@pinaloca.com" });
  if (!driver) {
    driver = await User.create({
      name: "Carlos Méndez",
      email: "chofer@pinaloca.com",
      password: "Chofer12345",
      role: "driver"
    });
    const worker = await Worker.create({
      name: "Carlos Méndez",
      phone: "5555-0101",
      address: "Escuintla, Guatemala",
      bankAccount: "GT00 PINA 0001 0001",
      profession: "Chofer",
      laborStatus: "Disponible",
      user: driver._id
    });
    await Truck.create({
      name: "Camión Tropical 01",
      plate: "PL-001",
      driver: worker._id,
      condition: "Óptimas condiciones",
      availability: "Disponible"
    });
    console.log("Chofer y camión de ejemplo creados");
  }
}

async function runSeed() {
  await connectDB();
  await ensureAdminUser();
  process.exit(0);
}

if (require.main === module) {
  runSeed().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { ensureAdminUser };
