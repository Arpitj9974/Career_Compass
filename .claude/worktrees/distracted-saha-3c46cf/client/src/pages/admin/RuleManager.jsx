import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

/**
 * Rule Manager Page
 * Create and manage eligibility rules for nodes
 */
export default function RuleManager() {
    const [rules, setRules] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRule, setEditingRule] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const nodesResponse = await api.get('/admin/nodes');
            setNodes(nodesResponse.data.nodes || []);

            // Rules are loaded with nodes, extract them
            const allRules = [];
            for (const node of nodesResponse.data.nodes || []) {
                if (node.rules) {
                    node.rules.forEach(rule => {
                        allRules.push({ ...rule, nodeTitle: node.title, nodeIcon: node.icon });
                    });
                }
            }
            setRules(allRules);
        } catch (error) {
            console.error('Error loading data:', error);
            // Demo data
            setRules([
                { id: 1, node_id: 5, nodeTitle: 'Engineering', rule_type: 'marks', field: 'maths', operator: '>=', value: '60', effect: 'lock', message: 'Requires Maths ≥ 60%' },
                { id: 2, node_id: 5, nodeTitle: 'Engineering', rule_type: 'marks', field: 'physics', operator: '>=', value: '55', effect: 'lock', message: 'Requires Physics ≥ 55%' },
                { id: 3, node_id: 6, nodeTitle: 'Medical', rule_type: 'marks', field: 'biology', operator: '>=', value: '70', effect: 'lock', message: 'Requires Biology ≥ 70%' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingRule(null);
        setShowModal(true);
    };

    const handleEdit = (rule) => {
        setEditingRule(rule);
        setShowModal(true);
    };

    const handleDelete = async (ruleId) => {
        if (!confirm('Delete this rule?')) return;
        try {
            await api.delete(`/admin/rules/${ruleId}`);
            setRules(rules.filter(r => r.id !== ruleId));
        } catch (error) {
            console.error('Error deleting rule:', error);
        }
    };

    const handleSave = async (ruleData) => {
        try {
            if (editingRule) {
                await api.put(`/admin/rules/${editingRule.id}`, ruleData);
            } else {
                await api.post('/admin/rules', ruleData);
            }
            await loadData();
            setShowModal(false);
        } catch (error) {
            console.error('Error saving rule:', error);
        }
    };

    return (
        <AdminLayout>
            <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">Rule Engine</h1>
                        <p className="text-gray-400">
                            Define eligibility rules for career nodes
                        </p>
                    </div>
                    <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
                        <span>➕</span>
                        <span>Add Rule</span>
                    </button>
                </div>

                {/* Rule explanation */}
                <div className="glass rounded-xl p-4 mb-6 border-l-4 border-indigo-500">
                    <h3 className="font-medium text-white mb-2">How Rules Work</h3>
                    <p className="text-sm text-gray-400">
                        Rules check student profiles and apply effects to nodes. Effects:
                        <span className="text-red-400 mx-1">🔒 Lock</span> (blocks access),
                        <span className="text-yellow-400 mx-1">⚠️ Warn</span> (caution),
                        <span className="text-emerald-400 mx-1">⭐ Recommend</span> (highlight).
                    </p>
                </div>

                {/* Rules Table */}
                <div className="glass rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Node</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Condition</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Effect</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Message</th>
                                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500">
                                        Loading rules...
                                    </td>
                                </tr>
                            ) : rules.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500">
                                        No rules defined yet
                                    </td>
                                </tr>
                            ) : (
                                rules.map(rule => (
                                    <tr key={rule.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                        <td className="px-6 py-4">
                                            <span className="text-white">
                                                {rule.nodeIcon} {rule.nodeTitle || `Node #${rule.node_id}`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-sm text-indigo-400 bg-indigo-900/20 px-2 py-1 rounded">
                                                {rule.field || rule.rule_type} {rule.operator} {rule.value}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <EffectBadge effect={rule.effect} />
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {rule.message}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(rule)}
                                                    className="p-2 hover:bg-gray-700 rounded-lg"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(rule.id)}
                                                    className="p-2 hover:bg-red-900/30 rounded-lg text-red-400"
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

                {/* Rule Edit Modal */}
                {showModal && (
                    <RuleEditModal
                        rule={editingRule}
                        nodes={nodes}
                        onSave={handleSave}
                        onClose={() => setShowModal(false)}
                    />
                )}
            </div>
        </AdminLayout>
    );
}

function EffectBadge({ effect }) {
    const config = {
        lock: { icon: '🔒', label: 'Lock', class: 'bg-red-900/30 text-red-400' },
        warn: { icon: '⚠️', label: 'Warn', class: 'bg-yellow-900/30 text-yellow-400' },
        recommend: { icon: '⭐', label: 'Recommend', class: 'bg-emerald-900/30 text-emerald-400' },
        hide: { icon: '👁️', label: 'Hide', class: 'bg-gray-800 text-gray-400' },
    };

    const c = config[effect] || config.lock;
    return (
        <span className={`px-2 py-1 rounded-full text-xs ${c.class} flex items-center gap-1 w-fit`}>
            {c.icon} {c.label}
        </span>
    );
}

function RuleEditModal({ rule, nodes, onSave, onClose }) {
    const [formData, setFormData] = useState({
        node_id: rule?.node_id || '',
        rule_type: rule?.rule_type || 'marks',
        field: rule?.field || 'maths',
        operator: rule?.operator || '>=',
        value: rule?.value || '',
        effect: rule?.effect || 'lock',
        message: rule?.message || '',
        priority: rule?.priority || 0,
    });

    const ruleTypes = ['marks', 'budget', 'stream', 'skill', 'interest'];
    const operators = ['>=', '<=', '==', '!=', 'in', 'not_in'];
    const effects = ['lock', 'warn', 'recommend', 'hide'];
    const fields = {
        marks: ['maths', 'physics', 'chemistry', 'biology', 'english', 'overall'],
        budget: ['budget_min', 'budget_max'],
        stream: ['stream'],
        skill: ['skills'],
        interest: ['interests'],
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            node_id: Number(formData.node_id),
            priority: Number(formData.priority),
        });
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/70 z-50" onClick={onClose} />
            <div className="fixed inset-16 z-50 bg-[var(--bg-secondary)] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-in max-w-2xl mx-auto">
                <div className="flex-shrink-0 border-b border-gray-800 p-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">
                        {rule ? 'Edit Rule' : 'Create Rule'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Node Selection */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Target Node *</label>
                            <select
                                value={formData.node_id}
                                onChange={(e) => setFormData({ ...formData, node_id: e.target.value })}
                                required
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="">Select a node...</option>
                                {nodes.map(node => (
                                    <option key={node.id} value={node.id}>
                                        {node.icon} {node.title} ({node.node_type})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Rule Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Rule Type</label>
                            <select
                                value={formData.rule_type}
                                onChange={(e) => setFormData({ ...formData, rule_type: e.target.value, field: fields[e.target.value]?.[0] || '' })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            >
                                {ruleTypes.map(type => (
                                    <option key={type} value={type} className="capitalize">{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Field</label>
                            <select
                                value={formData.field}
                                onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            >
                                {(fields[formData.rule_type] || []).map(f => (
                                    <option key={f} value={f} className="capitalize">{f}</option>
                                ))}
                            </select>
                        </div>

                        {/* Operator */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Operator</label>
                            <select
                                value={formData.operator}
                                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            >
                                {operators.map(op => (
                                    <option key={op} value={op}>{op}</option>
                                ))}
                            </select>
                        </div>

                        {/* Value */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Value</label>
                            <input
                                type="text"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                placeholder="e.g., 60 or Science"
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        {/* Effect */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Effect</label>
                            <select
                                value={formData.effect}
                                onChange={(e) => setFormData({ ...formData, effect: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            >
                                {effects.map(eff => (
                                    <option key={eff} value={eff} className="capitalize">{eff}</option>
                                ))}
                            </select>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        {/* Message */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Message (shown to student)</label>
                            <input
                                type="text"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="e.g., Requires Maths ≥ 60%"
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-800">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">{rule ? 'Save' : 'Create'}</button>
                    </div>
                </form>
            </div>
        </>
    );
}
