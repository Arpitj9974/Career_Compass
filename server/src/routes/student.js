const express = require('express');
const pool = require('../../db/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get student profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query('SELECT * FROM student_profiles WHERE user_id = $1', [userId]);
        
        if (result.rows.length === 0) {
            return res.json({ profile: {} });
        }
        
        const profile = result.rows[0];
        
        // Ensure JSON fields are parsed (pg does this for jsonb, but we ensure defaults)
        profile.interests = profile.interests || [];
        profile.skills = profile.skills || [];
        profile.marks = profile.marks || {};
        
        res.json({ profile });
    } catch (error) {
        console.error('Error fetching student profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update or Create student profile
router.post('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { current_education, stream, marks, budget_max, interests, skills } = req.body;

        const result = await pool.query(`
            INSERT INTO student_profiles 
                (user_id, current_education, stream, marks, budget_max, interests, skills, updated_at)
            VALUES 
                ($1, $2, $3, $4, $5, $6, $7, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                current_education = EXCLUDED.current_education,
                stream = EXCLUDED.stream,
                marks = EXCLUDED.marks,
                budget_max = EXCLUDED.budget_max,
                interests = EXCLUDED.interests,
                skills = EXCLUDED.skills,
                updated_at = NOW()
            RETURNING *
        `, [
            userId,
            current_education || null,
            stream || null,
            JSON.stringify(marks || {}),
            budget_max || null,
            JSON.stringify(interests || []),
            JSON.stringify(skills || [])
        ]);

        const profile = result.rows[0];
        res.json({ profile, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating student profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get saved paths
router.get('/paths', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await pool.query(`
            SELECT sp.*, t.name as tree_name 
            FROM saved_paths sp
            LEFT JOIN trees t ON sp.tree_id = t.id
            WHERE sp.user_id = $1
            ORDER BY sp.created_at DESC
        `, [userId]);

        const paths = result.rows.map(row => ({
            ...row,
            path_nodes: row.path_nodes || []
        }));

        res.json({ paths });
    } catch (error) {
        console.error('Error fetching saved paths:', error);
        res.status(500).json({ error: 'Failed to fetch saved paths' });
    }
});

// Save a new path
router.post('/paths/save', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { tree_id, path_nodes, notes } = req.body;

        if (!path_nodes || !Array.isArray(path_nodes) || path_nodes.length === 0) {
            return res.status(400).json({ error: 'Valid path_nodes array is required' });
        }

        const result = await pool.query(`
            INSERT INTO saved_paths (user_id, tree_id, path_nodes, notes)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [
            userId,
            tree_id || null,
            JSON.stringify(path_nodes),
            notes || null
        ]);

        res.status(201).json({ path: result.rows[0] });
    } catch (error) {
        console.error('Error saving path:', error);
        res.status(500).json({ error: 'Failed to save path' });
    }
});

// Delete a saved path
router.delete('/paths/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Ensure user owns the path
        const result = await pool.query('DELETE FROM saved_paths WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Path not found or unauthorized' });
        }

        res.json({ success: true, message: 'Path deleted successfully' });
    } catch (error) {
        console.error('Error deleting path:', error);
        res.status(500).json({ error: 'Failed to delete path' });
    }
});

module.exports = router;
