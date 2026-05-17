import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, collection, query, where, getDocs, addDoc, serverTimestamp } from '../lib/firebase';
import { useAuth } from '../components/AuthContext';
import { ChevronLeft, CheckCircle2, ChevronRight, Trophy, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Question {
  id: string;
  type?: 'single' | 'multiple' | 'category' | 'text';
  question: string;
  options: string[];
  correctAnswerIndex: number;
  correctAnswerIndices?: number[];
  textAnswer?: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export default function QuizPage() {
  const { id } = useParams(); // materialId
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  // Utility to shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const processQuizData = (data: any): Quiz => {
    let questions = [...(data.questions || [])].map(q => ({
      ...q,
      type: q.type || 'single'
    }));
    
    // 1. Shuffle Questions
    questions = shuffleArray(questions);

    // 2. Shuffle Options for specific types
    questions = questions.map(q => {
      if (q.type === 'single') {
        const originalOptions = q.options;
        const correctOptionText = originalOptions[q.correctAnswerIndex];
        
        const shuffledOptions = shuffleArray(originalOptions);
        const newCorrectIndex = shuffledOptions.findIndex(opt => opt === correctOptionText);

        return { ...q, options: shuffledOptions, correctAnswerIndex: newCorrectIndex };
      }
      
      if (q.type === 'multiple') {
        const originalOptions = q.options;
        const correctOptionsTexts = (q.correctAnswerIndices || []).map((idx: number) => originalOptions[idx]);
        
        const shuffledOptions = shuffleArray(originalOptions);
        const newCorrectIndices = shuffledOptions
          .map((opt, idx) => correctOptionsTexts.includes(opt) ? idx : -1)
          .filter(idx => idx !== -1);

        return { ...q, options: shuffledOptions, correctAnswerIndices: newCorrectIndices };
      }

      // 'category' and 'text' types don't shuffle options/statements generally to keep order
      return q;
    });

    return {
      ...data,
      questions
    };
  };

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'quizzes'), where('materialId', '==', id));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const quizDoc = snapshot.docs[0];
        const processed = processQuizData({ id: quizDoc.id, ...quizDoc.data() });
        setQuiz(processed);
      } else {
        // Fallback demo data with types
        const demoData = {
          id: 'demo',
          title: 'Simulasi Seleksi Dasar',
          questions: [
            {
              id: '1',
              type: 'single',
              question: 'Apa kepanjangan dari IPDN?',
              options: ['Institut Pemerintahan Dalam Negeri', 'Institut Pendidikan Dalam Negeri', 'Ikatan Pendidikan Dalam Negeri'],
              correctAnswerIndex: 0
            },
            {
              id: '2',
              type: 'text',
              question: 'Tuliskan ibukota Indonesia saat ini (2024)?',
              textAnswer: 'Jakarta'
            }
          ]
        };
        setQuiz(processQuizData(demoData));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const handleNext = () => {
    const q = quiz?.questions[currentQuestionIdx];
    if (!q) return;

    let isAnswered = false;
    if (q.type === 'single') isAnswered = selectedAnswer !== null;
    else if (q.type === 'multiple') isAnswered = (selectedAnswer as number[])?.length > 0;
    else if (q.type === 'category') {
      const answers = (selectedAnswer as Record<number, boolean>) || {};
      isAnswered = q.options.every((_, idx) => answers[idx] !== undefined);
    }
    else if (q.type === 'text') isAnswered = (selectedAnswer as string)?.trim().length > 0;

    if (!isAnswered) return;
    
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (currentQuestionIdx < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (finalAnswers: any[]) => {
    if (!quiz) return;
    
    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      const ans = finalAnswers[idx];
      
      if (q.type === 'single') {
        if (q.correctAnswerIndex === ans) correctCount++;
      } else if (q.type === 'multiple') {
        const userIndices = (ans as number[]) || [];
        const correctIndices = q.correctAnswerIndices || [];
        if (userIndices.length === correctIndices.length && 
            userIndices.every(i => correctIndices.includes(i))) {
          correctCount++;
        }
      } else if (q.type === 'category') {
        const userAnswers = (ans as Record<number, boolean>) || {};
        const correctIndices = q.correctAnswerIndices || []; // indices that should be true
        const isCorrect = q.options.every((_, idx) => {
          const shouldBeTrue = correctIndices.includes(idx);
          return userAnswers[idx] === shouldBeTrue;
        });
        if (isCorrect) correctCount++;
      } else if (q.type === 'text') {
        if ((ans as string)?.toLowerCase().trim() === (q.textAnswer as string)?.toLowerCase().trim()) {
          correctCount++;
        }
      }
    });

    const finalScore = Math.round((correctCount / quiz.questions.length) * 100);
    setScore(finalScore);
    setIsFinished(true);

    if (profile) {
      try {
        await addDoc(collection(db, 'submissions'), {
          userId: profile.uid,
          quizId: quiz.id,
          title: quiz.title,
          classId: profile.classId || null,
          materialId: id,
          score: finalScore,
          answers: finalAnswers,
          completedAt: serverTimestamp()
        });
        toast.success(`Simulasi selesai! Skor kamu: ${finalScore}`);
      } catch (err) {
        console.error('Failed to save submission', err);
      }
    }
  };

  if (loading) return (
     <div className="flex-1 flex items-center justify-center bg-slate-50 h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-900"></div>
    </div>
  );

  if (!quiz) return (
     <div className="flex-1 flex items-center justify-center p-8 text-center bg-slate-50">
       <div className="max-w-md rounded-[48px] bg-white p-12 shadow-2xl">
         <AlertCircle className="mx-auto h-20 w-20 text-slate-200 mb-8" />
         <h1 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase">Kuis Belum Tersedia</h1>
         <p className="mt-4 text-slate-500 font-bold italic">Maaf, instruktur belum merilis kuis untuk materi bimbingan ini.</p>
         <button 
          onClick={() => navigate(-1)} 
          className="mt-10 w-full rounded-2xl bg-indigo-900 py-4 font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-900/20"
         >
           KEMBALI KE MATERI
         </button>
       </div>
    </div>
  );

  if (isFinished) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 flex items-center justify-center p-4 sm:p-8">
        <motion.div
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="w-full max-w-2xl rounded-[48px] sm:rounded-[64px] bg-white p-8 sm:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border-8 border-indigo-50 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-4 bg-orange-500" />
          <div className="mx-auto mb-10 flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-[32px] sm:rounded-[40px] bg-indigo-900 text-white shadow-2xl shadow-indigo-900/40 transform -rotate-6">
            <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-orange-500" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 italic tracking-tighter uppercase mb-2 leading-none">Simulasi Tuntas!</h1>
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Laporan Performa Pembelajaran</p>
          
          <div className="my-8 sm:my-12 relative inline-flex items-center justify-center">
              <div className="text-7xl sm:text-9xl font-black text-indigo-900 italic leading-none">{score}</div>
              <div className="absolute -top-4 -right-6 bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">POIN</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-[24px] sm:rounded-[32px] border-4 border-slate-100 bg-white py-4 sm:py-6 text-sm font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50 active:scale-95 italic"
            >
              Dashboard
            </button>
            <button
               onClick={() => {
                 setIsFinished(false);
                 setCurrentQuestionIdx(0);
                 setAnswers([]);
                 setScore(0);
                 fetchQuiz();
               }}
              className="flex items-center justify-center gap-3 rounded-[24px] sm:rounded-[32px] bg-orange-500 py-4 sm:py-6 text-sm font-black uppercase tracking-widest text-white shadow-2xl shadow-orange-900/20 transition-all hover:bg-orange-600 active:scale-95 border-b-4 border-orange-700 italic"
            >
              <RefreshCw className="h-5 w-5" />
              ULANGI SIMULASI
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIdx];
  const progress = ((currentQuestionIdx + 1) / quiz.questions.length) * 100;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-12 lg:p-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 italic">Simulasi Kecerdasan v1.0</h2>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">{quiz.title}</h1>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-2xl sm:text-3xl font-black text-indigo-900 italic">{currentQuestionIdx + 1}</span>
            <span className="text-sm font-black text-slate-300 italic"> / {quiz.questions.length}</span>
          </div>
        </div>

        <div className="mb-10 sm:mb-16 h-3 sm:h-4 w-full overflow-hidden rounded-full bg-white border-2 border-slate-100 shadow-inner">
          <motion.div 
            className="h-full bg-gradient-to-r from-indigo-900 to-indigo-600 rounded-full" 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIdx}
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -30, opacity: 0 }}
            className="space-y-8 sm:space-y-12"
          >
            <div className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-10 md:p-16 shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 -translate-y-1/2 translate-x-1/2 rotate-45" />
                <h3 className="text-xl sm:text-2xl md:text-4xl font-black leading-tight text-slate-900 italic tracking-tighter">
                {currentQuestion.question}
                </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-5">
              {currentQuestion.type === 'text' ? (
                <div className="bg-white p-8 rounded-[32px] sm:rounded-[40px] border-4 border-slate-100 shadow-xl">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 block">Jawaban Anda</label>
                  <input 
                    type="text"
                    autoFocus
                    placeholder="Tuliskan jawaban di sini..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 sm:p-8 text-xl sm:text-2xl font-black italic outline-none focus:border-indigo-600 transition-all"
                    value={(selectedAnswer as string) || ''}
                    onChange={e => setSelectedAnswer(e.target.value)}
                  />
                </div>
              ) : currentQuestion.type === 'category' ? (
                <div className="bg-white rounded-[32px] sm:rounded-[40px] border-4 border-slate-100 shadow-xl overflow-hidden">
                  <div className="grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_120px_120px] bg-slate-50 border-b-2 border-slate-100">
                    <div className="p-4 sm:p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Pernyataan</div>
                    <div className="p-4 sm:p-6 text-center text-[10px] font-black uppercase tracking-widest text-indigo-900 border-l border-slate-100">Benar</div>
                    <div className="p-4 sm:p-6 text-center text-[10px] font-black uppercase tracking-widest text-orange-500 border-l border-slate-100">Salah</div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {currentQuestion.options.map((option, idx) => {
                      const currentAnswers = (selectedAnswer as Record<number, boolean>) || {};
                      const choice = currentAnswers[idx];
                      
                      return (
                        <div key={idx} className={`grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_120px_120px] items-center transition-colors ${choice === undefined ? 'bg-white' : 'bg-indigo-50/20'}`}>
                          <div className="p-4 sm:p-6 text-xs sm:text-base font-bold text-slate-700">{option}</div>
                          <button
                            type="button"
                            onClick={() => setSelectedAnswer({ ...currentAnswers, [idx]: true })}
                            className={`p-4 sm:p-6 h-full flex items-center justify-center border-l border-slate-100 transition-all ${choice === true ? 'bg-indigo-900 text-white' : 'bg-transparent text-slate-200 hover:bg-indigo-50 hover:text-indigo-900'}`}
                          >
                            <CheckCircle2 className="h-6 w-6" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedAnswer({ ...currentAnswers, [idx]: false })}
                            className={`p-4 sm:p-6 h-full flex items-center justify-center border-l border-slate-100 transition-all ${choice === false ? 'bg-orange-500 text-white' : 'bg-transparent text-slate-200 hover:bg-orange-50 hover:text-orange-500'}`}
                          >
                            <CheckCircle2 className="h-6 w-6" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                currentQuestion.options.map((option, idx) => {
                  const isMultiple = currentQuestion.type === 'multiple';
                  const isSelected = isMultiple 
                    ? ((selectedAnswer as number[])?.includes(idx))
                    : (selectedAnswer === idx);

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (isMultiple) {
                          const current = (selectedAnswer as number[]) || [];
                          const next = current.includes(idx) 
                            ? current.filter(i => i !== idx) 
                            : [...current, idx];
                          setSelectedAnswer(next);
                        } else {
                          setSelectedAnswer(idx);
                        }
                      }}
                      className={`flex w-full items-center justify-between rounded-[24px] sm:rounded-[32px] border-4 p-5 sm:p-8 text-left transition-all relative overflow-hidden group ${
                        isSelected 
                          ? 'border-indigo-900 bg-indigo-50/50 shadow-2xl scale-[1.01] sm:translate-x-2' 
                          : 'border-white bg-white hover:border-indigo-100 hover:shadow-xl'
                      }`}
                    >
                      <div className="flex items-center gap-4 sm:gap-6 relative z-10 w-full">
                          <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl shrink-0 flex items-center justify-center font-black transition-all ${
                              isSelected ? 'bg-indigo-900 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                          }`}>
                              {String.fromCharCode(65 + idx)}
                          </div>
                          <span className={`flex-1 text-sm sm:text-lg font-black italic tracking-tight transition-colors ${
                              isSelected ? 'text-indigo-900' : 'text-slate-600'
                          }`}>{option}</span>
                      </div>
                      {isSelected && (
                        isMultiple 
                          ? <div className="h-6 w-6 sm:h-8 sm:w-8 bg-indigo-900 rounded-lg flex items-center justify-center relative z-10 shrink-0 ml-2"><CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" /></div>
                          : <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-900 relative z-10 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="pt-4 sm:pt-8">
              <button
                onClick={handleNext}
                disabled={(() => {
                    const q = currentQuestion;
                    if (q.type === 'single') return selectedAnswer === null;
                    if (q.type === 'multiple') return (selectedAnswer as number[])?.length === 0;
                    if (q.type === 'category') {
                      const answers = (selectedAnswer as Record<number, boolean>) || {};
                      return !q.options.every((_, idx) => answers[idx] !== undefined);
                    }
                    if (q.type === 'text') return !(selectedAnswer as string)?.trim();
                    return selectedAnswer === null;
                })()}
                className="flex w-full items-center justify-center gap-4 rounded-[24px] sm:rounded-[32px] bg-indigo-900 py-6 sm:py-8 text-base sm:text-xl font-black uppercase tracking-[0.2em] text-white shadow-[0_20px_50px_rgba(49,46,129,0.3)] transition-all hover:bg-black active:scale-[0.98] disabled:opacity-30 disabled:shadow-none italic"
              >
                {currentQuestionIdx === quiz.questions.length - 1 ? 'SELESAIKAN' : 'LANJUT'}
                <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7 text-orange-500" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
