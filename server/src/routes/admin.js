const express = require('express');
const db = require('../models/db');
const { authenticateToken, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Apply middleware to all admin routes
router.use(authenticateToken);
router.use(adminOnly);

// ============================================
// NODE CRUD OPERATIONS
// ============================================

// Create a new node
router.post('/nodes', (req, res) => {
    try {
        const {
            title,
            node_type,
            level,
            description,
            duration,
            cost_min,
            cost_max,
            difficulty,
            skills_required,
            tags,
            icon,
            status = 'draft'
        } = req.body;

        if (!title || !node_type) {
            return res.status(400).json({ error: 'Title and node_type are required' });
        }

        const result = db.prepare(`
            INSERT INTO nodes 
            (title, node_type, level, description, duration, cost_min, cost_max, difficulty, skills_required, tags, icon, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            title,
            node_type,
            level || 1,
            description,
            duration,
            cost_min,
            cost_max,
            difficulty,
            JSON.stringify(skills_required || []),
            JSON.stringify(tags || []),
            icon,
            status,
            req.user.id
        );

        res.status(201).json({
            success: true,
            nodeId: result.lastInsertRowid,
            message: 'Node created successfully'
        });
    } catch (error) {
        console.error('Error creating node:', error);
        res.status(500).json({ error: 'Failed to create node' });
    }
});

// Update a node
router.put('/nodes/:id', (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Build dynamic update query
        const allowedFields = [
            'title', 'node_type', 'level', 'description', 'duration',
            'cost_min', 'cost_max', 'difficulty', 'skills_required',
            'tags', 'icon', 'status'
        ];

        const setClauses = [];
        const values = [];

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                setClauses.push(`${field} = ?`);
                if (field === 'skills_required' || field === 'tags') {
                    values.push(JSON.stringify(updates[field]));
                } else {
                    values.push(updates[field]);
                }
            }
        }

        if (setClauses.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        setClauses.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        db.prepare(`
            UPDATE nodes SET ${setClauses.join(', ')} WHERE id = ?
        `).run(...values);

        res.json({ success: true, message: 'Node updated successfully' });
    } catch (error) {
        console.error('Error updating node:', error);
        res.status(500).json({ error: 'Failed to update node' });
    }
});

// Delete a node
router.delete('/nodes/:id', (req, res) => {
    try {
        const { id } = req.params;

        const result = db.prepare('DELETE FROM nodes WHERE id = ?').run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Node not found' });
        }

        res.json({ success: true, message: 'Node deleted successfully' });
    } catch (error) {
        console.error('Error deleting node:', error);
        res.status(500).json({ error: 'Failed to delete node' });
    }
});

// ============================================
// EDGE OPERATIONS
// ============================================

// Create an edge (parent-child connection)
router.post('/edges', (req, res) => {
    try {
        const { parent_node_id, child_node_id, order_index = 0 } = req.body;

        if (!parent_node_id || !child_node_id) {
            return res.status(400).json({ error: 'parent_node_id and child_node_id are required' });
        }

        const result = db.prepare(`
            INSERT INTO edges (parent_node_id, child_node_id, order_index)
            VALUES (?, ?, ?)
        `).run(parent_node_id, child_node_id, order_index);

        res.status(201).json({
            success: true,
            edgeId: result.lastInsertRowid
        });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'This connection already exists' });
        }
        console.error('Error creating edge:', error);
        res.status(500).json({ error: 'Failed to create edge' });
    }
});

// Delete an edge
router.delete('/edges/:id', (req, res) => {
    try {
        const { id } = req.params;

        const result = db.prepare('DELETE FROM edges WHERE id = ?').run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Edge not found' });
        }

        res.json({ success: true, message: 'Edge deleted successfully' });
    } catch (error) {
        console.error('Error deleting edge:', error);
        res.status(500).json({ error: 'Failed to delete edge' });
    }
});

// ============================================
// RULE OPERATIONS
// ============================================

// Create a rule
router.post('/rules', (req, res) => {
    try {
        const {
            node_id,
            rule_type,
            field,
            operator,
            value,
            message,
            effect,
            priority = 0
        } = req.body;

        if (!node_id || !rule_type || !operator || !value || !effect) {
            return res.status(400).json({
                error: 'node_id, rule_type, operator, value, and effect are required'
            });
        }

        const result = db.prepare(`
            INSERT INTO rules (node_id, rule_type, field, operator, value, message, effect, priority)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(node_id, rule_type, field, operator, value, message, effect, priority);

        res.status(201).json({
            success: true,
            ruleId: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Error creating rule:', error);
        res.status(500).json({ error: 'Failed to create rule' });
    }
});

// Update a rule
router.put('/rules/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { rule_type, field, operator, value, message, effect, priority } = req.body;

        db.prepare(`
            UPDATE rules SET
                rule_type = COALESCE(?, rule_type),
                field = COALESCE(?, field),
                operator = COALESCE(?, operator),
                value = COALESCE(?, value),
                message = COALESCE(?, message),
                effect = COALESCE(?, effect),
                priority = COALESCE(?, priority)
            WHERE id = ?
        `).run(rule_type, field, operator, value, message, effect, priority, id);

        res.json({ success: true, message: 'Rule updated successfully' });
    } catch (error) {
        console.error('Error updating rule:', error);
        res.status(500).json({ error: 'Failed to update rule' });
    }
});

// Delete a rule
router.delete('/rules/:id', (req, res) => {
    try {
        const { id } = req.params;

        const result = db.prepare('DELETE FROM rules WHERE id = ?').run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Rule not found' });
        }

        res.json({ success: true, message: 'Rule deleted successfully' });
    } catch (error) {
        console.error('Error deleting rule:', error);
        res.status(500).json({ error: 'Failed to delete rule' });
    }
});

// ============================================
// ANALYTICS
// ============================================

// Get basic analytics
router.get('/analytics', (req, res) => {
    try {
        const stats = {
            totalNodes: db.prepare('SELECT COUNT(*) as count FROM nodes').get().count,
            publishedNodes: db.prepare("SELECT COUNT(*) as count FROM nodes WHERE status = 'published'").get().count,
            totalTrees: db.prepare('SELECT COUNT(*) as count FROM trees').get().count,
            totalStudents: db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get().count,
            savedPaths: db.prepare('SELECT COUNT(*) as count FROM saved_paths').get().count
        };

        // Most clicked nodes (from analytics table)
        const popularNodes = db.prepare(`
            SELECT n.id, n.title, n.node_type, COUNT(a.id) as clicks
            FROM analytics a
            JOIN nodes n ON a.node_id = n.id
            WHERE a.action = 'expand'
            GROUP BY n.id
            ORDER BY clicks DESC
            LIMIT 10
        `).all();

        res.json({ stats, popularNodes });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Get all nodes (for admin tree builder)
router.get('/nodes', (req, res) => {
    try {
        const nodes = db.prepare(`
            SELECT * FROM nodes ORDER BY level, title
        `).all();

        const parsedNodes = nodes.map(node => ({
            ...node,
            skills_required: node.skills_required ? JSON.parse(node.skills_required) : [],
            tags: node.tags ? JSON.parse(node.tags) : []
        }));

        res.json({ nodes: parsedNodes });
    } catch (error) {
        console.error('Error fetching nodes:', error);
        res.status(500).json({ error: 'Failed to fetch nodes' });
    }
});

module.exports = router;
