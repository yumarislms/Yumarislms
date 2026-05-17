/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import AdminDashboard from './pages/AdminDashboard';
import MaterialDetail from './pages/MaterialDetail';
import QuizPage from './pages/QuizPage';
import { Toaster } from 'sonner';

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, profile, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;
  
  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/" />;

  return <>{children}</>;
}

function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const isLandingPage = location.pathname === '/';
  const showNavigation = user && !isLandingPage && !loading;

  return (
    <div className={`min-h-screen bg-slate-50 font-sans text-slate-900 ${showNavigation ? 'flex' : 'block'}`}>
      {showNavigation && <Sidebar />}
      <div className={`flex-1 flex flex-col min-h-screen overflow-hidden ${showNavigation ? 'pb-24 md:pb-0' : ''}`}>
        <Navbar />
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/admin/*" element={
              <PrivateRoute adminOnly>
                <AdminDashboard />
              </PrivateRoute>
            } />
            <Route path="/materials/:id" element={
              <PrivateRoute>
                <MaterialDetail />
              </PrivateRoute>
            } />
            <Route path="/quiz/:id" element={
              <PrivateRoute>
                <QuizPage />
              </PrivateRoute>
            } />
          </Routes>
        </main>
        {showNavigation && <MobileNav />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </Router>
  );
}

