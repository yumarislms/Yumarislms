import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { signInWithPopup, googleProvider, auth, signInWithEmailAndPassword } from '../lib/firebase';
import { GraduationCap, LogIn, User, Lock, Chrome } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Berhasil masuk sebagai Super Admin!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast.error('Gagal masuk. Pastikan Anda menggunakan akun Google yang terdaftar.');
    }
  };

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Simulate username by appending local domain if not an email
      const email = username.includes('@') ? username : `${username}@zonaprestasi.local`;
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Berhasil masuk!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast.error('Username atau Password salah.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-8 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-[32px] sm:rounded-[48px] bg-white p-6 sm:p-10 shadow-2xl shadow-slate-200 border border-white"
      >
        <div className="mb-8 sm:mb-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-indigo-900 text-white shadow-2xl shadow-indigo-200 transform -rotate-6">
            <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10 text-orange-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">Zona Prestasi</h1>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Official Portal Belajar</p>
        </div>

        <form onSubmit={handleCredentialLogin} className="space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <input
                type="text"
                placeholder="Username"
                className="w-full rounded-xl sm:rounded-2xl border-2 border-slate-100 bg-slate-50 py-3 sm:py-4 pl-12 pr-4 font-black text-xs sm:text-sm outline-none focus:border-indigo-600 transition-all placeholder:italic placeholder:text-slate-300"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <input
                type="password"
                placeholder="PASSWORD"
                className="w-full rounded-xl sm:rounded-2xl border-2 border-slate-100 bg-slate-50 py-3 sm:py-4 pl-12 pr-4 font-black text-xs sm:text-sm outline-none focus:border-indigo-600 transition-all placeholder:italic placeholder:text-slate-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex w-full items-center justify-center gap-3 rounded-2xl sm:rounded-3xl bg-indigo-900 py-4 sm:py-5 text-base sm:text-lg font-black uppercase tracking-widest text-white shadow-2xl shadow-indigo-900/20 transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50 italic"
          >
            {isSubmitting ? 'OTENTIKASI...' : 'MASUK SEKARANG'}
            <LogIn className="h-5 w-5 text-orange-500 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <div className="relative my-8 sm:my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] italic">
            <span className="bg-white px-4 text-slate-400">Khusus Super Admin</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading || isSubmitting}
          className="flex w-full items-center justify-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border-2 border-slate-100 bg-white px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-600 transition-all hover:border-indigo-600 hover:text-indigo-900 active:scale-95 italic"
        >
          <Chrome className="h-5 w-5 text-indigo-600" />
          Login dengan Google
        </button>

        <div className="mt-12 text-center">
          <p className="text-[10px] font-black tracking-widest text-slate-300 uppercase italic">
            MODUL RESMI YUMARIS © 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
}
