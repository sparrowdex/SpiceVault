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

// Automatically push the database schema on startup
const { execSync } = require('child_process');
try {
  console.log('🔄 Syncing database schema...');
  execSync('npx prisma db push --accept-data-loss --skip-generate', { stdio: 'inherit', env: process.env });
  console.log('✅ Database schema synced successfully.');
} catch (error) {
  console.error('❌ Failed to sync database schema:', error.message);
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
const logger = require('./utils/logger');
const cron = require('node-cron');

const app = express();

// ✅ FIX 1: Trust Hugging Face's reverse proxy headers for express-rate-limit
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;

// ✅ FIX 2: Allow your Vercel frontend alongside your local environment
app.use(cors({
  origin: ["http://localhost:3000", /\.vercel\.app$/], // Accepts localhost and any Vercel deployment URL
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
app.use(express.json({ limit: '10mb' })); // Enables JSON parsing for incoming requests

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
    config: {
      callbackUrl: "https://sparrowdex-spicevault-backend.hf.space/api/uploadthing"
    }
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
const socialRoutes = require('./routes/social.routes');
app.use('/api/social', socialRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  logger.logError(err, req);
  logger.sendErrorResponse(res, err);
});

// Catch Uncaught Exceptions & Unhandled Rejections
process.on('uncaughtException', (err) => {
  logger.logError(err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.logError(reason);
});

// ==========================================
// CRON JOBS (Background Tasks)
// ==========================================
// Runs every hour to permanently sweep and delete expired 24h stories
cron.schedule('0 * * * *', async () => {
  try {
    const result = await prisma.story.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    if (result.count > 0) console.log(`🧹 CRON: Permanently deleted ${result.count} expired 24h stories from the database.`);
  } catch (error) {
    logger.logError(error);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});