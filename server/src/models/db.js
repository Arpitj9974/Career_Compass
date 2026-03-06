const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Path goes from src/models up to server root, then into db folder
const dbPath = path.join(__dirname, '..', '..', 'db', 'career_compass_v2.db');
const dbDir = path.dirname(dbPath);

// Create db directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database with schema and seed data
function initializeDatabase() {
    const schemaPath = path.join(__dirname, '..', '..', 'db', 'migrations', '001_initial_schema.sql');
    const seedPath = path.join(__dirname, '..', '..', 'db', 'seeds', '001_sample_data.sql');

    // Check if database needs initialization (check if users table exists)
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();

    if (!tableExists) {
        console.log('Initializing database...');

        // Run schema
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema);
        console.log('Schema created.');

        // Run seed data
        const seed = fs.readFileSync(seedPath, 'utf8');
        db.exec(seed);
        console.log('Seed data inserted.');

        console.log('Database initialized successfully!');
    } else {
        console.log('Database already initialized.');
    }
}

// Initialize on first import
initializeDatabase();

module.exports = db;
