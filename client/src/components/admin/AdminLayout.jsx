import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Admin Dashboard Layout Component
 * Provides sidebar navigation and main content area
 */
export default function AdminLayout({ children }) {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const navItems = [
        { path: '/admin', icon: '📊', label: 'Dashboard', exact: true },
        { path: '/admin/trees', icon: '🌳', label: 'Decision Trees' },
        { path: '/admin/nodes', icon: '📦', label: 'All Nodes' },
        { path: '/admin/rules', icon: '⚙️', label: 'Rules' },
        { path: '/admin/analytics', icon: '📈', label: 'Analytics' },
    ];

    const isActive = (path, exact) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex">
            {/* Sidebar */}
            <aside className={`
                ${collapsed ? 'w-16' : 'w-64'} 
                flex-shrink-0 bg-[var(--bg-secondary)] border-r border-gray-800
                flex flex-col transition-all duration-300
            `}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
                    {!collapsed && (
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-2xl">🧭</span>
                            <span className="font-bold text-white">Admin</span>
                        </Link>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        {collapsed ? '→' : '←'}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                                flex items-center gap-3 px-4 py-3 mx-2 rounded-lg
                                transition-all duration-200
                                ${isActive(item.path, item.exact)
                                    ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }
                            `}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* Bottom section */}
                <div className="p-4 border-t border-gray-800">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <span>🏠</span>
                        {!collapsed && <span>Back to App</span>}
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
