const express = require('express');
const db = require('../models/db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all active trees
router.get('/', optionalAuth, (req, res) => {
    try {
        const trees = db.prepare(`
            SELECT id, name, description, status, created_at 
            FROM trees 
            WHERE status = 'active'
            ORDER BY created_at DESC
        `).all();

        res.json({ trees });
    } catch (error) {
        console.error('Error fetching trees:', error);
        res.status(500).json({ error: 'Failed to fetch trees' });
    }
});

// Get tree by ID with root nodes
router.get('/:id', optionalAuth, (req, res) => {
    try {
        const { id } = req.params;

        const tree = db.prepare(`
            SELECT id, name, description, status, created_at 
            FROM trees 
            WHERE id = ?
        `).get(id);

        if (!tree) {
            return res.status(404).json({ error: 'Tree not found' });
        }

        // Get root nodes for this tree
        const rootNodes = db.prepare(`
            SELECT n.* 
            FROM nodes n
            JOIN tree_nodes tn ON n.id = tn.node_id
            WHERE tn.tree_id = ? AND tn.is_root = 1 AND n.status = 'published'
        `).all(id);

        res.json({ tree, rootNodes });
    } catch (error) {
        console.error('Error fetching tree:', error);
        res.status(500).json({ error: 'Failed to fetch tree' });
    }
});

// Get root nodes for a tree (for canvas initialization)
router.get('/:id/root', optionalAuth, (req, res) => {
    try {
        const { id } = req.params;

        const rootNodes = db.prepare(`
            SELECT n.* 
            FROM nodes n
            JOIN tree_nodes tn ON n.id = tn.node_id
            WHERE tn.tree_id = ? AND tn.is_root = 1 AND n.status = 'published'
        `).all(id);

        // Parse JSON fields
        const nodes = rootNodes.map(node => ({
            ...node,
            skills_required: node.skills_required ? JSON.parse(node.skills_required) : [],
            tags: node.tags ? JSON.parse(node.tags) : []
        }));

        res.json({ nodes });
    } catch (error) {
        console.error('Error fetching root nodes:', error);
        res.status(500).json({ error: 'Failed to fetch root nodes' });
    }
});

module.exports = router;
