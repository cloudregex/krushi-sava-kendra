require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectSQLite, sequelize } = require('./src/config/sqliteDB');

// Import Routes
const categoryRoutes = require('./src/mastermodel/routers/categoryRoutes');
const customerRoutes = require('./src/mastermodel/routers/customerRoutes');
const productRoutes = require('./src/mastermodel/routers/productRoutes');
const supplierRoutes = require('./src/mastermodel/routers/supplierRoutes');
const taxRoutes = require('./src/mastermodel/routers/taxRoutes');

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/taxes', taxRoutes);

app.get('/', (req, res) => {
  res.send('Krushi Seva Kendra API is running.');
});

// Database Connection and Server Start
const startServer = async () => {
    try {
        await connectSQLite();
        // Sync models (this creates tables if they don't exist)
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully.');
        
        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();
