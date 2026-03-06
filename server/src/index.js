const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize database
require('./models/db');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8000', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5175'],
    credentials: true
}));
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const treeRoutes = require('./routes/trees');
const nodeRoutes = require('./routes/nodes');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/trees', treeRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Career Compass API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Career Compass API running on http://localhost:${PORT}`);
});
