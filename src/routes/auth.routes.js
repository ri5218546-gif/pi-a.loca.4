const express = require("express");
const User = require("../models/User");
const signToken = require("../utils/token");
const { protect } = require("../middleware/auth");

const router = express.Router();

function userPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nombre, correo y contraseña son obligatorios" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: "Ya existe una cuenta con ese correo" });
    }

    const user = await User.create({ name, email, password, role: "client" });
    return res.status(201).json({ token: signToken(user), user: userPayload(user) });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Usuario no registrado" });
  }

  if (!(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
  }

  return res.json({ token: signToken(user), user: userPayload(user) });
});

router.get("/me", protect, (req, res) => {
  return res.json({ user: userPayload(req.user) });
});

module.exports = router;
