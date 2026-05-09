const express = require('express');
const pool = require('../../db/connection');

const router = express.Router();

// Get all published trees
router.get('/', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM trees WHERE status = 'published' ORDER BY created_at DESC");
        res.json({ trees: result.rows });
    } catch (error) {
        console.error('Error fetching trees:', error);
        res.status(500).json({ error: 'Failed to fetch trees' });
    }
});

// Get a single tree by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM trees WHERE id = $1', [id]);
        const tree = result.rows[0];

        if (!tree) {
            return res.status(404).json({ error: 'Tree not found' });
        }

        res.json({ tree });
    } catch (error) {
        console.error('Error fetching tree:', error);
        res.status(500).json({ error: 'Failed to fetch tree' });
    }
});

// Get root nodes for a tree
router.get('/:id/root', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT n.* 
            FROM nodes n
            JOIN tree_nodes tn ON n.id = tn.node_id
            WHERE tn.tree_id = $1 AND tn.is_root = true AND n.status = 'published'
            ORDER BY n.id ASC
        `, [id]);
        
        // Parse JSON fields
        const parsedNodes = result.rows.map(node => ({
            ...node,
            skills_required: node.skills_required || [],
            tags: node.tags || []
        }));

        res.json({ nodes: parsedNodes });
    } catch (error) {
        console.error('Error fetching root nodes:', error);
        res.status(500).json({ error: 'Failed to fetch root nodes' });
    }
});

module.exports = router;
