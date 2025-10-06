// controllers/auth.controller.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const { User } = db;

// Register a new user
exports.register = async (req, res) => {
  try {
    const { f_name, l_name, email, password, user_type } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      f_name,
      l_name,
      email,
      password: hashedPassword,
      user_type: user_type || 'Regular',
      date_joined: new Date().toISOString().split('T')[0]
    });

    // Generate JWT token
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
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
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
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
      message: error.message
    });
  }
};

// Delete user account and all associated data
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Start a transaction to ensure all deletions happen atomically
    const transaction = await db.sequelize.transaction();

    try {
      // Delete user's recipes where chef_id
      await db.Recipe.destroy({
        where: { chef_id: userId },
        transaction
      });

      // Delete user's recipes where user_id
      await db.Recipe.destroy({
        where: { user_id: userId },
        transaction
      });

      // Delete user's ratings
      await db.Rating.destroy({
        where: { user_id: userId },
        transaction
      });

      // Delete user's interactions (likes, saves, etc.) using raw query to ensure all deleted
      await db.sequelize.query(
        'DELETE FROM user_interactions WHERE user_id = :userId',
        {
          replacements: { userId },
          transaction
        }
      );

      // Delete notification type multi entries
      await db.Notification_Type_Multi.destroy({
        where: {
          notification_id: db.Sequelize.literal(`(SELECT notification_id FROM Receives_Notification WHERE user_id = ${userId})`)
        },
        transaction
      });

      // Delete receives notification entries
      await db.Receives_Notification.destroy({
        where: { user_id: userId },
        transaction
      });

      // Delete leaderboard entries
      await db.Leaderboard.destroy({
        where: { user_id: userId },
        transaction
      });

      // Delete class offered entries
      await db.Class_Offered.destroy({
        where: {
          chef_id: db.Sequelize.literal(`(SELECT chef_id FROM Chef_Posts WHERE user_id = ${userId})`)
        },
        transaction
      });

      // Delete chef specialization entries
      await db.Chef_Specialization.destroy({
        where: {
          chef_id: db.Sequelize.literal(`(SELECT chef_id FROM Chef_Posts WHERE user_id = ${userId})`)
        },
        transaction
      });

      // Delete chef posts entries
      await db.Chef_Posts.destroy({
        where: { user_id: userId },
        transaction
      });

      // Finally, delete the user account
      await db.User.destroy({
        where: { user_id: userId },
        transaction
      });

      // Commit the transaction
      await transaction.commit();

      res.json({
        success: true,
        message: 'Account and all associated data deleted successfully'
      });
    } catch (error) {
      // Rollback the transaction on error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account',
      message: error.message
    });
  }
};
