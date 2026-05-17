import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { CheckCircle2, GraduationCap, ChevronRight, BookOpen, Star, Trophy, Users, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="overflow-hidden bg-white">
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] items-center px-4 pt-16 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.05]" />
        
        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-orange-600 border border-orange-100">
                <Star className="h-4 w-4 fill-current" />
                <span>LMS Kedinasan No. 1 di Indonesia</span>
              </div>
              <h1 className="text-4xl font-black leading-[1.1] tracking-tighter text-slate-900 sm:text-7xl lg:text-8xl">
                SIAP JADI <br/>
                <span className="text-indigo-900">
                  ABDI NEGARA
                </span>
                <span className="text-orange-500">.</span>
              </h1>
              <p className="mt-6 sm:mt-8 max-w-lg text-base sm:text-lg font-medium text-slate-500 leading-relaxed italic">
                Bimbingan belajar online paling intensif untuk IPDN, STAN, STIS, POLTEKIP, dan Sekolah Kedinasan favorit lainnya.
              </p>
              <div className="mt-8 sm:mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/login"
                  className="group flex items-center justify-center gap-3 rounded-2xl bg-indigo-900 px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-black uppercase tracking-widest text-white transition-all hover:bg-black hover:shadow-2xl hover:shadow-indigo-200 active:scale-95"
                >
                  Mulai Belajar
                  <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#features"
                  className="flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-100 bg-white px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-black uppercase tracking-widest text-indigo-900 transition-all hover:bg-slate-50 active:scale-95"
                >
                  Lihat Program
                </a>
              </div>
              
              <div className="mt-12 sm:mt-16 grid grid-cols-2 sm:flex sm:items-center gap-6 sm:gap-10">
                <div className="flex flex-col">
                  <span className="text-2xl sm:text-3xl font-black text-indigo-900">5K+</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Siswa Aktif</span>
                </div>
                <div className="hidden sm:block w-[1px] h-10 bg-slate-100" />
                <div className="flex flex-col">
                  <span className="text-2xl sm:text-3xl font-black text-indigo-900">95%</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lulus SKD</span>
                </div>
                <div className="hidden sm:block w-[1px] h-10 bg-slate-100" />
                <div className="flex flex-col col-span-2 sm:col-span-1">
                  <span className="text-2xl sm:text-3xl font-black text-indigo-900">200+</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Video Materi</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <div className="relative mx-auto aspect-[4/5] max-w-[500px]">
                <div className="absolute inset-0 rotate-6 rounded-[40px] bg-indigo-900/5 border border-indigo-900/10" />
                <div className="absolute inset-0 -rotate-3 rounded-[40px] bg-orange-500 shadow-2xl shadow-orange-100 scale-[1.02]" />
                <img
                  src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop"
                  alt="Student Excellence"
                  className="relative h-full w-full rounded-[40px] object-cover shadow-2xl brightness-90 grayscale-[0.2]"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay Badges */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -left-4 sm:-left-10 top-20 rounded-2xl sm:rounded-3xl bg-white p-3 sm:p-5 shadow-2xl shadow-indigo-100 border border-slate-50"
                >
                  <Trophy className="h-6 w-6 sm:h-10 sm:w-10 text-orange-500" />
                </motion.div>
                
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -right-4 sm:-right-8 bottom-24 sm:bottom-32 rounded-2xl sm:rounded-[24px] bg-indigo-900 p-4 sm:p-6 shadow-2xl shadow-indigo-900/30 text-white"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10">
                      <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-60">Verified Admin</p>
                      <p className="text-xs sm:text-sm font-black italic">Materi Terupdate 2024</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Program Details */}
      <section id="features" className="bg-slate-50 py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 sm:mb-20">
             <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-700 mb-6">
                Program Unggulan
              </div>
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 sm:text-5xl lg:text-6xl">
              Didesain Untuk <span className="text-indigo-600 italic underline decoration-orange-500 underline-offset-8">Kemenangan</span>.
            </h2>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-8 sm:gap-12 md:grid-cols-3"
          >
            {[
              {
                icon: <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-900" />,
                title: "KURIKULUM CAT",
                description: "Bedah tuntas materi SKD (TWK, TIU, TKP) sesuai standar sistem CAT BKN terbaru.",
                color: "bg-indigo-50"
              },
              {
                icon: <Users className="h-8 w-8 sm:h-10 sm:w-10 text-orange-600" />,
                title: "LIVE MENTORING",
                description: "Sesi tanya jawab langsung dengan alumni Sekolah Kedinasan yang sudah berpengalaman.",
                color: "bg-orange-50"
              },
              {
                icon: <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />,
                title: "INTELLIGENT RECAP",
                description: "Analisis performa mendalam untuk mengetahui kelemahan dan kekuatan belajarmu.",
                color: "bg-green-50"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={item}
                className="group relative rounded-[32px] sm:rounded-[40px] bg-white p-8 sm:p-10 shadow-sm border border-slate-100 transition-all hover:shadow-2xl hover:-translate-y-2"
              >
                <div className={`mb-6 sm:mb-8 inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl ${feature.color} border border-transparent group-hover:border-slate-100 transition-all`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{feature.title}</h3>
                <p className="mt-4 text-sm sm:text-slate-500 font-medium leading-relaxed italic">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-900 py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100" fill="white" />
           </svg>
        </div>
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white sm:text-6xl tracking-tighter">
            JANGAN TUNDA <br/>
            <span className="text-orange-500 uppercase">MIMPIMU!</span>
          </h2>
          <p className="mt-6 text-indigo-200 text-base sm:text-lg font-medium italic">
            Kuota periode Maret terbatas. Daftar sekarang dan amankan kursimu di Sekolah Kedinasan impian.
          </p>
          <div className="mt-10 sm:mt-12">
            <Link
              to="/login"
              className="inline-flex items-center gap-3 rounded-full bg-orange-500 px-10 sm:px-12 py-5 text-lg sm:text-xl font-black uppercase tracking-widest text-white shadow-2xl shadow-orange-900/50 transition-all hover:bg-orange-600 active:scale-95"
            >
              Daftar Sekarang
              <ChevronRight className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-white py-16 px-4 border-t border-slate-100">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-indigo-900 flex items-center justify-center text-white font-black text-xl">Z</div>
             <span className="font-black text-slate-900 tracking-tighter uppercase italic">ZONA PRESTASI YUMARIS</span>
          </div>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
            © 2024. All Rights Reserved. Prepared for Excellence.
          </p>
        </div>
      </footer>
    </div>
  );
}
