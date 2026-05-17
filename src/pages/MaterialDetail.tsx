import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db, doc, getDoc, setDoc, serverTimestamp } from '../lib/firebase';
import { useAuth } from '../components/AuthContext';
import { ChevronLeft, Play, FileText, CheckCircle, ArrowRight, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface Material {
  id: string;
  title: string;
  content: string;
  description: string;
  type: string;
  videoUrl?: string;
}

function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
}

export default function MaterialDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaterial = async () => {
      if (!id) return;
      
      try {
        const docRef = doc(db, 'materials', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setMaterial({ id: docSnap.id, ...docSnap.data() } as Material);
          
          if (profile) {
            const progressRef = doc(db, 'progress', `${profile.uid}_${id}`);
            await setDoc(progressRef, {
              userId: profile.uid,
              materialId: id,
              status: 'started',
              lastAccessedAt: serverTimestamp()
            }, { merge: true });
          }
        } else {
          toast.error('Materi tidak ditemukan');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [id, profile]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-white h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-900"></div>
    </div>
  );

  if (!material) return null;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <Link 
          to="/dashboard" 
          className="mb-8 sm:mb-10 inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-indigo-900 transition-all group"
        >
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          KEMBALI KE PANEL BELAJAR
        </Link>

        <article className="rounded-[32px] sm:rounded-[48px] bg-white p-6 sm:p-10 md:p-20 shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none hidden sm:block">
             {material.type === 'video' ? <Play className="h-48 w-48" /> : <FileText className="h-48 w-48" />}
          </div>

          <header className="mb-10 sm:mb-16 relative z-10">
            <div className="mb-4 sm:mb-6 inline-flex rounded-2xl bg-indigo-50 border border-indigo-100 px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 italic">
              {material.type} Content
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter text-slate-900 italic leading-tight">
              {material.title}
            </h1>
            <div className="h-2 w-24 sm:w-32 bg-orange-500 mt-6 sm:mt-8 rounded-full" />
            <p className="mt-6 sm:mt-8 text-base sm:text-xl text-slate-500 italic font-bold leading-relaxed max-w-3xl">
              {material.description}
            </p>
          </header>

          {material.type === 'video' && material.videoUrl && (
             <div className="mb-10 sm:mb-16 relative z-10 rounded-2xl sm:rounded-[32px] overflow-hidden shadow-2xl border-4 border-slate-50 aspect-video bg-black">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${getYouTubeId(material.videoUrl)}`}
                  title={material.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
             </div>
          )}

          <div className="max-w-none relative z-10">
            <div className="markdown-body text-slate-700 text-base sm:text-lg leading-loose italic font-medium">
              <ReactMarkdown>{material.content}</ReactMarkdown>
            </div>
          </div>

          <div className="mt-12 sm:mt-20 border-t-2 border-slate-50 pt-10 sm:pt-16 relative z-10">
            <div className="flex flex-col items-center justify-between rounded-[32px] sm:rounded-[40px] bg-indigo-900 p-8 sm:p-12 md:flex-row shadow-2xl shadow-indigo-900/40 border-4 border-indigo-950 gap-8">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                    <HelpCircle className="text-orange-500 h-6 w-6" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Penajaman Materi</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white italic tracking-tighter">Uji Pemahaman Sekarang</h3>
                <p className="mt-2 text-indigo-200 text-sm font-bold opacity-80">Gunakan simulasi quiz untuk mengukur tingkat penguasaan materi bimbingan.</p>
              </div>
              <button 
                onClick={() => navigate(`/quiz/${material.id}`)}
                className="w-full md:w-auto group flex items-center justify-center gap-4 rounded-3xl bg-orange-500 px-10 py-6 text-lg font-black uppercase tracking-widest text-white shadow-2xl shadow-orange-950 transition-all hover:bg-orange-600 active:scale-95 border-b-4 border-orange-700"
              >
                MULAI KUIS
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
              </button>
            </div>
          </div>
        </article>
        
        <div className="mt-12 text-center pb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 italic">
            MODUL RESMI ZONA PRESTASI YUMARIS © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
