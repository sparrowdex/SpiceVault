const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const db = require('./models'); // Sequelize Models
require('dotenv').config();

const app = express();
// const PORT = process.env.PORT || 3306;
const PORT = process.env.PORT || 5000;

// app.use(cors());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(bodyParser.json());
app.use(express.json()); // ✅ Enables JSON parsing for incoming requests



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





app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
