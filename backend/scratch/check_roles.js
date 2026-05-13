const { sequelize } = require('../src/config/db');

async function checkRoles() {
  try {
    const [results] = await sequelize.query("SELECT * FROM Roles");
    console.log("Roles in DB:", JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("Error fetching roles:", error);
  } finally {
    await sequelize.close();
  }
}

checkRoles();
