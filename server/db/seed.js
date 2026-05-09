require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./connection');

async function seedDatabase() {
    try {
        const seedPath = path.join(__dirname, 'seeds', '001_sample_data.sql');
        let sql = fs.readFileSync(seedPath, 'utf8');

        console.log('Seeding PostgreSQL database...');
        
        // Clear existing data first and reset auto-increment sequences
        await pool.query('TRUNCATE TABLE users, trees, nodes, edges, tree_nodes, rules, analytics, saved_paths, student_profiles RESTART IDENTITY CASCADE;');
        
        await pool.query(sql);
        await pool.query("UPDATE nodes SET status = 'published';");
        
        console.log('Seeding complete!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        pool.end();
    }
}

seedDatabase();
