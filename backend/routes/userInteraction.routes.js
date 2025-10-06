const express = require('express');
const router = express.Router();
const userInteractionController = require('../controllers/userInteraction.controller');
const authenticate = require('../middleware/authenticate'); // Assuming you have auth middleware

// DELETE all user interactions for logged-in user
router.delete('/delete-all', authenticate, userInteractionController.deleteAllUserInteractions);

module.exports = router;
