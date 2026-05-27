const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.deleteAllUserInteractions = async (req, res) => {
  try {
    const userId = req.user.userId;

    await prisma.interaction.deleteMany({
      where: { user_id: parseInt(userId) }
    });

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
