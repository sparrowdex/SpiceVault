require('dotenv').config();

// Fallback for Prisma if using legacy Sequelize environment variables
if (!process.env.DATABASE_URL && process.env.DB_USER) {
  const user = process.env.DB_USER;
  const pass = process.env.DB_PASSWORD || '';
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '3306';
  const db = process.env.DB_NAME || 'spicevault';
  process.env.DATABASE_URL = `mysql://${user}:${pass}@${host}:${port}/${db}`;
}

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createRouteHandler } = require("uploadthing/express");
const { uploadRouter } = require("./uploadthingRouter");

const app = express();
// const PORT = process.env.PORT || 3306;
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

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

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(bodyParser.json({ limit: '10mb' })); // Limit payload size
app.use(express.json({ limit: '10mb' })); // ✅ Enables JSON parsing for incoming requests

// Test Prisma DB connection
prisma.$connect()
  .then(() => {
    console.log('✅ Successfully connected to the MySQL database via Prisma');
  })
  .catch((err) => {
    console.error('❌ Could not connect to DB via Prisma:', err);
  });

// Routes
app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
  })
);

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
