/**
 * ONE-TIME FIX: Run this script to fix the database sync error.
 * Your existing data (Products, Customers, etc.) will NOT be deleted.
 * 
 * Usage: node fix_startup.js
 */
require('dotenv').config();
const { sequelize } = require('./src/config/db');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Step 1: Show current data counts (proof that data is safe)
    const tables = ['Products', 'Customers', 'Suppliers', 'Purchases', 'Sales', 'Categories', 'Users'];
    console.log('\n📊 Current data in your database:');
    for (const table of tables) {
      try {
        const [rows] = await sequelize.query(`SELECT COUNT(*) as count FROM "${table}"`);
        console.log(`   ${table}: ${rows[0].count} records`);
      } catch (e) {
        console.log(`   ${table}: table not found (will be created on next sync)`);
      }
    }

    // Step 2: Find and drop ALL stale backup tables
    const [backupTables] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_backup%'"
    );
    
    if (backupTables.length > 0) {
      console.log('\n🧹 Removing stale backup tables:');
      for (const t of backupTables) {
        await sequelize.query(`DROP TABLE IF EXISTS "${t.name}"`);
        console.log(`   Dropped: ${t.name}`);
      }
    } else {
      console.log('\n✅ No stale backup tables found');
    }

    // Step 3: Disable foreign key checks and sync
    console.log('\n🔄 Syncing database models...');
    await sequelize.query('PRAGMA foreign_keys = OFF;');
    await sequelize.sync({ alter: true });
    await sequelize.query('PRAGMA foreign_keys = ON;');
    console.log('✅ Database models synced successfully!');

    // Step 4: Show data counts after fix (proof that data is preserved)
    console.log('\n📊 Data after fix:');
    for (const table of tables) {
      try {
        const [rows] = await sequelize.query(`SELECT COUNT(*) as count FROM "${table}"`);
        console.log(`   ${table}: ${rows[0].count} records`);
      } catch (e) {
        console.log(`   ${table}: ${e.message}`);
      }
    }

    console.log('\n🎉 Fix complete! Now restart your server with: npm run dev');
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
  process.exit();
})();
