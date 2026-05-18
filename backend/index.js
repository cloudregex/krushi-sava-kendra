require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB, sequelize } = require("./src/config/db");

// Import Auth & User Routes
const authRoutes = require("./src/routes/authRoutes");
const roleRoutes = require("./src/routes/roleRoutes");
const userRoutes = require("./src/routes/userRoutes");

// Import Master Model Routes
const categoryRoutes = require("./src/routes/categoryRoutes");
const customerRoutes = require("./src/routes/customerRoutes");
const productRoutes = require("./src/routes/productRoutes");
const supplierRoutes = require("./src/routes/supplierRoutes");
const taxRoutes = require("./src/routes/taxRoutes");
const unitRoutes = require("./src/routes/unitRoutes");
const activityRoutes = require("./src/routes/activityRoutes");
const translateRoutes = require("./src/routes/translateRoutes");
const purchaseRoutes = require("./src/routes/purchaseRoutes");
const purchaseOrderRoutes = require("./src/routes/purchaseOrderRoutes");
const purchaseReturnRoutes = require("./src/routes/purchaseReturnRoutes");
const saleRoutes = require("./src/routes/saleRoutes");
const quotationRoutes = require("./src/routes/quotationRoutes");
const saleReturnRoutes = require("./src/routes/saleReturnRoutes");

// Load Associations
require("./src/models/associations");

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);

app.use("/api/categories", categoryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/taxes", taxRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/activity-logs", activityRoutes);
app.use("/api/translate", translateRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/purchase-returns", purchaseReturnRoutes);
app.use("/api/sales/returns", saleReturnRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/quotations", quotationRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.send("Krushi Seva Kendra API is running...");
});

// Database Connection and Server Start
const startServer = async () => {
  try {
    await connectDB();

    // Clean up any stale backup tables
    try {
      const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_backup';");
      const backupTables = results.map(r => r.name);
      for (const table of backupTables) {
        await sequelize.query(`DROP TABLE IF EXISTS \`${table}\`;`);
      }
    } catch (e) {
      console.error("Cleanup error:", e);
    }

    // Disable FK checks so Sequelize can alter referenced tables
    await sequelize.query("PRAGMA foreign_keys = OFF;");

    // Sync models
    await sequelize.sync({ alter: true });

    // Re-enable FK checks
    await sequelize.query("PRAGMA foreign_keys = ON;");
    console.log("✅ Database models synced successfully with alter.");

    const server = app.listen(port, () => {
      console.log(`🚀 Server is running at http://localhost:${port}`);
    });

    // Error handling for server
    server.on("error", (err) => {
      console.error("❌ Server error:", err);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
};

startServer();
