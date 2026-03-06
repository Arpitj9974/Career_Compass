/**
 * Reset Database with correct password hashes
 * Run with: node reset-db.js
 */

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'db', 'career_compass_v2.db');

// Check if database exists and remove it
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Old database removed');
}

// Create new database
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Run schema
const schemaPath = path.join(__dirname, 'db', 'migrations', '001_initial_schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schemaSql);
console.log('Schema created');

// Generate password hashes
const adminHash = bcrypt.hashSync('admin123', 10);
const studentHash = bcrypt.hashSync('student123', 10);

console.log('Generated password hashes:');
console.log('Admin:', adminHash);
console.log('Student:', studentHash);

// Insert users with correct hashes
db.prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
    'admin@careercompass.com', adminHash, 'Admin', 'admin'
);
db.prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
    'student@demo.com', studentHash, 'Demo Student', 'student'
);
console.log('Users created');

// Read and execute seed data (excluding the user inserts which we already did)
const seedPath = path.join(__dirname, 'db', 'seeds', '001_sample_data.sql');
let seedSql = fs.readFileSync(seedPath, 'utf-8');

// Remove user insert statements from seed (we already inserted them above)
seedSql = seedSql.replace(/INSERT INTO users.*?;/gs, '');

// Execute remaining seed data
db.exec(seedSql);
console.log('Seed data inserted');

// Verify
const users = db.prepare('SELECT id, email, name, role FROM users').all();
console.log('\nUsers in database:');
users.forEach(u => console.log(`  ${u.id}: ${u.email} (${u.role})`));

const nodes = db.prepare('SELECT COUNT(*) as count FROM nodes').get();
console.log(`\nNodes: ${nodes.count}`);

db.close();
console.log('\n✅ Database reset complete!');
console.log('\nCredentials:');
console.log('  Admin: admin@careercompass.com / admin123');
console.log('  Student: student@demo.com / student123');
