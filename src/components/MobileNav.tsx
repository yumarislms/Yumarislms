import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { signOut, auth } from '../lib/firebase';
import { LayoutDashboard, GraduationCap, Trophy, ClipboardList, Users, Shield, LogOut } from 'lucide-react';

export default function MobileNav() {
  const { profile, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navItems = [
    { id: 'dashboard', name: 'Home', path: '/dashboard', icon: <LayoutDashboard className="w-6 h-6" /> },
    { id: 'materials', name: 'Materi', path: '/dashboard?tab=materials', icon: <GraduationCap className="w-6 h-6" /> },
    { id: 'quiz', name: 'Kuis', path: '/dashboard?tab=quizzes', icon: <Trophy className="w-6 h-6" /> },
    { id: 'grades', name: 'Nilai', path: '/dashboard?tab=grades', icon: <ClipboardList className="w-6 h-6" /> },
  ];

  if (profile?.role === 'teacher') {
    navItems.push({ id: 'monitor', name: 'Pantau', path: '/dashboard?tab=monitor', icon: <Users className="w-6 h-6" /> });
  }

  if (isAdmin) {
    navItems.push({ id: 'admin', name: 'Admin', path: '/admin', icon: <Shield className="w-6 h-6" /> });
  }

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-indigo-900 border border-white/10 rounded-[32px] shadow-2xl shadow-indigo-900/50 backdrop-blur-xl p-2 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname + location.search === item.path || 
                           (item.id === 'dashboard' && location.pathname === '/dashboard' && !location.search) ||
                           (item.id === 'admin' && location.pathname.startsWith('/admin'));
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
                isActive 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/20' 
                  : 'text-indigo-200'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-black uppercase tracking-tighter mt-1">{item.name}</span>
            </Link>
          );
        })}
        
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center p-3 rounded-2xl text-red-300 hover:text-red-100 transition-all"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-tighter mt-1">Keluar</span>
        </button>
      </div>
    </nav>
  );
}
