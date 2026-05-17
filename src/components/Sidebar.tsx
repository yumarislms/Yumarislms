import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LayoutDashboard, GraduationCap, Trophy, Shield, Info, ClipboardList, Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function Sidebar() {
  const { profile, isAdmin } = useAuth();
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'materials', name: 'Materi Kedinasan', path: '/dashboard?tab=materials', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'quiz', name: 'Kuis Interaktif', path: '/dashboard?tab=quizzes', icon: <Trophy className="w-5 h-5" /> },
    { id: 'grades', name: 'Daftar Nilai', path: '/dashboard?tab=grades', icon: <ClipboardList className="w-5 h-5" /> },
    ...(profile?.role === 'teacher' ? [
      { id: 'monitor', name: 'Pantau Siswa', path: '/dashboard?tab=monitor', icon: <Users className="w-5 h-5" /> }
    ] : []),
  ];

  return (
    <aside className="w-64 bg-indigo-900 flex flex-col h-screen sticky top-0 shrink-0 hidden md:flex">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3 mb-10 transition-transform active:scale-95">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-orange-900/50">
            Z
          </div>
          <h1 className="text-white font-black text-lg leading-tight uppercase tracking-tighter">
            ZONA PRESTASI<br />
            <span className="text-orange-400 text-[10px] tracking-widest font-bold">YUMARIS EDITION</span>
          </h1>
        </Link>
        
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname + location.search === item.path || (item.id === 'dashboard' && location.pathname === '/dashboard' && !location.search);
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive
                    ? 'bg-white/10 text-white shadow-inner border border-white/10'
                    : 'text-indigo-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className={isActive ? 'text-orange-400' : 'opacity-70'}>
                  {item.icon}
                </div>
                <span className="text-sm tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        {isAdmin && (
          <div className="mt-10 pt-8 border-t border-white/10">
            <p className="px-4 text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-black mb-4">Admin Control</p>
            <Link 
              to="/admin" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all border ${
                location.pathname.startsWith('/admin')
                  ? 'bg-indigo-800 border-indigo-400 text-white shadow-lg'
                  : 'text-indigo-200 hover:bg-white/5 border-transparent'
              }`}
            >
              <Shield className="w-5 h-5 opacity-70" />
              <span className="text-sm tracking-tight">Super Admin Panel</span>
            </Link>
          </div>
        )}
      </div>
      
      <div className="mt-auto p-6">
        <div className="bg-indigo-800/50 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-3">
            {profile?.photoURL ? (
                <img src={profile.photoURL} alt="" className="w-10 h-10 rounded-full border-2 border-orange-500/30 object-cover" referrerPolicy="no-referrer" />
            ) : (
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black uppercase shadow-inner">
                    {profile?.displayName?.[0]}
                </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-black truncate">{profile?.displayName}</p>
              <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest truncate">{profile?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
