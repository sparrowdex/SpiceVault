const db = require('../models');

exports.deleteAllUserInteractions = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Delete all user interactions for the logged-in user
    await db.sequelize.query(
      'DELETE FROM user_interactions WHERE user_id = :userId',
      {
        replacements: { userId }
      }
    );

    res.json({
      success: true,
      message: 'All user interactions deleted successfully'
    });
  } catch (error) {
    console.error('Delete all user interactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user interactions',
      message: error.message
    });
  }
};
