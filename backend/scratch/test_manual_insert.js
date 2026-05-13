const { sequelize } = require('../src/config/db');

async function testInsert() {
    try {
        console.log("Dropping Roles_backup...");
        await sequelize.query("DROP TABLE IF EXISTS Roles_backup");
        console.log("Creating Roles_backup...");
        await sequelize.query(`
            CREATE TABLE Roles_backup (
                id UUID UNIQUE PRIMARY KEY, 
                roleName VARCHAR(255) NOT NULL UNIQUE, 
                permissions JSON NOT NULL DEFAULT '{}', 
                createdAt DATETIME NOT NULL, 
                updatedAt DATETIME NOT NULL
            )
        `);
        console.log("Inserting from Roles into Roles_backup...");
        await sequelize.query("INSERT INTO Roles_backup SELECT id, roleName, permissions, createdAt, updatedAt FROM Roles");
        console.log("Success!");
    } catch (err) {
        console.error("Failed!");
        console.error(err);
    } finally {
        await sequelize.close();
    }
}
testInsert();
