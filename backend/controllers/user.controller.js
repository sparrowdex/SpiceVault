const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const newUser = await prisma.user.create({ data: req.body });
    res.status(201).json(newUser);
  } catch (error) {
    console.error("❌ Error creating user:", error); // Log detailed errors
    res.status(500).json({ message: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single user
exports.getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { user_id: parseInt(req.params.id) } });
    if (user) res.status(200).json(user);
    else res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { user_id: parseInt(req.params.id) },
      data: req.body
    });
    res.status(200).json(user);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: "User not found" });
    res.status(500).json({ message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({ where: { user_id: parseInt(req.params.id) } });
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: "User not found" });
    res.status(500).json({ message: error.message });
  }
};
