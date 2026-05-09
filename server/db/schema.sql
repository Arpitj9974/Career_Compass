DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS saved_paths CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS rules CASCADE;
DROP TABLE IF EXISTS tree_nodes CASCADE;
DROP TABLE IF EXISTS edges CASCADE;
DROP TABLE IF EXISTS nodes CASCADE;
DROP TABLE IF EXISTS trees CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('student', 'admin')) DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nodes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    node_type VARCHAR(100) NOT NULL,
    level INTEGER DEFAULT 1,
    description TEXT,
    duration VARCHAR(100),
    cost_min INTEGER,
    cost_max INTEGER,
    difficulty VARCHAR(50),
    skills_required JSONB,
    tags JSONB,
    icon VARCHAR(255),
    status VARCHAR(50) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE edges (
    id SERIAL PRIMARY KEY,
    parent_node_id INTEGER REFERENCES nodes(id) ON DELETE CASCADE,
    child_node_id INTEGER REFERENCES nodes(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (parent_node_id, child_node_id)
);

CREATE TABLE tree_nodes (
    id SERIAL PRIMARY KEY,
    tree_id INTEGER REFERENCES trees(id) ON DELETE CASCADE,
    node_id INTEGER REFERENCES nodes(id) ON DELETE CASCADE,
    is_root BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (tree_id, node_id)
);

CREATE TABLE rules (
    id SERIAL PRIMARY KEY,
    node_id INTEGER REFERENCES nodes(id) ON DELETE CASCADE,
    rule_type VARCHAR(100) NOT NULL,
    field VARCHAR(100),
    operator VARCHAR(50) NOT NULL,
    value VARCHAR(255) NOT NULL,
    message TEXT,
    effect VARCHAR(50) CHECK (effect IN ('lock', 'warn', 'recommend', 'hide')) NOT NULL,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE student_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    education_level VARCHAR(100),
    stream VARCHAR(100),
    marks JSONB,
    budget_min INTEGER,
    budget_max INTEGER,
    interests JSONB,
    skills JSONB,
    location VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE saved_paths (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tree_id INTEGER REFERENCES trees(id) ON DELETE CASCADE,
    path_nodes JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    node_id INTEGER REFERENCES nodes(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_edges_parent_node_id ON edges(parent_node_id);
CREATE INDEX idx_edges_child_node_id ON edges(child_node_id);
CREATE INDEX idx_tree_nodes_tree_id ON tree_nodes(tree_id);
CREATE INDEX idx_rules_node_id ON rules(node_id);
CREATE INDEX idx_analytics_node_id ON analytics(node_id);
CREATE INDEX idx_saved_paths_user_id ON saved_paths(user_id);
