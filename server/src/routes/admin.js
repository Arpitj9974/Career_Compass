const express = require('express');
const pool = require('../../db/connection');
const { authenticateToken, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authenticateToken, adminOnly);

// ─────────────────────────────────────────────────────────────────────────────
// NODES
// ─────────────────────────────────────────────────────────────────────────────

// Get all nodes
router.get('/nodes', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM nodes WHERE status != 'archived' ORDER BY level ASC, id ASC");
        
        // Parse JSON fields
        const nodes = result.rows.map(node => ({
            ...node,
            skills_required: node.skills_required || [],
            tags: node.tags || []
        }));

        res.json({ nodes });
    } catch (error) {
        console.error('Error fetching admin nodes:', error);
        res.status(500).json({ error: 'Failed to fetch nodes' });
    }
});

// Create new node
router.post('/nodes', async (req, res) => {
    try {
        const {
            name, title, label, description, type,
            level, duration, eligibility, cost_min, cost_max,
            difficulty, skills_required, tags, status = 'published', is_leaf = false
        } = req.body;

        const result = await pool.query(`
            INSERT INTO nodes (
                name, title, label, description, type,
                level, duration, eligibility, cost_min, cost_max,
                difficulty, skills_required, tags, status, is_leaf
            ) VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15
            ) RETURNING *
        `, [
            name || null, title || null, label || title || null, description || null, type || 'career',
            level || 0, duration || null, eligibility || null, cost_min || null, cost_max || null,
            difficulty || null, JSON.stringify(skills_required || []), JSON.stringify(tags || []), status, is_leaf
        ]);

        res.status(201).json({ node: result.rows[0] });
    } catch (error) {
        console.error('Error creating node:', error);
        res.status(500).json({ error: 'Failed to create node' });
    }
});

// Update node
router.put('/nodes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, title, label, description, type,
            level, duration, eligibility, cost_min, cost_max,
            difficulty, skills_required, tags, status, is_leaf
        } = req.body;

        // Construct update query
        const result = await pool.query(`
            UPDATE nodes SET
                name = COALESCE($1, name),
                title = COALESCE($2, title),
                label = COALESCE($3, label),
                description = COALESCE($4, description),
                type = COALESCE($5, type),
                level = COALESCE($6, level),
                duration = COALESCE($7, duration),
                eligibility = COALESCE($8, eligibility),
                cost_min = COALESCE($9, cost_min),
                cost_max = COALESCE($10, cost_max),
                difficulty = COALESCE($11, difficulty),
                skills_required = COALESCE($12, skills_required),
                tags = COALESCE($13, tags),
                status = COALESCE($14, status),
                is_leaf = COALESCE($15, is_leaf),
                updated_at = NOW()
            WHERE id = $16
            RETURNING *
        `, [
            name, title, label, description, type,
            level, duration, eligibility, cost_min, cost_max,
            difficulty, 
            skills_required ? JSON.stringify(skills_required) : null, 
            tags ? JSON.stringify(tags) : null, 
            status, is_leaf, 
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Node not found' });
        }

        res.json({ success: true, node: result.rows[0] });
    } catch (error) {
        console.error('Error updating node:', error);
        res.status(500).json({ error: 'Failed to update node' });
    }
});

// Archive node
router.delete('/nodes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("UPDATE nodes SET status = 'archived', updated_at = NOW() WHERE id = $1 RETURNING id", [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Node not found' });
        }

        res.json({ success: true, message: 'Node archived' });
    } catch (error) {
        console.error('Error archiving node:', error);
        res.status(500).json({ error: 'Failed to archive node' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// RULES
// ─────────────────────────────────────────────────────────────────────────────

// Get rules (optionally filter by node_id)
router.get('/rules', async (req, res) => {
    try {
        const { node_id } = req.query;
        let query = 'SELECT * FROM rules ORDER BY priority DESC';
        const params = [];

        if (node_id) {
            query = 'SELECT * FROM rules WHERE node_id = $1 ORDER BY priority DESC';
            params.push(node_id);
        }

        const result = await pool.query(query, params);
        res.json({ rules: result.rows });
    } catch (error) {
        console.error('Error fetching rules:', error);
        res.status(500).json({ error: 'Failed to fetch rules' });
    }
});

// Create rule
router.post('/rules', async (req, res) => {
    try {
        const { node_id, rule_type, field, operator, value, effect, priority, message } = req.body;

        const result = await pool.query(`
            INSERT INTO rules (node_id, rule_type, field, operator, value, effect, priority, message)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [node_id, rule_type, field, operator, value, effect, priority || 0, message]);

        res.status(201).json({ rule: result.rows[0] });
    } catch (error) {
        console.error('Error creating rule:', error);
        res.status(500).json({ error: 'Failed to create rule' });
    }
});

// Delete rule
router.delete('/rules/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM rules WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting rule:', error);
        res.status(500).json({ error: 'Failed to delete rule' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// EDGES
// ─────────────────────────────────────────────────────────────────────────────

// Get edges
router.get('/edges', async (req, res) => {
    try {
        const { parent_node_id } = req.query;
        let query = 'SELECT * FROM edges ORDER BY parent_node_id ASC, order_index ASC';
        const params = [];

        if (parent_node_id) {
            query = 'SELECT * FROM edges WHERE parent_node_id = $1 ORDER BY order_index ASC';
            params.push(parent_node_id);
        }

        const result = await pool.query(query, params);
        res.json({ edges: result.rows });
    } catch (error) {
        console.error('Error fetching edges:', error);
        res.status(500).json({ error: 'Failed to fetch edges' });
    }
});

// Create edge
router.post('/edges', async (req, res) => {
    try {
        const { parent_node_id, child_node_id, order_index } = req.body;

        const result = await pool.query(`
            INSERT INTO edges (parent_node_id, child_node_id, order_index)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [parent_node_id, child_node_id, order_index || 0]);

        res.status(201).json({ edge: result.rows[0] });
    } catch (error) {
        console.error('Error creating edge:', error);
        res.status(500).json({ error: 'Failed to create edge' });
    }
});

// Delete edge
router.delete('/edges/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM edges WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting edge:', error);
        res.status(500).json({ error: 'Failed to delete edge' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────

router.get('/analytics', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.*, u.name as user_name, n.title as node_title
            FROM analytics a
            LEFT JOIN users u ON a.user_id = u.id
            LEFT JOIN nodes n ON a.node_id = n.id
            ORDER BY a.created_at DESC
            LIMIT 100
        `);
        res.json({ analytics: result.rows });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

module.exports = router;
