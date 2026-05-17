import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { signOut, auth } from '../lib/firebase';
import { LogOut, Search, Bell } from 'lucide-react';
import { motion } from 'motion/react';

export default function Navbar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const isInternal = location.pathname !== '/' && user;

  if (isInternal) {
    return (
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-4 flex-1">
          <span className="text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input 
            type="text" 
            placeholder="Cari materi, kuis, atau jadwal..." 
            className="text-sm text-slate-600 outline-none w-64 bg-transparent placeholder:italic font-medium"
          />
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
            Online: 124 Siswa
          </div>
          
          <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="h-6 w-[1px] bg-slate-200" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Keluar"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-900 font-black text-white text-2xl shadow-xl shadow-indigo-900/20 group-hover:scale-105 transition-transform">
            Z
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tighter text-slate-900 uppercase leading-none">
              ZONA PRESTASI
            </span>
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
              YUMARIS EDITION
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-8 font-bold text-sm text-slate-600">
          <a href="#features" className="hover:text-indigo-600 transition-colors hidden md:block italic">Fitur Unggulan</a>
          <a href="#pricing" className="hover:text-indigo-600 transition-colors hidden md:block italic">Program Belajar</a>
          
          {user ? (
            <Link
              to="/dashboard"
              className="rounded-2xl bg-indigo-900 px-8 py-3 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-900/30 transition-all hover:bg-black active:scale-95"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-2xl bg-indigo-900 px-8 py-3 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-900/30 transition-all hover:bg-black active:scale-95"
            >
              Masuk Belajar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
