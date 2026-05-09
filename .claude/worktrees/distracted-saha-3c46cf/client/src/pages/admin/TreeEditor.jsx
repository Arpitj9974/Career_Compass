import React, { useState } from 'react';
import { useCareerStore } from '../../context/careerStore';
import AdminLayout from '../../components/admin/AdminLayout';
import { Plus, Trash2, ChevronRight, ChevronDown, Save, Eye } from 'lucide-react';

/**
 * Recursive Tree Node for Nav Panel
 */
const NavItem = ({ node, selectedId, onSelect, onAdd, onDelete }) => {
    const [isOpen, setIsOpen] = useState(true);
    const isSelected = selectedId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="ml-4">
            <div
                className={`group flex items-center py-1.5 px-3 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'hover:bg-white/5 text-gray-400'
                    }`}
                onClick={() => onSelect(node)}
            >
                <div
                    className="w-4 h-4 flex items-center justify-center mr-1"
                    onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                >
                    {hasChildren ? (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : null}
                </div>

                <span className="text-sm font-medium flex-1 truncate">{node.title}</span>

                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onAdd(node.id); }}
                        className="p-1 hover:text-green-400 transition-colors"
                    >
                        <Plus size={14} />
                    </button>
                    {node.level > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
                            className="p-1 hover:text-red-400 transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {isOpen && hasChildren && (
                <div className="border-l border-white/5 mt-1 ml-2">
                    {node.children.map(child => (
                        <NavItem
                            key={child.id}
                            node={child}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            onAdd={onAdd}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

/**
 * Node Editor Form
 */
const NodeEditor = ({ node, onUpdate }) => {
    if (!node) return (
        <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4 opacity-50">
            <Layers size={48} />
            <p>Select a node to edit its configuration</p>
        </div>
    );

    return (
        <div className="p-8 max-w-2xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <ChevronRight size={20} className="text-purple-400" />
                </div>
                Edit Node Structure
            </h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Display Title</label>
                    <input
                        type="text"
                        value={node.title}
                        onChange={(e) => onUpdate(node.id, { title: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 outline-none transition-all"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Node ID</label>
                        <input
                            type="text"
                            value={node.id}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed text-xs font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Current Level</label>
                        <input
                            type="text"
                            value={String(node.level)}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description / Metadata</label>
                    <textarea
                        rows={4}
                        placeholder="Detailed info about this career path..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 outline-none transition-all resize-none"
                    />
                </div>

                <div className="pt-8 border-t border-white/5">
                    <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-bold">
                        Changes are saved to the local store instantly. Use the Save button at the top to commit to the server.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default function TreeEditor() {
    const { decisionTree, addTreeNode, deleteTreeNode, updateTreeNode, saveTreeToServer } = useCareerStore();
    const [selectedNode, setSelectedNode] = useState(null);

    const handleSave = async () => {
        const res = await saveTreeToServer();
        if (res.success) alert('Tree saved successfully!');
        else alert('Error saving tree: ' + res.error);
    };

    return (
        <AdminLayout>
            <div className="h-[calc(100vh-64px)] flex bg-[#0B0F14] overflow-hidden">
                {/* 1. TOP ACTION BAR */}
                <div className="absolute top-4 right-8 z-20 flex gap-4">
                    <button
                        onClick={() => window.open('/explore', '_blank')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-all text-sm font-medium"
                    >
                        <Eye size={16} />
                        Live Preview
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg shadow-lg shadow-purple-600/20 transition-all text-sm font-bold"
                    >
                        <Save size={16} />
                        Commit Changes
                    </button>
                </div>

                {/* 2. LEFT PANEL: TREE NAV */}
                <aside className="w-80 border-r border-white/5 flex flex-col pt-10 px-4 bg-[#090D12]">
                    <div className="mb-8 px-4">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <Layers size={18} className="text-purple-500" />
                            Decision Tree
                        </h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                            Structural Controller
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto pb-10">
                        <NavItem
                            node={decisionTree}
                            selectedId={selectedNode?.id}
                            onSelect={setSelectedNode}
                            onAdd={addTreeNode}
                            onDelete={deleteTreeNode}
                        />
                    </div>
                </aside>

                {/* 3. RIGHT PANEL: EDITOR */}
                <main className="flex-1 overflow-y-auto relative">
                    {/* Background Texture */}
                    <div className="absolute inset-0 bg-grain opacity-[0.02] pointer-events-none" />

                    <NodeEditor
                        node={selectedNode}
                        onUpdate={(id, data) => {
                            updateTreeNode(id, data);
                            // Keep selected node in sync
                            setSelectedNode(prev => ({ ...prev, ...data }));
                        }}
                    />
                </main>
            </div>
        </AdminLayout>
    );
}

// Minimal placeholder
const Layers = ({ size, className }) => (
    <div className={className} style={{ width: size, height: size }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" /><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" /><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
        </svg>
    </div>
);
