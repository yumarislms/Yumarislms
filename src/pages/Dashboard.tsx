import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { db, collection, query, orderBy, onSnapshot, where } from '../lib/firebase';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Trophy, Clock, ChevronRight, Play, Search, GraduationCap, Calendar, CheckCircle2, ArrowLeft, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Material {
  id: string;
  title: string;
  description: string;
  type: string;
  categoryId: string;
}

interface Submission {
  quizId: string;
  score: number;
  completedAt: any;
  title?: string;
}

interface Quiz {
  id: string;
  title: string;
  materialId: string;
  questions: any[];
}

interface Class {
  id: string;
  name: string;
  description?: string;
  code?: string;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overall';
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubCats = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    });

    const unsubMats = onSnapshot(query(collection(db, 'materials'), orderBy('createdAt', 'desc')), (snapshot) => {
      setMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material)));
      setLoading(false);
    });

    const unsubQuizzes = onSnapshot(collection(db, 'quizzes'), (snapshot) => {
      setQuizzes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz)));
    });

    const unsubClasses = onSnapshot(collection(db, 'classes'), (snapshot) => {
      setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class)));
    });

    if (profile) {
      const unsubSubs = onSnapshot(
        query(collection(db, 'submissions'), where('userId', '==', profile.uid), orderBy('completedAt', 'desc')),
        (snapshot) => {
          setSubmissions(snapshot.docs.map(doc => doc.data() as Submission));
        }
      );

      // Teacher specific: load students in the same class
      let unsubStudents: any = () => {};
      let unsubAllSubs: any = () => {};
      
      if (profile.role === 'teacher' && profile.classId) {
        const classIds = profile.classId.split(',').map(s => s.trim()).filter(Boolean);
        if (classIds.length > 0) {
          unsubStudents = onSnapshot(
            query(collection(db, 'users'), where('classId', 'in', classIds), where('role', '==', 'student')),
            (snapshot) => {
              setClassStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
          );

          unsubAllSubs = onSnapshot(
            query(collection(db, 'submissions'), where('classId', 'in', classIds), orderBy('completedAt', 'desc')),
            (snapshot) => {
              setAllSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
          );
        }
      }

      return () => {
        unsubCats();
        unsubMats();
        unsubQuizzes();
        unsubClasses();
        unsubSubs();
        unsubStudents();
        unsubAllSubs();
      };
    }

    return () => {
      unsubCats();
      unsubMats();
      unsubQuizzes();
      unsubClasses();
    };
  }, [profile]);

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const averageScore = submissions.length > 0 
    ? Math.round(submissions.reduce((a, b) => a + b.score, 0) / submissions.length) 
    : 0;

  const renderContent = () => {
    switch (activeTab) {
      case 'materials':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tighter italic uppercase">Bank Materi Kedinasan</h1>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari modul..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-6 py-3 border-2 border-slate-100 bg-white rounded-2xl text-sm font-bold outline-none focus:border-indigo-600 transition-all w-full sm:w-64 shadow-inner"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((m) => (
                <Link
                  key={m.id}
                  to={`/materials/${m.id}`}
                  className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col hover:shadow-2xl hover:shadow-indigo-100 transition-all border-b-8 border-b-indigo-50 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                      {m.type === 'video' ? <Play className="h-20 w-20" /> : <BookOpen className="h-20 w-20" />}
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest italic shadow-sm">
                      {categories.find(c => c.id === m.categoryId)?.name || 'Umum'}
                    </span>
                    <div className="h-2 w-2 rounded-full bg-slate-200"></div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{m.type}</span>
                  </div>
                  <h4 className="font-black text-slate-900 mb-3 text-xl group-hover:text-indigo-600 transition-colors tracking-tight leading-tight uppercase italic">{m.title}</h4>
                  <p className="text-slate-400 text-xs font-bold leading-relaxed line-clamp-3 italic mb-8">{m.description}</p>
                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between text-indigo-600 font-black text-xs uppercase tracking-[0.2em]">
                    <span className="group-hover:translate-x-1 transition-transform">Eksplorasi Modul</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
            {filteredMaterials.length === 0 && !loading && (
              <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-black uppercase italic tracking-widest">Materi tidak ditemukan</p>
              </div>
            )}
          </motion.div>
        );

      case 'quizzes':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col gap-6">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tighter italic uppercase">Simulasi & Kuis Interaktif</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((q) => (
                <Link
                  key={q.id}
                  to={`/quiz/${q.id}`}
                  className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col hover:shadow-2xl hover:shadow-orange-100 transition-all border-b-8 border-b-orange-50 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                      <Trophy className="h-20 w-20" />
                  </div>
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner">
                        <Trophy className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic mb-2">{q.title}</h3>
                  <div className="flex items-center gap-2 mb-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Target Materi:</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                          {materials.find(m => m.id === q.materialId)?.title || 'Umum'}
                      </span>
                  </div>
                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                     <div className="text-2xl font-black text-slate-900 italic">
                        {q.questions?.length || 0} 
                        <span className="text-[10px] uppercase font-black text-slate-300 not-italic tracking-widest ml-2">Butir Soal</span>
                     </div>
                     <button className="bg-indigo-900 text-white p-3 rounded-2xl shadow-lg shadow-indigo-200 group-hover:bg-black transition-all">
                        <ChevronRight className="w-5 h-5" />
                     </button>
                  </div>
                </Link>
              ))}
            </div>
            {filteredQuizzes.length === 0 && !loading && (
              <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-black uppercase italic tracking-widest">Kuis belum tersedia</p>
              </div>
            )}
          </motion.div>
        );

      case 'grades':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col gap-6">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tighter italic uppercase">Riwayat Performa & Nilai</h1>
            <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-100 overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Judul Simulasi</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic text-center">Waktu Selesai</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic text-center">Skor Akhir</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 italic">
                        {submissions.map((s, idx) => (
                            <tr key={idx} className="hover:bg-indigo-50/20 transition-colors">
                                <td className="px-10 py-6">
                                    <div className="font-black text-slate-900 text-sm uppercase">{s.title || 'Ujian Kedinasan'}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ID: {s.quizId}</div>
                                </td>
                                <td className="px-10 py-6 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="text-xs font-black text-slate-600 uppercase tracking-tighter">
                                            {s.completedAt?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-300">
                                            {s.completedAt?.toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-6 text-center">
                                    <span className={`text-2xl font-black ${s.score >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                                        {s.score}
                                    </span>
                                </td>
                                <td className="px-10 py-6 text-right">
                                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        s.score >= 70 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                    }`}>
                                        {s.score >= 70 ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                        {s.score >= 70 ? 'Lulus' : 'Remedi'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {submissions.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-slate-300 font-black uppercase tracking-widest italic">Belum ada riwayat simulasi</p>
                    </div>
                )}
            </div>
          </motion.div>
        );

      case 'monitor':
        if (selectedStudentId) {
          const student = classStudents.find(s => s.uid === selectedStudentId);
          const studentSubs = allSubmissions.filter(s => s.userId === selectedStudentId);
          
          return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                 <button 
                  onClick={() => setSelectedStudentId(null)}
                  className="p-2 sm:p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                 >
                    <ArrowLeft className="h-5 w-5" />
                 </button>
                 <div>
                    <h1 className="text-xl sm:text-3xl font-black text-slate-800 tracking-tighter italic uppercase">Riwayat: {student?.displayName}</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student?.email}</p>
                 </div>
              </div>

              <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-100 overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                      <thead className="bg-slate-50/50 border-b border-slate-100">
                          <tr>
                              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Materi / Simulasi</th>
                              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic text-center">Waktu Pengerjaan</th>
                              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic text-center">Skor</th>
                              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic text-right">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 italic">
                          {studentSubs.map((s, idx) => (
                              <tr key={idx} className="hover:bg-indigo-50/20 transition-colors">
                                  <td className="px-10 py-6">
                                      <div className="font-black text-slate-900 text-sm uppercase">{s.title || 'Simulasi Ujian'}</div>
                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">QUIZ ID: {s.quizId}</div>
                                  </td>
                                  <td className="px-10 py-6 text-center">
                                      <div className="text-xs font-black text-slate-600 uppercase">
                                          {s.completedAt?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </div>
                                      <div className="text-[10px] font-bold text-slate-300">
                                          {s.completedAt?.toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                  </td>
                                  <td className="px-10 py-6 text-center">
                                      <span className={`text-2xl font-black ${s.score >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                                          {s.score}
                                      </span>
                                  </td>
                                  <td className="px-10 py-6 text-right">
                                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                          s.score >= 70 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                      }`}>
                                          {s.score >= 70 ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                          {s.score >= 70 ? 'Passing' : 'Failed'}
                                      </span>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {studentSubs.length === 0 && (
                      <div className="text-center py-20 italic">
                          <p className="text-slate-300 font-black uppercase tracking-widest">Siswa belum mengerjakan simulasi apapun</p>
                      </div>
                  )}
              </div>
            </motion.div>
          );
        }

        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col gap-6">
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase">Pemantauan Progres Siswa</h1>
            
            <div className="grid grid-cols-1 gap-6">
              {classStudents.map((student) => {
                const studentSubs = allSubmissions.filter(s => s.userId === student.uid);
                const avg = studentSubs.length > 0 
                  ? Math.round(studentSubs.reduce((a, b) => a + b.score, 0) / studentSubs.length)
                  : 0;

                return (
                  <div 
                    key={student.uid} 
                    onClick={() => setSelectedStudentId(student.uid)}
                    className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
                  >
                    <div className="p-8 flex flex-col md:flex-row md:items-center gap-8">
                      <div className="flex items-center gap-4 min-w-[250px]">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-2xl uppercase shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            {student.displayName?.[0] || <User className="h-8 w-8" />}
                          </div>
                          {studentSubs.length > 0 && studentSubs[0].score >= 70 && (
                             <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                                <CheckCircle2 className="h-4 w-4" />
                             </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{student.displayName}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.email}</p>
                        </div>
                      </div>

                      <div className="flex-1 flex gap-10">
                        <div>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Materi Selesai</p>
                          <p className="text-2xl font-black text-slate-900 italic">{studentSubs.length}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Skor Rata-Rata</p>
                          <p className={`text-2xl font-black italic ${avg >= 70 ? 'text-green-600' : 'text-orange-600'}`}>{avg}%</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {studentSubs.slice(0, 5).map((s, i) => (
                             <div key={i} className={`h-8 w-8 rounded-xl flex items-center justify-center text-[10px] font-black border-2 ${s.score >= 70 ? 'bg-green-50 border-green-200 text-green-600' : 'bg-orange-50 border-orange-200 text-orange-600'}`} title={s.title}>
                                {s.score}
                             </div>
                          ))}
                          {studentSubs.length > 5 && (
                            <div className="h-8 w-8 rounded-xl flex items-center justify-center text-[10px] font-black bg-slate-50 border-2 border-slate-100 text-slate-400">
                              +{studentSubs.length - 5}
                            </div>
                          )}
                        </div>
                        <div className="w-10 h-10 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-all">
                           <ChevronRight className="h-6 w-6" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50/50 px-8 py-4 border-t border-slate-50 flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                          Aktivitas Terakhir: {studentSubs[0]?.completedAt?.toDate().toLocaleDateString('id-ID') || 'Belum ada'}
                       </span>
                       <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">Klik untuk Riwayat Lengkap &rarr;</span>
                    </div>
                  </div>
                );
              })}
              {classStudents.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100 italic">
                   <p className="text-slate-300 font-black uppercase tracking-widest">Tidak ada siswa yang terdaftar di kelas anda</p>
                </div>
              )}
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col gap-6">
            {/* Welcome Hero */}
            <div className={`rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 text-white relative overflow-hidden shrink-0 shadow-2xl transform transition-transform hover:scale-[1.01] ${profile?.role === 'teacher' ? 'bg-orange-600 shadow-orange-300' : 'bg-indigo-600 shadow-indigo-300'}`}>
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-4xl font-black mb-4 tracking-tighter italic uppercase leading-tight">
                  {profile?.role === 'teacher' ? 'Teacher Strategic\nControl Panel' : 'Elite Performance\nLMS Dashboard'}
                </h2>
                <p className="text-indigo-100 max-w-md font-bold italic opacity-80 leading-relaxed mb-8 text-sm sm:text-base">
                  Status: <span className={`${profile?.role === 'teacher' ? 'text-indigo-900' : 'text-orange-400'} uppercase tracking-widest ml-1`}>{profile?.displayName}</span> (
                  {profile?.role === 'teacher' ? 'Bidang/Kelas: ' : 'Kelas: '}
                  {profile?.classId 
                    ? profile.classId.split(',').map(id => classes.find(c => c.id === id.trim())?.name || id).join(', ')
                    : 'N/A'
                  }). 
                  {profile?.role === 'teacher' 
                    ? 'Pantau progres akademik siswa dan optimalkan strategi pengajaran kamu hari ini.' 
                    : 'Selesaikan kuis interaktif untuk mentrack progress kesiapan ujian kamu.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    {profile?.role === 'teacher' ? (
                        <Link to="/dashboard?tab=monitor" className="bg-indigo-900 hover:bg-black px-8 py-4 rounded-3xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 italic">
                            Pantau Siswa
                            <Trophy className="h-5 w-5 text-orange-400" />
                        </Link>
                    ) : (
                        <Link to="/dashboard?tab=materials" className="bg-orange-500 hover:bg-black px-8 py-4 rounded-3xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 shadow-2xl shadow-orange-900/40 active:scale-95 italic">
                            Gempur Materi
                            <ChevronRight className="h-5 w-5" />
                        </Link>
                    )}
                    <Link to="/dashboard?tab=quizzes" className="bg-white/10 hover:bg-white/20 border border-white/10 px-8 py-4 rounded-3xl font-black uppercase tracking-widest text-sm transition-all active:scale-95 italic text-center">
                        {profile?.role === 'teacher' ? 'Lihat Simulasi' : 'Asah Kemampuan'}
                    </Link>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black/10 rounded-full blur-3xl opacity-20"></div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 shrink-0">
              <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-slate-100 shadow-sm flex flex-col gap-4 sm:gap-6 hover:shadow-2xl hover:shadow-slate-200 transition-all group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all transform -rotate-3 group-hover:rotate-0">
                  <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1 italic">
                    {profile?.role === 'teacher' ? 'Total Siswa Binaan' : 'Jam Belajar Efektif'}
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tighter italic">
                    {profile?.role === 'teacher' ? classStudents.length : '12.4H'}
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-slate-100 shadow-sm flex flex-col gap-4 sm:gap-6 hover:shadow-2xl hover:shadow-slate-200 transition-all group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all transform rotate-3 group-hover:rotate-0">
                  <Trophy className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1 italic">
                    {profile?.role === 'teacher' ? 'Rata-rata Skor Kelas' : 'Materi Dikuasai'}
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tighter italic">
                    {profile?.role === 'teacher' 
                        ? (allSubmissions.length > 0 ? Math.round(allSubmissions.reduce((a, b) => a + b.score, 0) / allSubmissions.length) : 0)
                        : submissions.length
                    }%
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-slate-100 shadow-sm flex flex-col gap-4 sm:gap-6 hover:shadow-2xl hover:shadow-slate-200 transition-all group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all transform -rotate-6 group-hover:rotate-0">
                  <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1 italic">
                    {profile?.role === 'teacher' ? 'Ujian Terselesaikan' : 'Skor Rata-Rata'}
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tighter italic">
                    {profile?.role === 'teacher' ? allSubmissions.length : `${averageScore}%`}
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-slate-100 shadow-sm flex flex-col gap-4 sm:gap-6 hover:shadow-2xl hover:shadow-slate-200 transition-all group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all transform rotate-12 group-hover:rotate-0">
                  <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1 italic">Ranking Cabang</p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tighter italic">Top 10</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 bg-white p-6 sm:p-10 rounded-[32px] sm:rounded-[48px] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase italic tracking-tighter">Analisis Progresivitas</h3>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">7 Hari</div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={submissions.slice(-7).map((s, i) => ({ day: `S${i+1}`, score: s.score }))}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'black'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'black'}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', background: '#fff' }}
                                    itemStyle={{ fontWeight: 'black', color: '#4f46e5', textTransform: 'uppercase', fontSize: '10px' }}
                                />
                                <Bar dataKey="score" fill="#4f46e5" radius={[12, 12, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="w-full lg:w-96 space-y-6">
                    <div className="bg-indigo-900 rounded-[48px] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                        <div className="relative z-10">
                            <Calendar className="w-10 h-10 text-orange-500 mb-6" />
                            <h4 className="text-xl font-black uppercase italic tracking-tighter mb-4">Agenda Simulasi Terdekat</h4>
                            <div className="space-y-4">
                                <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                                    <div className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">24 MEI 2026</div>
                                    <div className="text-sm font-bold">Try Out Nasional Kedinasan</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 p-4 sm:p-8 overflow-y-auto scrollbar-hide">
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
}
