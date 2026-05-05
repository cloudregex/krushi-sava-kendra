require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./src/config/db');

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const roleRoutes = require('./src/routes/roleRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect and Sync Database
connectDB();
sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Database models synced.');
}).catch(err => {
  console.error('❌ Error syncing database models:', err);
});

// Basic Route
app.get('/', (req, res) => {
  res.send('Krushi Seva Kendra Admin Auth API is running...');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
