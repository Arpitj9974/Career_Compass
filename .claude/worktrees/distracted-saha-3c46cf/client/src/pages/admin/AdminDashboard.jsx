import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

/**
 * Admin Dashboard Page
 * Shows overview stats and quick actions
 */
export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalNodes: 0,
        publishedNodes: 0,
        totalTrees: 0,
        totalStudents: 0,
        savedPaths: 0,
    });
    const [popularNodes, setPopularNodes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            // Try to fetch from admin endpoint
            const response = await api.get('/admin/analytics');
            setStats(response.data.stats);
            setPopularNodes(response.data.popularNodes || []);
        } catch (error) {
            console.error('Error loading analytics:', error);
            // Use mock data for demo
            setStats({
                totalNodes: 34,
                publishedNodes: 30,
                totalTrees: 1,
                totalStudents: 15,
                savedPaths: 8,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
                    <p className="text-gray-400">
                        Overview of your career decision system
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon="📦"
                        label="Total Nodes"
                        value={stats.totalNodes}
                        color="indigo"
                    />
                    <StatCard
                        icon="✅"
                        label="Published"
                        value={stats.publishedNodes}
                        color="emerald"
                    />
                    <StatCard
                        icon="🌳"
                        label="Decision Trees"
                        value={stats.totalTrees}
                        color="violet"
                    />
                    <StatCard
                        icon="👥"
                        label="Students"
                        value={stats.totalStudents}
                        color="cyan"
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="glass rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span>⚡</span> Quick Actions
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            <QuickActionButton icon="➕" label="Add Node" to="/admin/nodes/new" />
                            <QuickActionButton icon="🧠" label="Tree Engine" to="/admin/tree-builder" />
                            <QuickActionButton icon="🌳" label="New Tree" to="/admin/trees/new" />
                            <QuickActionButton icon="⚙️" label="Add Rule" to="/admin/rules/new" />
                        </div>
                    </div>

                    <div className="glass rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span>🔥</span> Popular Paths
                        </h2>
                        {popularNodes.length > 0 ? (
                            <div className="space-y-3">
                                {popularNodes.slice(0, 5).map((node, i) => (
                                    <div key={node.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg text-gray-500">{i + 1}.</span>
                                            <span className="text-white">{node.title}</span>
                                            <span className="text-xs text-gray-500 capitalize">
                                                ({node.node_type})
                                            </span>
                                        </div>
                                        <span className="text-sm text-indigo-400">
                                            {node.clicks} clicks
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">
                                No analytics data yet. Students will generate data as they explore.
                            </p>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span>📋</span> System Status
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatusItem
                            label="Backend API"
                            status="online"
                            detail="localhost:5001"
                        />
                        <StatusItem
                            label="Database"
                            status="online"
                            detail="SQLite connected"
                        />
                        <StatusItem
                            label="Rule Engine"
                            status="active"
                            detail="15 rules active"
                        />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({ icon, label, value, color }) {
    const colorClasses = {
        indigo: 'bg-indigo-900/30 border-indigo-700/50',
        emerald: 'bg-emerald-900/30 border-emerald-700/50',
        violet: 'bg-violet-900/30 border-violet-700/50',
        cyan: 'bg-cyan-900/30 border-cyan-700/50',
    };

    return (
        <div className={`rounded-xl p-5 border ${colorClasses[color]} transition-all hover:scale-[1.02]`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{icon}</span>
                <span className="text-3xl font-bold text-white">{value}</span>
            </div>
            <p className="text-sm text-gray-400">{label}</p>
        </div>
    );
}

function QuickActionButton({ icon, label, to }) {
    return (
        <a
            href={to}
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-800/50 
                hover:bg-gray-700/50 transition-colors text-gray-300 hover:text-white"
        >
            <span>{icon}</span>
            <span className="text-sm">{label}</span>
        </a>
    );
}

function StatusItem({ label, status, detail }) {
    const statusColors = {
        online: 'bg-emerald-500',
        offline: 'bg-red-500',
        active: 'bg-indigo-500',
    };

    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30">
            <span className={`w-2.5 h-2.5 rounded-full ${statusColors[status]} animate-pulse`} />
            <div>
                <p className="text-sm text-white">{label}</p>
                <p className="text-xs text-gray-500">{detail}</p>
            </div>
        </div>
    );
}
