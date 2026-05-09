const express = require('express');
const fs = require('fs');
const path = require('path');
const pool = require('../../db/connection');
const { optionalAuth } = require('../middleware/auth');
const { evaluateRulesForNode } = require('../services/ruleEngine');

const router = express.Router();

// Path to JSON data directory
const DATA_DIR = path.join(__dirname, '../../data/after_10th');

// Get root nodes
router.get('/roots', optionalAuth, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT n.* 
            FROM nodes n
            JOIN tree_nodes tn ON n.id = tn.node_id
            WHERE tn.is_root = true AND n.status = 'published'
        `);
        
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

// Get single node by ID
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query('SELECT * FROM nodes WHERE id = $1 AND status = $2', [id, 'published']);
        const node = result.rows[0];

        if (!node) {
            return res.status(404).json({ error: 'Node not found' });
        }

        // Parse JSON fields (JSONB in PG comes back parsed automatically, but we ensure defaults)
        const parsedNode = {
            ...node,
            skills_required: node.skills_required || [],
            tags: node.tags || []
        };

        res.json({ node: parsedNode });
    } catch (error) {
        console.error('Error fetching node:', error);
        res.status(500).json({ error: 'Failed to fetch node' });
    }
});

// Get children of a node (lazy loading with JSON file support)
router.get('/:id/children', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const studentProfile = req.query.profile ? JSON.parse(req.query.profile) : null;

        // FIRST: Try to load from JSON file (progressive / lazy loading)
        const jsonFilePath = path.join(DATA_DIR, `${id}.json`);
        console.log(`[DEBUG] Checking for file: ${jsonFilePath}`);

        if (fs.existsSync(jsonFilePath)) {
            console.log(`[LAZY LOAD] Loading from JSON file: ${jsonFilePath}`);

            const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
            const nodeData = JSON.parse(fileContent);

            // Return children from the JSON file
            const children = nodeData.children || [];

            // Format children with proper structure
            const nodesWithState = children.map((child, index) => ({
                id: child.id,
                title: child.title,
                label: child.label || child.title,
                description: child.description || '',
                duration: child.duration || null,
                eligibility: child.eligibility || null,
                job_roles: child.job_roles || [],
                skills_required: child.skills_required || [],
                further_education: child.further_education || [],
                lazy: child.lazy || false,
                children: child.children || [],
                uiState: 'normal',
                ruleMessage: null,
                order_index: index
            }));

            // Generate edges
            const edges = nodesWithState.map(child => ({
                id: `e${id}-${child.id}`,
                source: String(id),
                target: String(child.id)
            }));

            console.log(`[LAZY LOAD] Returning ${nodesWithState.length} children from JSON`);
            return res.json({ nodes: nodesWithState, edges });
        }

        // FALLBACK: Query from database (legacy behavior)
        console.log(`[LAZY LOAD] No JSON file found for ${id}, querying database`);

        const result = await pool.query(`
            SELECT n.*, e.order_index 
            FROM nodes n
            JOIN edges e ON n.id = e.child_node_id
            WHERE e.parent_node_id = $1 AND n.status = 'published'
            ORDER BY e.order_index ASC, n.id ASC
        `, [id]);
        
        const children = result.rows;

        // Parse JSON fields and evaluate rules for each child
        const nodesWithState = await Promise.all(children.map(async (node) => {
            const parsedNode = {
                ...node,
                skills_required: node.skills_required || [],
                tags: node.tags || []
            };

            // Evaluate rules if student profile is provided
            if (studentProfile) {
                const ruleResult = await evaluateRulesForNode(node.id, studentProfile);
                return {
                    ...parsedNode,
                    uiState: ruleResult.state,
                    ruleMessage: ruleResult.message
                };
            }

            return { ...parsedNode, uiState: 'normal', ruleMessage: null };
        }));

        // Get edges for React Flow
        const edges = children.map(child => ({
            id: `e${id}-${child.id}`,
            source: String(id),
            target: String(child.id)
        }));

        res.json({ nodes: nodesWithState, edges });
    } catch (error) {
        console.error('Error fetching children:', error);
        res.status(500).json({ error: 'Failed to fetch children' });
    }
});


// Evaluate rules for a specific node
router.post('/:id/evaluate', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { profile } = req.body;

        if (!profile) {
            return res.status(400).json({ error: 'Student profile is required' });
        }

        const result = await evaluateRulesForNode(id, profile);

        res.json(result);
    } catch (error) {
        console.error('Error evaluating rules:', error);
        res.status(500).json({ error: 'Failed to evaluate rules' });
    }
});

module.exports = router;
