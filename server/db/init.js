const fs = require('fs');
const path = require('path');
const pool = require('./connection');

async function initDatabase() {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Initializing PostgreSQL database schema...');
        await pool.query(schema);
        console.log('PostgreSQL schema initialized successfully!');
    } catch (error) {
        console.error('Error initializing PostgreSQL database:', error);
        throw error;
    }
}

module.exports = { initDatabase };
