-- Career Compass Database Schema
-- Using SQLite for simplicity

-- Users table (students and admins)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Decision trees (e.g., "After 12th", "Career Switch")
CREATE TABLE IF NOT EXISTS trees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    created_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Career nodes (goals, paths, options, outcomes)
CREATE TABLE IF NOT EXISTS nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    node_type TEXT NOT NULL CHECK (node_type IN ('goal', 'path', 'option', 'outcome')),
    level INTEGER DEFAULT 1,
    description TEXT,
    duration TEXT,
    cost_min INTEGER,
    cost_max INTEGER,
    difficulty TEXT CHECK (difficulty IN ('low', 'medium', 'high')),
    skills_required TEXT, -- JSON array
    tags TEXT, -- JSON array
    icon TEXT, -- emoji or icon name
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    created_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Edges (parent-child relationships)
CREATE TABLE IF NOT EXISTS edges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_node_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    child_node_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parent_node_id, child_node_id)
);

-- Tree-node mapping (which nodes belong to which tree)
CREATE TABLE IF NOT EXISTS tree_nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tree_id INTEGER NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
    node_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    is_root INTEGER DEFAULT 0, -- boolean, 1 = root node
    UNIQUE(tree_id, node_id)
);

-- Rules for decision engine
CREATE TABLE IF NOT EXISTS rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('marks', 'budget', 'stream', 'skill', 'interest')),
    field TEXT, -- specific field like 'maths', 'physics', etc.
    operator TEXT NOT NULL CHECK (operator IN ('>=', '<=', '==', '!=', 'in', 'not_in')),
    value TEXT NOT NULL, -- can be number, string, or JSON array
    message TEXT, -- shown to student
    effect TEXT NOT NULL CHECK (effect IN ('lock', 'warn', 'recommend', 'hide')),
    priority INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Student profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    education_level TEXT, -- 10th, 12th, Graduate
    stream TEXT, -- Science, Commerce, Arts
    marks TEXT, -- JSON object with subject-wise marks
    budget_min INTEGER,
    budget_max INTEGER,
    interests TEXT, -- JSON array
    skills TEXT, -- JSON array
    location TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Saved paths (bookmarks)
CREATE TABLE IF NOT EXISTS saved_paths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tree_id INTEGER REFERENCES trees(id),
    path_nodes TEXT NOT NULL, -- JSON array of node IDs
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Analytics (simple tracking)
CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    node_id INTEGER REFERENCES nodes(id),
    action TEXT CHECK (action IN ('view', 'expand', 'save', 'compare')),
    metadata TEXT, -- JSON for additional data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_edges_parent ON edges(parent_node_id);
CREATE INDEX IF NOT EXISTS idx_edges_child ON edges(child_node_id);
CREATE INDEX IF NOT EXISTS idx_tree_nodes_tree ON tree_nodes(tree_id);
CREATE INDEX IF NOT EXISTS idx_rules_node ON rules(node_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_node ON analytics(node_id);
