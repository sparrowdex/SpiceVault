require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('./models'); // Sequelize Models

const app = express();
// const PORT = process.env.PORT || 3306;
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// CORS configuration
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(bodyParser.json({ limit: '10mb' })); // Limit payload size
app.use(express.json({ limit: '10mb' })); // ✅ Enables JSON parsing for incoming requests

// Test DB connection only
db.sequelize.authenticate()
  .then(() => {
    console.log('✅ Successfully connected to the MySQL database');
  })
  .catch((err) => {
    console.error('❌ Could not connect to DB:', err);
  });

// Routes
const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes);
const recipeRoutes = require('./routes/recipe.routes');
app.use('/api/recipes', recipeRoutes);
const mlRoutes = require('./routes/mlRecommendation.routes');
app.use('/api/ml', mlRoutes);
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);
const userInteractionRoutes = require('./routes/userInteraction.routes');
app.use('/api/user-interactions', userInteractionRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
