import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Landing from './pages/Landing';
import StudentExplorer from './pages/StudentExplorer';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import NodeManager from './pages/admin/NodeManager';
import RuleManager from './pages/admin/RuleManager';
import TreeBuilder from './pages/admin/TreeBuilder';
import TreeEditor from './pages/admin/TreeEditor';
import { useCareerStore } from './context/careerStore';

function App() {
  const { fetchUser, isAuthenticated } = useCareerStore();

  useEffect(() => {
    // Fetch user on app load if token exists
    fetchUser();
  }, [fetchUser]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/explore" element={<StudentExplorer />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/nodes" element={<NodeManager />} />
        <Route path="/admin/trees" element={<TreeBuilder />} />
        <Route path="/admin/tree-builder" element={<TreeEditor />} />
        <Route path="/admin/rules" element={<RuleManager />} />

        {/* Future routes */}
        <Route path="/login" element={<Login />} />
        {/* <Route path="/admin/analytics" element={<Analytics />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
