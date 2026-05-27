// controllers/auth.controller.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Register a new user
exports.register = async (req, res) => {
  try {
    const { f_name, l_name, email, password, user_type } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        f_name,
        l_name,
        email,
        password: hashedPassword,
        user_type: user_type || 'Regular'
      }
    });

    const token = jwt.sign(
      { userId: newUser.user_id, email: newUser.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        user_id: newUser.user_id,
        f_name: newUser.f_name,
        l_name: newUser.l_name,
        email: newUser.email,
        user_type: newUser.user_type
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed', message: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`🔑 Login Attempt for: ${email}`);
    const user = await prisma.user.findUnique({ where: { email: email.trim() } });
    if (!user) {
      console.log(`❌ Login Failed: User '${email}' not found in the database.`);
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    let isPasswordValid = await bcrypt.compare(password, user.password);
    
    // Legacy Fallback: If bcrypt fails, check if it's an old seeded plaintext password
    if (!isPasswordValid && password === user.password) {
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      console.log(`❌ Login Failed: Incorrect password for '${email}'.`);
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        f_name: user.f_name,
        l_name: user.l_name,
        email: user.email,
        user_type: user.user_type
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed', message: error.message });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = parseInt(req.user.userId);
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        f_name: true,
        l_name: true,
        email: true,
        user_type: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to get profile', message: error.message });
  }
};

// Delete user account and all associated data
exports.deleteAccount = async (req, res) => {
  try {
    const userId = parseInt(req.user.userId);

    await prisma.$transaction(async (tx) => {
      await tx.recipe.deleteMany({ where: { chef_id: userId } });
      await tx.recipe.deleteMany({ where: { user_id: userId } });
      await tx.review.deleteMany({ where: { user_id: userId } });
      await tx.interaction.deleteMany({ where: { user_id: userId } });

      // Execute raw deletes for any legacy tables that aren't modeled in Prisma
      try {
        await tx.$executeRawUnsafe(`DELETE FROM Notification_Type_Multi WHERE notification_id IN (SELECT notification_id FROM Receives_Notification WHERE user_id = ${userId})`);
        await tx.$executeRawUnsafe(`DELETE FROM Receives_Notification WHERE user_id = ${userId}`);
        await tx.$executeRawUnsafe(`DELETE FROM Leaderboard WHERE user_id = ${userId}`);
        await tx.$executeRawUnsafe(`DELETE FROM Class_Offered WHERE chef_id IN (SELECT chef_id FROM Chef_Posts WHERE user_id = ${userId})`);
        await tx.$executeRawUnsafe(`DELETE FROM Chef_Specialization WHERE chef_id IN (SELECT chef_id FROM Chef_Posts WHERE user_id = ${userId})`);
        await tx.$executeRawUnsafe(`DELETE FROM Chef_Posts WHERE user_id = ${userId}`);
      } catch (e) {
        console.log("Legacy tables ignored in deletion cascade");
      }

      await tx.user.delete({ where: { user_id: userId } });
    });

    res.json({ success: true, message: 'Account and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete account', message: error.message });
  }
};
