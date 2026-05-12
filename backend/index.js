require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./src/config/db');

// Import Auth & User Routes
const authRoutes = require('./src/routes/authRoutes');
const roleRoutes = require('./src/routes/roleRoutes');
const userRoutes = require('./src/routes/userRoutes');

// Import Master Model Routes
const categoryRoutes = require('./src/routes/categoryRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const productRoutes = require('./src/routes/productRoutes');
const supplierRoutes = require('./src/routes/supplierRoutes');
const taxRoutes = require('./src/routes/taxRoutes');
const unitRoutes = require('./src/routes/unitRoutes');
const activityRoutes = require('./src/routes/activityRoutes');
const translateRoutes = require('./src/routes/translateRoutes');
const purchaseRoutes = require('./src/routes/purchaseRoutes');
const saleRoutes = require('./src/routes/saleRoutes');

// Load Associations
require('./src/models/associations');

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);

app.use('/api/categories', categoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/taxes', taxRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/activity-logs', activityRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('Krushi Seva Kendra API is running...');
});

// Database Connection and Server Start
const startServer = async () => {
    try {
        await connectDB();
        // Sync models
        await sequelize.sync({ alter: true });
        console.log('✅ Database models synced successfully with alter.');

        const server = app.listen(port, () => {
            console.log(`🚀 Server is running at http://localhost:${port}`);
        });

        // Error handling for server
        server.on('error', (err) => {
            console.error('❌ Server error:', err);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
    }
};

startServer();

