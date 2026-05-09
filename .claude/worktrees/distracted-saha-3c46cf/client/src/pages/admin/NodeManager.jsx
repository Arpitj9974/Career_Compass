import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

/**
 * Node Management Page
 * List, create, edit, and delete nodes
 */
export default function NodeManager() {
    const [nodes, setNodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingNode, setEditingNode] = useState(null);

    useEffect(() => {
        loadNodes();
    }, []);

    const loadNodes = async () => {
        try {
            const response = await api.get('/admin/nodes');
            setNodes(response.data.nodes || []);
        } catch (error) {
            console.error('Error loading nodes:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredNodes = nodes.filter(node => {
        const matchesFilter = filter === 'all' || node.node_type === filter;
        const matchesSearch = node.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleEdit = (node) => {
        setEditingNode(node);
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingNode(null);
        setShowModal(true);
    };

    const handleDelete = async (nodeId) => {
        if (!confirm('Are you sure you want to delete this node?')) return;

        try {
            await api.delete(`/admin/nodes/${nodeId}`);
            setNodes(nodes.filter(n => n.id !== nodeId));
        } catch (error) {
            console.error('Error deleting node:', error);
        }
    };

    const handleSave = async (nodeData) => {
        try {
            if (editingNode) {
                await api.put(`/admin/nodes/${editingNode.id}`, nodeData);
            } else {
                await api.post('/admin/nodes', nodeData);
            }
            await loadNodes();
            setShowModal(false);
        } catch (error) {
            console.error('Error saving node:', error);
        }
    };

    return (
        <AdminLayout>
            <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">Node Manager</h1>
                        <p className="text-gray-400">
                            Manage all career path nodes
                        </p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="btn-primary flex items-center gap-2"
                    >
                        <span>➕</span>
                        <span>Add Node</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search nodes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 
                                rounded-lg text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'goal', 'path', 'option', 'outcome'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors ${filter === type
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Nodes Table */}
                <div className="glass rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Node</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Type</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Level</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500">
                                        Loading nodes...
                                    </td>
                                </tr>
                            ) : filteredNodes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500">
                                        No nodes found
                                    </td>
                                </tr>
                            ) : (
                                filteredNodes.map(node => (
                                    <tr
                                        key={node.id}
                                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{node.icon || '📍'}</span>
                                                <div>
                                                    <p className="text-white font-medium">{node.title}</p>
                                                    <p className="text-xs text-gray-500 line-clamp-1">
                                                        {node.description || 'No description'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <NodeTypeBadge type={node.node_type} />
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            Level {node.level}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={node.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(node)}
                                                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(node.id)}
                                                    className="p-2 hover:bg-red-900/30 rounded-lg transition-colors text-red-400"
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Node Edit Modal */}
                {showModal && (
                    <NodeEditModal
                        node={editingNode}
                        onSave={handleSave}
                        onClose={() => setShowModal(false)}
                    />
                )}
            </div>
        </AdminLayout>
    );
}

function NodeTypeBadge({ type }) {
    const colors = {
        goal: 'bg-indigo-900/30 text-indigo-400',
        path: 'bg-violet-900/30 text-violet-400',
        option: 'bg-cyan-900/30 text-cyan-400',
        outcome: 'bg-emerald-900/30 text-emerald-400',
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs capitalize ${colors[type] || 'bg-gray-800 text-gray-400'}`}>
            {type}
        </span>
    );
}

function StatusBadge({ status }) {
    const colors = {
        published: 'bg-emerald-900/30 text-emerald-400',
        draft: 'bg-yellow-900/30 text-yellow-400',
        archived: 'bg-gray-800 text-gray-400',
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs capitalize ${colors[status] || 'bg-gray-800 text-gray-400'}`}>
            {status}
        </span>
    );
}

function NodeEditModal({ node, onSave, onClose }) {
    const [formData, setFormData] = useState({
        title: node?.title || '',
        node_type: node?.node_type || 'path',
        level: node?.level || 1,
        description: node?.description || '',
        duration: node?.duration || '',
        cost_min: node?.cost_min || '',
        cost_max: node?.cost_max || '',
        difficulty: node?.difficulty || 'medium',
        icon: node?.icon || '',
        status: node?.status || 'draft',
        skills_required: node?.skills_required || [],
        tags: node?.tags || [],
    });

    const [newSkill, setNewSkill] = useState('');
    const [newTag, setNewTag] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            cost_min: formData.cost_min ? Number(formData.cost_min) : null,
            cost_max: formData.cost_max ? Number(formData.cost_max) : null,
            level: Number(formData.level),
        });
    };

    const addSkill = () => {
        if (newSkill.trim()) {
            setFormData(prev => ({
                ...prev,
                skills_required: [...prev.skills_required, newSkill.trim()]
            }));
            setNewSkill('');
        }
    };

    const addTag = () => {
        if (newTag.trim()) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/70 z-50" onClick={onClose} />
            <div className="fixed inset-8 md:inset-16 z-50 bg-[var(--bg-secondary)] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-in">
                <div className="flex-shrink-0 border-b border-gray-800 p-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">
                        {node ? 'Edit Node' : 'Create Node'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        {/* Node Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
                            <select
                                value={formData.node_type}
                                onChange={(e) => setFormData({ ...formData, node_type: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="goal">Goal</option>
                                <option value="path">Path</option>
                                <option value="option">Option</option>
                                <option value="outcome">Outcome</option>
                            </select>
                        </div>

                        {/* Level */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Level</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                            <input
                                type="text"
                                placeholder="e.g., 4 years"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        {/* Difficulty */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                            <select
                                value={formData.difficulty}
                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        {/* Cost Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Cost Min (₹)</label>
                            <input
                                type="number"
                                value={formData.cost_min}
                                onChange={(e) => setFormData({ ...formData, cost_min: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Cost Max (₹)</label>
                            <input
                                type="number"
                                value={formData.cost_max}
                                onChange={(e) => setFormData({ ...formData, cost_max: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        {/* Icon */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Icon (emoji)</label>
                            <input
                                type="text"
                                placeholder="e.g., 💻"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        {/* Skills */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Skills Required</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Add skill..."
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                />
                                <button type="button" onClick={addSkill} className="btn-secondary px-4">
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.skills_required.map((skill, i) => (
                                    <span key={i} className="px-2 py-1 rounded-full bg-cyan-900/30 text-cyan-400 text-sm flex items-center gap-1">
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => setFormData({
                                                ...formData,
                                                skills_required: formData.skills_required.filter((_, idx) => idx !== i)
                                            })}
                                            className="hover:text-red-400"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Add tag..."
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                />
                                <button type="button" onClick={addTag} className="btn-secondary px-4">
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag, i) => (
                                    <span key={i} className="px-2 py-1 rounded-full bg-emerald-900/30 text-emerald-400 text-sm flex items-center gap-1">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => setFormData({
                                                ...formData,
                                                tags: formData.tags.filter((_, idx) => idx !== i)
                                            })}
                                            className="hover:text-red-400"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Submit button */}
                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-800">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            {node ? 'Save Changes' : 'Create Node'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
