const express = require('express');
const db = require('../models/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get student profile
router.get('/profile', authenticateToken, (req, res) => {
    try {
        const profile = db.prepare(`
            SELECT * FROM student_profiles WHERE user_id = ?
        `).get(req.user.id);

        if (!profile) {
            // Return empty profile structure if none exists
            return res.json({
                profile: {
                    user_id: req.user.id,
                    education_level: null,
                    stream: null,
                    marks: {},
                    budget_min: null,
                    budget_max: null,
                    interests: [],
                    skills: [],
                    location: null
                }
            });
        }

        // Parse JSON fields
        const parsedProfile = {
            ...profile,
            marks: profile.marks ? JSON.parse(profile.marks) : {},
            interests: profile.interests ? JSON.parse(profile.interests) : [],
            skills: profile.skills ? JSON.parse(profile.skills) : []
        };

        res.json({ profile: parsedProfile });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update student profile
router.post('/profile', authenticateToken, (req, res) => {
    try {
        const {
            education_level,
            stream,
            marks,
            budget_min,
            budget_max,
            interests,
            skills,
            location
        } = req.body;

        // Check if profile exists
        const existing = db.prepare('SELECT id FROM student_profiles WHERE user_id = ?').get(req.user.id);

        if (existing) {
            // Update existing profile
            db.prepare(`
                UPDATE student_profiles SET
                    education_level = ?,
                    stream = ?,
                    marks = ?,
                    budget_min = ?,
                    budget_max = ?,
                    interests = ?,
                    skills = ?,
                    location = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            `).run(
                education_level,
                stream,
                JSON.stringify(marks || {}),
                budget_min,
                budget_max,
                JSON.stringify(interests || []),
                JSON.stringify(skills || []),
                location,
                req.user.id
            );
        } else {
            // Insert new profile
            db.prepare(`
                INSERT INTO student_profiles 
                (user_id, education_level, stream, marks, budget_min, budget_max, interests, skills, location)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                req.user.id,
                education_level,
                stream,
                JSON.stringify(marks || {}),
                budget_min,
                budget_max,
                JSON.stringify(interests || []),
                JSON.stringify(skills || []),
                location
            );
        }

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Save a career path
router.post('/paths/save', authenticateToken, (req, res) => {
    try {
        const { tree_id, path_nodes, notes } = req.body;

        if (!path_nodes || !Array.isArray(path_nodes)) {
            return res.status(400).json({ error: 'path_nodes array is required' });
        }

        const result = db.prepare(`
            INSERT INTO saved_paths (user_id, tree_id, path_nodes, notes)
            VALUES (?, ?, ?, ?)
        `).run(req.user.id, tree_id, JSON.stringify(path_nodes), notes || null);

        res.status(201).json({
            success: true,
            pathId: result.lastInsertRowid,
            message: 'Path saved successfully'
        });
    } catch (error) {
        console.error('Error saving path:', error);
        res.status(500).json({ error: 'Failed to save path' });
    }
});

// Get saved paths
router.get('/paths/saved', authenticateToken, (req, res) => {
    try {
        const paths = db.prepare(`
            SELECT sp.*, t.name as tree_name
            FROM saved_paths sp
            LEFT JOIN trees t ON sp.tree_id = t.id
            WHERE sp.user_id = ?
            ORDER BY sp.created_at DESC
        `).all(req.user.id);

        // Parse path_nodes JSON and get node details
        const pathsWithDetails = paths.map(path => {
            const nodeIds = JSON.parse(path.path_nodes);
            const nodes = db.prepare(`
                SELECT id, title, node_type, icon 
                FROM nodes 
                WHERE id IN (${nodeIds.map(() => '?').join(',')})
            `).all(...nodeIds);

            return {
                ...path,
                path_nodes: nodeIds,
                nodes: nodes
            };
        });

        res.json({ paths: pathsWithDetails });
    } catch (error) {
        console.error('Error fetching saved paths:', error);
        res.status(500).json({ error: 'Failed to fetch saved paths' });
    }
});

// Delete a saved path
router.delete('/paths/:id', authenticateToken, (req, res) => {
    try {
        const { id } = req.params;

        const result = db.prepare(`
            DELETE FROM saved_paths WHERE id = ? AND user_id = ?
        `).run(id, req.user.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Path not found' });
        }

        res.json({ success: true, message: 'Path deleted successfully' });
    } catch (error) {
        console.error('Error deleting path:', error);
        res.status(500).json({ error: 'Failed to delete path' });
    }
});

module.exports = router;
