const { sequelize } = require('./src/config/db');

const addColumn = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');
        
        // Try to add the column. If it already exists, it will throw an error which we catch.
        await sequelize.getQueryInterface().addColumn('Products', 'marathiName', {
            type: require('sequelize').DataTypes.STRING,
            allowNull: true
        });
        
        console.log('✅ Column marathiName added successfully.');
        process.exit(0);
    } catch (error) {
        console.log('Column might already exist or another error occurred:', error.message);
        process.exit(0); // Exit gracefully
    }
};

addColumn();
