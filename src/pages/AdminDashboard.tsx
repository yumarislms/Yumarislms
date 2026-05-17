import { useState, useEffect } from 'react';
import { db, collection, getDocs, addDoc, serverTimestamp, setDoc, doc, query, orderBy, onSnapshot, deleteDoc, createUserWithEmailAndPassword, updateProfile } from '../lib/firebase';
import { Plus, Users, BookOpen, Layers, BarChart3, Trash2, Edit, Save, X, PlusCircle, Shield, GraduationCap, ChevronRight, UserPlus, Key, HelpCircle, CheckCircle2, School, Hash, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Secondary app to create users without logging out admin
const secondaryApp = getApps().find(app => app.name === 'Secondary') || initializeApp(firebaseConfig, 'Secondary');
const secondaryAuth = getAuth(secondaryApp);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'materials' | 'categories' | 'quizzes' | 'classes'>('overview');
  const [categories, setCategories] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  // Forms
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newClass, setNewClass] = useState({ name: '', description: '', code: '' });
  const [newMaterial, setNewMaterial] = useState({ title: '', description: '', content: '', categoryId: '', type: 'article', videoUrl: '' });
  const [newQuiz, setNewQuiz] = useState({ 
    materialId: '', 
    title: '', 
    questions: [
      { question: '', options: ['', '', '', ''], correctAnswerIndex: 0 }
    ] 
  });
  const [newUser, setNewUser] = useState({ username: '', password: '', displayName: '', role: 'student', classId: '' });
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [showAddMaterialForm, setShowAddMaterialForm] = useState(false);
  const [showAddClassForm, setShowAddClassForm] = useState(false);
  const [showAddQuizForm, setShowAddQuizForm] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubCats = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubMats = onSnapshot(collection(db, 'materials'), (snapshot) => {
      setMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubQuizzes = onSnapshot(collection(db, 'quizzes'), (snapshot) => {
      setQuizzes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubClasses = onSnapshot(collection(db, 'classes'), (snapshot) => {
      setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubCats();
      unsubMats();
      unsubUsers();
      unsubQuizzes();
      unsubClasses();
    };
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategoryId) {
        await setDoc(doc(db, 'categories', editingCategoryId), {
          ...newCategory,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        toast.success('Kategori berhasil diperbarui');
      } else {
        await addDoc(collection(db, 'categories'), {
          ...newCategory,
          createdAt: serverTimestamp(),
        });
        toast.success('Kategori berhasil ditambahkan');
      }
      setNewCategory({ name: '', description: '' });
      setEditingCategoryId(null);
      setShowAddCategoryForm(false);
    } catch (error) {
      toast.error('Gagal menyimpan kategori');
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMaterialId) {
        await setDoc(doc(db, 'materials', editingMaterialId), {
          ...newMaterial,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        toast.success('Materi berhasil diperbarui');
      } else {
        await addDoc(collection(db, 'materials'), {
          ...newMaterial,
          createdAt: serverTimestamp(),
        });
        toast.success('Materi berhasil ditambahkan');
      }
      setNewMaterial({ title: '', description: '', content: '', categoryId: '', type: 'article', videoUrl: '' });
      setEditingMaterialId(null);
      setShowAddMaterialForm(false);
    } catch (error) {
      toast.error('Gagal menyimpan materi');
    }
  };

  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newQuiz.materialId) {
        toast.error('Pilih materi terlebih dahulu');
        return;
      }
      
      const quizData: any = {
        ...newQuiz,
        updatedAt: serverTimestamp(),
      };

      if (!editingQuizId) {
        quizData.createdAt = serverTimestamp();
      }

      // Use materialId as doc ID
      if (editingQuizId && editingQuizId !== newQuiz.materialId) {
        await deleteDoc(doc(db, 'quizzes', editingQuizId));
      }

      await setDoc(doc(db, 'quizzes', newQuiz.materialId), quizData, { merge: true });
      
      setNewQuiz({ materialId: '', title: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswerIndex: 0 }] });
      setEditingQuizId(null);
      setShowAddQuizForm(false);
      toast.success(editingQuizId ? 'Kuis berhasil diperbarui' : 'Kuis berhasil diterbitkan');
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error('Gagal menyimpan kuis');
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClassId) {
        await setDoc(doc(db, 'classes', editingClassId), {
          ...newClass,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        toast.success('Kelas berhasil diperbarui');
      } else {
        await addDoc(collection(db, 'classes'), {
          ...newClass,
          createdAt: serverTimestamp(),
        });
        toast.success('Kelas berhasil ditambahkan');
      }
      setNewClass({ name: '', description: '', code: '' });
      setEditingClassId(null);
      setShowAddClassForm(false);
    } catch (error) {
      toast.error('Gagal menyimpan kelas');
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.username || !newUser.displayName || !newUser.role) {
      toast.error('Mohon lengkapi data user');
      return;
    }

    if (!editingUserId && newUser.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    
    try {
      if (editingUserId) {
        // Update existing user in Firestore
        await setDoc(doc(db, 'users', editingUserId), {
          displayName: newUser.displayName,
          role: newUser.role,
          classId: newUser.classId || null,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        
        toast.success(`Profil ${newUser.displayName} berhasil diperbarui!`);
      } else {
        // Create new user
        const email = newUser.username.includes('@') ? newUser.username : `${newUser.username}@zonaprestasi.local`;
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, newUser.password);
        
        if (!userCredential.user) throw new Error('Gagal mendapatkan data user baru');

        await updateProfile(userCredential.user, { displayName: newUser.displayName });
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: email,
          username: newUser.username,
          displayName: newUser.displayName,
          role: newUser.role,
          classId: newUser.classId || null,
          createdAt: serverTimestamp()
        });

        await secondaryAuth.signOut();
        toast.success(`Akun ${newUser.displayName} berhasil dibuat!`);
      }

      setNewUser({ username: '', password: '', displayName: '', role: 'student', classId: '' });
      setEditingUserId(null);
      setShowAddUserForm(false);
    } catch (err: any) {
      console.error('Error saving user:', err);
      let message = err.message || 'Terjadi kesalahan sistem';
      if (err.code === 'auth/email-already-in-use') message = 'Username sudah terdaftar.';
      toast.error(`Gagal menyimpan: ${message}`);
    }
  };

  const handleDelete = async (coll: string, id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        await deleteDoc(doc(db, coll, id));
        if (coll === 'materials') {
          // Also delete associated quiz if it exists
          await deleteDoc(doc(db, 'quizzes', id));
        }
        toast.success('Data berhasil dihapus');
      } catch (err) {
        toast.error('Gagal menghapus data');
      }
    }
  };

  const startEditCategory = (c: any) => {
    setNewCategory({ name: c.name, description: c.description });
    setEditingCategoryId(c.id);
    setShowAddCategoryForm(true);
  };

  const startEditMaterial = (m: any) => {
    setNewMaterial({
      title: m.title,
      description: m.description,
      content: m.content,
      categoryId: m.categoryId,
      type: m.type,
      videoUrl: m.videoUrl || ''
    });
    setEditingMaterialId(m.id);
    setShowAddMaterialForm(true);
  };

  const startEditQuiz = (q: any) => {
    setNewQuiz({
      materialId: q.materialId,
      title: q.title,
      questions: JSON.parse(JSON.stringify(q.questions))
    });
    setEditingQuizId(q.id);
    setShowAddQuizForm(true);
  };

  const startEditClass = (c: any) => {
    setNewClass({ name: c.name, description: c.description, code: c.code || '' });
    setEditingClassId(c.id);
    setShowAddClassForm(true);
  };

  const startEditUser = (u: any) => {
    setNewUser({ 
      username: u.username, 
      password: '', // Password not editable for existing users via this form
      displayName: u.displayName, 
      role: u.role, 
      classId: u.classId || '' 
    });
    setEditingUserId(u.uid);
    setShowAddUserForm(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-0">
      {/* Sub-header for tabs */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between sticky top-0 z-20 gap-4">
        <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 italic">Admin Center</h2>
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl overflow-x-auto w-full sm:w-auto scrollbar-hide">
          {[
            { id: 'overview', name: 'Ringkasan', icon: <BarChart3 className="h-4 w-4" /> },
            { id: 'users', name: 'Siswa', icon: <Users className="h-4 w-4" /> },
            { id: 'categories', name: 'Kategori', icon: <Layers className="h-4 w-4" /> },
            { id: 'materials', name: 'Materi', icon: <BookOpen className="h-4 w-4" /> },
            { id: 'classes', name: 'Kelas', icon: <School className="h-4 w-4" /> },
            { id: 'quizzes', name: 'Simulasi', icon: <HelpCircle className="h-4 w-4" /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === item.id 
                  ? 'bg-indigo-900 text-white shadow-xl shadow-indigo-900/20' 
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-white'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 p-4 sm:p-8 overflow-y-auto scrollbar-hide">
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 italic">Panel Kontrol Utama</h1>
            <div className="grid grid-cols-1 gap-4 sm:gap-8 md:grid-cols-3">
              <div className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-10 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-2xl transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full translate-x-10 -translate-y-10 group-hover:bg-blue-200 transition-colors" />
                <Users className="mb-6 h-10 w-10 sm:h-12 sm:w-12 text-blue-600 relative z-10" />
                <div className="text-4xl sm:text-5xl font-black text-slate-900 relative z-10">{users.length}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 relative z-10 tracking-widest italic">Total Siswa Terdaftar</div>
              </div>
              <div className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-10 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-2xl transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-full translate-x-10 -translate-y-10 group-hover:bg-indigo-200 transition-colors" />
                <BookOpen className="mb-6 h-10 w-10 sm:h-12 sm:w-12 text-indigo-600 relative z-10" />
                <div className="text-4xl sm:text-5xl font-black text-slate-900 relative z-10">{materials.length}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 relative z-10 tracking-widest italic">Modul Materi Terbit</div>
              </div>
              <div className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-10 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-2xl transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/50 rounded-full translate-x-10 -translate-y-10 group-hover:bg-orange-200 transition-colors" />
                <Layers className="mb-6 h-10 w-10 sm:h-12 sm:w-12 text-orange-500 relative z-10" />
                <div className="text-4xl sm:text-5xl font-black text-slate-900 relative z-10">{categories.length}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 relative z-10 tracking-widest italic">Kategori Program Belajar</div>
              </div>
            </div>
            
            <div className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-10 shadow-sm border border-slate-100">
              <h3 className="mb-8 text-sm font-black uppercase tracking-[0.3em] text-slate-900 italic underline decoration-orange-500 underline-offset-8">Aktivitas Terbaru</h3>
              <div className="space-y-6">
                {users.slice(0, 5).map(u => (
                  <div key={u.id} className="flex items-center justify-between border-b border-slate-50 pb-6 last:border-0 last:pb-0 hover:translate-x-1 transition-transform cursor-pointer group">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-[20px] bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 text-lg shadow-inner group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-600 transition-all">
                        {u.displayName?.[0]}
                      </div>
                      <div>
                        <div className="text-base font-black text-slate-900">{u.displayName}</div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{u.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] uppercase font-black tracking-widest text-indigo-500 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
                        {u.role}
                        </span>
                        <ChevronRight className="h-4 w-4 text-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 italic">Basis Data Siswa</h1>
                <button 
                onClick={() => setShowAddUserForm(true)}
                className="flex items-center justify-center gap-3 rounded-[24px] bg-indigo-900 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-900/40 hover:bg-black transition-all active:scale-95"
                >
                <UserPlus className="h-5 w-5 text-orange-500" />
                Tambah User
                </button>
            </div>

            {showAddUserForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
                <motion.form 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onSubmit={handleSaveUser} 
                  className="w-full max-w-lg rounded-[32px] sm:rounded-[48px] bg-white p-8 sm:p-12 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-hide"
                >
                  <button type="button" onClick={() => {
                    setShowAddUserForm(false);
                    setEditingUserId(null);
                    setNewUser({ username: '', password: '', displayName: '', role: 'student', classId: '' });
                  }} className="absolute top-6 sm:top-8 right-6 sm:right-8 text-slate-400 hover:text-red-500 transition-colors">
                    <X className="w-6 h-6 sm:w-8 h-8" />
                  </button>
                  <h3 className="mb-8 sm:mb-10 text-xl sm:text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
                    {editingUserId ? 'Perbarui Data User' : 'Registrasi User Baru'}
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 block">Nama Lengkap</label>
                      <input 
                        type="text" 
                        required
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 outline-none focus:border-indigo-600 font-bold transition-all" 
                        value={newUser.displayName}
                        onChange={e => setNewUser({...newUser, displayName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 block">Username Login</label>
                      <input 
                        type="text" 
                        required
                        disabled={!!editingUserId}
                        className={`w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 outline-none focus:border-indigo-600 font-bold transition-all ${editingUserId ? 'opacity-50 grayscale' : ''}`} 
                        value={newUser.username}
                        onChange={e => setNewUser({...newUser, username: e.target.value})}
                      />
                    </div>
                    {!editingUserId && (
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 block">Password Awal</label>
                        <input 
                          type="password" 
                          required
                          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 outline-none focus:border-indigo-600 font-bold transition-all" 
                          value={newUser.password}
                          onChange={e => setNewUser({...newUser, password: e.target.value})}
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 block">Hak Akses</label>
                            <select 
                                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 outline-none focus:border-indigo-600 font-black transition-all"
                                value={newUser.role}
                                onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                            >
                                <option value="student">STUDENT</option>
                                <option value="teacher">TEACHER</option>
                                <option value="admin">ADMIN</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 block">Pilih Kelas</label>
                            {newUser.role === 'teacher' ? (
                              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 max-h-48 overflow-y-auto scrollbar-hide">
                                {classes.map(c => {
                                  const selectedIds = (newUser.classId || '').split(',').map(id => id.trim()).filter(Boolean);
                                  const isSelected = selectedIds.includes(c.id);
                                  return (
                                    <label key={c.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-transparent hover:border-slate-200'}`}>
                                      <input 
                                        type="checkbox"
                                        className="accent-indigo-600 h-4 w-4"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          let updatedIds;
                                          if (e.target.checked) {
                                            updatedIds = [...selectedIds, c.id];
                                          } else {
                                            updatedIds = selectedIds.filter(id => id !== c.id);
                                          }
                                          setNewUser({...newUser, classId: updatedIds.join(',')});
                                        }}
                                      />
                                      <span className="text-[10px] font-black uppercase tracking-tight text-slate-600">{c.name}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            ) : (
                              <select 
                                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 outline-none focus:border-indigo-600 font-black transition-all"
                                  value={newUser.classId}
                                  onChange={e => setNewUser({...newUser, classId: e.target.value})}
                              >
                                  <option value="">-- TANPA KELAS --</option>
                                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                            )}
                        </div>
                    </div>
                    <button type="submit" className="w-full rounded-3xl bg-indigo-900 py-5 sm:py-6 text-sm sm:text-lg font-black uppercase tracking-widest text-white shadow-2xl shadow-indigo-900/40 hover:bg-black transition-all">
                      {editingUserId ? 'SIMPAN PERUBAHAN' : 'BUAT AKUN SEKARANG'}
                    </button>
                  </div>
                </motion.form>
              </div>
            )}

            <div className="overflow-x-auto rounded-[32px] sm:rounded-[40px] border border-slate-100 bg-white shadow-2xl shadow-slate-100 scrollbar-hide">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Identitas Siswa</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic text-center">Kelas</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic text-center">Hak Akses</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic text-right">Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 italic">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-indigo-50/20 transition-colors group">
                      <td className="px-10 py-6">
                          <div className="font-black text-slate-900 text-sm">{u.displayName}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{u.email}</div>
                      </td>
                      <td className="px-10 py-6 text-center text-[10px]">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 font-black uppercase tracking-widest text-slate-600">
                             {u.classId?.split(',').map((id: string) => classes.find(c => c.id === id.trim())?.name || id).join(', ') || 'N/A'}
                          </span>
                      </td>
                      <td className="px-10 py-6 text-center">
                         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                            {u.role === 'admin' ? <Shield className="w-3 h-3 text-orange-500" /> : <GraduationCap className="w-3 h-3" />}
                            {u.role}
                         </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => startEditUser(u)}
                            className="text-slate-300 hover:text-indigo-600 transition-colors p-3 rounded-2xl hover:bg-indigo-50 active:scale-90"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete('users', u.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors p-3 rounded-2xl hover:bg-red-50 active:scale-90"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 italic">Program Belajar</h1>
              <button 
                onClick={() => setShowAddCategoryForm(true)}
                className="flex items-center justify-center gap-3 rounded-[24px] bg-orange-500 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-orange-900/40 hover:bg-orange-600 transition-all active:scale-95"
              >
                <Plus className="h-5 w-5" />
                Kategori Baru
              </button>
            </div>

            {showAddCategoryForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
                <motion.form 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onSubmit={handleAddCategory} 
                  className="w-full max-w-lg rounded-[32px] sm:rounded-[48px] bg-white p-8 sm:p-12 shadow-2xl relative"
                >
                  <button type="button" onClick={() => {
                    setShowAddCategoryForm(false);
                    setEditingCategoryId(null);
                    setNewCategory({ name: '', description: '' });
                  }} className="absolute top-6 sm:top-8 right-6 sm:right-8 text-slate-400 hover:text-red-500 transition-colors">
                    <X className="w-6 h-6 sm:w-8 h-8" />
                  </button>
                  <h3 className="mb-8 sm:mb-10 text-xl sm:text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
                    {editingCategoryId ? 'Edit Kategori' : 'Konfigurasi Kategori'}
                  </h3>
                  <div className="space-y-8">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3 block">Nama Program / Kategori</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Contoh: Tes Intelegensia Umum"
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 sm:p-5 outline-none focus:border-indigo-600 font-bold transition-all" 
                        value={newCategory.name}
                        onChange={e => setNewCategory({...newCategory, name: e.target.value})}
                      />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3 block">Deskripsi Tujuan</label>
                      <textarea 
                        required
                        rows={4}
                        placeholder="Jelaskan apa yang akan dipelajari siswa di materi ini..."
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 sm:p-5 outline-none focus:border-indigo-600 font-bold italic transition-all" 
                        value={newCategory.description}
                        onChange={e => setNewCategory({...newCategory, description: e.target.value})}
                      />
                    </div>
                    <button type="submit" className="w-full rounded-3xl bg-indigo-900 py-5 sm:py-6 text-sm sm:text-lg font-black uppercase tracking-widest text-white shadow-2xl shadow-indigo-900/40 hover:bg-black transition-all">
                      {editingCategoryId ? 'SIMPAN PERUBAHAN' : 'TERBITKAN KATEGORI'}
                    </button>
                  </div>
                </motion.form>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
              {categories.map(c => (
                <div key={c.id} className="rounded-[32px] sm:rounded-[40px] bg-white p-8 sm:p-10 shadow-sm border border-slate-100 flex items-start justify-between group hover:shadow-2xl transition-all">
                  <div className="flex-1">
                    <div className="mb-6 inline-flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                        <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{c.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-4 leading-relaxed font-bold italic opacity-70 line-clamp-3">{c.description}</p>
                  </div>
                  <div className="flex flex-col gap-3 ml-4 sm:ml-6">
                    <button 
                      onClick={() => startEditCategory(c)}
                      className="p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl text-slate-400 hover:text-indigo-600 transition-colors shadow-inner"
                    >
                      <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete('categories', c.id)}
                      className="p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl text-slate-400 hover:text-red-500 transition-colors shadow-inner"
                    ><Trash2 className="h-4 w-4 sm:h-5 sm:w-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 italic">Pusat Pembelajaran</h1>
              <button 
                onClick={() => setShowAddMaterialForm(true)}
                className="flex items-center justify-center gap-3 rounded-[24px] bg-indigo-900 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-900/40 hover:bg-black transition-all active:scale-95"
              >
                <PlusCircle className="h-5 w-5 text-orange-500" />
                Materi Baru
              </button>
            </div>

            {showAddMaterialForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
                <motion.form 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleAddMaterial} 
                  className="w-full max-w-4xl rounded-[32px] sm:rounded-[48px] bg-white p-8 sm:p-12 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-hide"
                >
                  <div className="flex items-center justify-between mb-8 sm:mb-10">
                     <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
                        {editingMaterialId ? 'Edit Materi' : 'Publikasi Materi'}
                     </h3>
                     <button type="button" onClick={() => {
                        setShowAddMaterialForm(false);
                        setEditingMaterialId(null);
                        setNewMaterial({ title: '', description: '', content: '', categoryId: '', type: 'article', videoUrl: '' });
                     }} className="text-slate-400 hover:text-red-500 transition-colors"><X className="w-6 h-6 sm:w-8 h-8" /></button>
                  </div>
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="space-y-6 sm:space-y-8">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3 block">Judul Konten</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Contoh: Logika Analogi Verbal"
                          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 outline-none focus:border-indigo-600 font-bold transition-all" 
                          value={newMaterial.title}
                          onChange={e => setNewMaterial({...newMaterial, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3 block">Assignment Kategori</label>
                        <select 
                          required
                          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 outline-none focus:border-indigo-600 font-black transition-all cursor-pointer" 
                          value={newMaterial.categoryId}
                          onChange={e => setNewMaterial({...newMaterial, categoryId: e.target.value})}
                        >
                          <option value="">-- PILIH KATEGORI --</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3 block">Ringkasan Meta (SEO)</label>
                        <textarea 
                          required
                          placeholder="Tulis ringkasan eksekutif materi..."
                          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 outline-none focus:border-indigo-600 font-bold italic transition-all" 
                          value={newMaterial.description}
                          onChange={e => setNewMaterial({...newMaterial, description: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3 block">Format Penyampaian</label>
                        <div className="flex gap-4">
                            {['article', 'video'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setNewMaterial({...newMaterial, type})}
                                    className={`flex-1 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 transition-all ${
                                        newMaterial.type === type ? 'bg-indigo-900 border-indigo-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                      </div>
                      {newMaterial.type === 'video' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3 block">YouTube URL / Video ID</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Contoh: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                            className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 outline-none focus:border-indigo-600 font-bold transition-all" 
                            value={newMaterial.videoUrl}
                            onChange={e => setNewMaterial({...newMaterial, videoUrl: e.target.value})}
                          />
                        </motion.div>
                      )}
                    </div>
                    <div className="space-y-8 flex flex-col">
                      <div className="flex-1 flex flex-col">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3 block">Full Material Content (Markdown)</label>
                        <textarea 
                          required
                          className="flex-1 w-full min-h-[300px] rounded-3xl border-2 border-slate-100 bg-slate-50 p-6 font-mono text-xs outline-none focus:border-indigo-600" 
                          placeholder="# Judul\nIsi materi bimbingan belajar..."
                          value={newMaterial.content}
                          onChange={e => setNewMaterial({...newMaterial, content: e.target.value})}
                        />
                      </div>
                      <button type="submit" className="w-full rounded-3xl bg-orange-500 py-6 text-lg font-black uppercase tracking-widest text-white shadow-2xl shadow-orange-900/40 hover:bg-orange-600 transition-all active:scale-95">
                        {editingMaterialId ? 'SIMPAN PERUBAHAN' : 'PUBLIKASIKAN'}
                      </button>
                    </div>
                  </div>
                </motion.form>
              </div>
            )}

            <div className="overflow-x-auto rounded-[32px] sm:rounded-[40px] border border-slate-100 bg-white shadow-2xl shadow-slate-100 scrollbar-hide">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Materi Belajar</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Kategori Induk</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic text-center">Format</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic text-right">Opsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 italic">
                  {materials.map(m => (
                    <tr key={m.id} className="hover:bg-indigo-50/20 transition-colors group">
                      <td className="px-10 py-6 font-black text-slate-900 text-sm">
                          <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 group-hover:scale-150 transition-transform" />
                              {m.title}
                          </div>
                      </td>
                      <td className="px-10 py-6 text-sm text-slate-500 font-bold uppercase tracking-tighter">
                        {categories.find(c => c.id === m.categoryId)?.name || 'UMUM'}
                      </td>
                      <td className="px-10 py-6 text-center">
                        <span className="inline-flex rounded-full bg-indigo-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 border border-indigo-100">
                          {m.type}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right space-x-2">
                        <button 
                          onClick={() => startEditMaterial(m)}
                          className="text-slate-300 hover:text-indigo-600 transition-colors p-2 rounded-xl hover:bg-indigo-50"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                            onClick={() => handleDelete('materials', m.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50"
                        ><Trash2 className="h-5 w-5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'classes' && (
          <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 italic">Manajemen Kelas</h1>
              <button 
                onClick={() => setShowAddClassForm(true)}
                className="flex items-center justify-center gap-3 rounded-[24px] bg-indigo-900 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-900/40 hover:bg-black transition-all active:scale-95"
              >
                <Plus className="h-5 w-5 text-orange-500" />
                Kelas Baru
              </button>
            </div>

            {showAddClassForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
                <motion.form 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onSubmit={handleAddClass} 
                  className="w-full max-w-lg rounded-[32px] sm:rounded-[48px] bg-white p-8 sm:p-12 shadow-2xl relative"
                >
                  <button type="button" onClick={() => {
                    setShowAddClassForm(false);
                    setEditingClassId(null);
                    setNewClass({ name: '', description: '', code: '' });
                  }} className="absolute top-6 sm:top-8 right-6 sm:right-8 text-slate-400 hover:text-red-500 transition-colors">
                    <X className="w-6 h-6 sm:w-8 h-8" />
                  </button>
                  <h3 className="mb-8 sm:mb-10 text-xl sm:text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
                    {editingClassId ? 'Edit Kelas' : 'Konfigurasi Kelas'}
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 block">Nama Kelas</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Contoh: Kedinasan 2024 - A"
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 outline-none focus:border-indigo-600 font-bold transition-all" 
                        value={newClass.name}
                        onChange={e => setNewClass({...newClass, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 block">Kode Kelas</label>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                        <input 
                          type="text" 
                          placeholder="KDNS24A"
                          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-4 pl-12 pr-4 outline-none focus:border-indigo-600 font-black transition-all uppercase" 
                          value={newClass.code}
                          onChange={e => setNewClass({...newClass, code: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 block">Keterangan</label>
                      <textarea 
                        rows={3}
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 outline-none focus:border-indigo-600 font-bold italic transition-all" 
                        value={newClass.description}
                        onChange={e => setNewClass({...newClass, description: e.target.value})}
                      />
                    </div>
                    <button type="submit" className="w-full rounded-3xl bg-indigo-900 py-5 sm:py-6 text-sm sm:text-lg font-black uppercase tracking-widest text-white shadow-2xl shadow-indigo-900/40 hover:bg-black transition-all">
                      {editingClassId ? 'SIMPAN PERUBAHAN' : 'TERBITKAN KELAS'}
                    </button>
                  </div>
                </motion.form>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {classes.map(c => (
                <div key={c.id} className="rounded-[32px] sm:rounded-[40px] bg-white p-8 sm:p-10 shadow-sm border border-slate-100 flex flex-col group hover:shadow-2xl transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                      <School className="h-16 w-16 sm:h-24 sm:w-24" />
                  </div>
                  <div className="mb-6 inline-flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                        <UserCheck className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">{c.name}</h3>
                  <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-indigo-500">{c.code || 'NO CODE'}</div>
                  <p className="mt-4 text-xs text-slate-400 leading-relaxed font-bold italic line-clamp-2">{c.description}</p>
                  
                  <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                      <div className="text-xl sm:text-2xl font-black text-slate-900 italic">
                          {users.filter(u => u.classId === c.id).length} 
                          <span className="text-[10px] uppercase font-black text-slate-300 not-italic tracking-widest ml-2">Peserta</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => startEditClass(c)}
                          className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => handleDelete('classes', c.id)}
                            className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
                        ><Trash2 className="h-4 w-4" /></button>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'quizzes' && (
          <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 italic">Generator Simulasi</h1>
              <button 
                onClick={() => setShowAddQuizForm(true)}
                className="flex items-center gap-3 rounded-[24px] bg-orange-500 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-orange-900/40 hover:bg-orange-600 transition-all active:scale-95"
              >
                <PlusCircle className="h-5 w-5 text-indigo-900" />
                Kuis Baru
              </button>
            </div>

            {showAddQuizForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                <motion.form 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleAddQuiz} 
                  className="w-full max-w-5xl rounded-[48px] bg-white p-12 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-hide"
                >
                  <button type="button" onClick={() => {
                    setShowAddQuizForm(false);
                    setEditingQuizId(null);
                    setNewQuiz({ materialId: '', title: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswerIndex: 0 }] });
                  }} className="absolute top-8 right-8 text-slate-400 hover:text-red-500 transition-colors">
                    <X className="w-8 h-8" />
                  </button>
                  <h3 className="mb-10 text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
                    {editingQuizId ? 'Edit Kuis' : 'Konfigurator Kuis Inteligensi'}
                  </h3>
                  
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 block">Pilih Materi Pendamping</label>
                            <select 
                                required
                                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 outline-none focus:border-indigo-600 font-black transition-all cursor-pointer" 
                                value={newQuiz.materialId}
                                onChange={e => setNewQuiz({...newQuiz, materialId: e.target.value})}
                            >
                                <option value="">-- PILIH MATERI --</option>
                                {materials.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 block">Judul Kuis</label>
                            <input 
                                type="text" 
                                required
                                placeholder="Contoh: Pemantapan Analogi"
                                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 outline-none focus:border-indigo-600 font-bold transition-all" 
                                value={newQuiz.title}
                                onChange={e => setNewQuiz({...newQuiz, title: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-10">
                        {newQuiz.questions.map((q, qIdx) => (
                            <div key={qIdx} className="rounded-[32px] border-4 border-slate-50 p-8 relative bg-slate-50/30">
                                <span className="absolute -top-4 -left-4 bg-indigo-900 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black italic shadow-lg">#{qIdx + 1}</span>
                                <div className="space-y-6">
                                    <input 
                                        type="text"
                                        placeholder="Tulis pertanyaan di sini..."
                                        className="w-full bg-transparent border-b-2 border-slate-200 p-2 text-xl font-black italic outline-none focus:border-orange-500 transition-all"
                                        value={q.question}
                                        onChange={e => {
                                            const updated = [...newQuiz.questions];
                                            updated[qIdx] = { ...updated[qIdx], question: e.target.value };
                                            setNewQuiz({...newQuiz, questions: updated});
                                        }}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-3 relative group/opt">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = [...newQuiz.questions];
                                                        updated[qIdx] = { ...updated[qIdx], correctAnswerIndex: oIdx };
                                                        setNewQuiz({...newQuiz, questions: updated});
                                                    }}
                                                    className={`h-10 w-10 rounded-xl flex items-center justify-center font-black transition-all shrink-0 ${
                                                        q.correctAnswerIndex === oIdx ? 'bg-orange-500 text-white' : 'bg-white text-slate-300 border-2 border-slate-100'
                                                    }`}
                                                >
                                                    {String.fromCharCode(65 + oIdx)}
                                                </button>
                                                <input 
                                                    type="text"
                                                    placeholder={`Opsi ${String.fromCharCode(65 + oIdx)}`}
                                                    className="flex-1 bg-white border-2 border-slate-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-indigo-600"
                                                    value={opt}
                                                    onChange={e => {
                                                        const updated = [...newQuiz.questions];
                                                        const options = [...updated[qIdx].options];
                                                        options[oIdx] = e.target.value;
                                                        updated[qIdx] = { ...updated[qIdx], options };
                                                        setNewQuiz({...newQuiz, questions: updated});
                                                    }}
                                                />
                                                {q.options.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updated = [...newQuiz.questions];
                                                            const options = updated[qIdx].options.filter((_, i) => i !== oIdx);
                                                            let newCorrectIndex = updated[qIdx].correctAnswerIndex;
                                                            if (newCorrectIndex === oIdx) newCorrectIndex = 0;
                                                            else if (newCorrectIndex > oIdx) newCorrectIndex--;
                                                            
                                                            updated[qIdx] = { ...updated[qIdx], options, correctAnswerIndex: newCorrectIndex };
                                                            setNewQuiz({...newQuiz, questions: updated});
                                                        }}
                                                        className="absolute -right-2 -top-2 bg-white text-red-400 opacity-0 group-hover/opt:opacity-100 transition-opacity p-1 rounded-full shadow-md border border-slate-100 hover:text-red-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {q.options.length < 6 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = [...newQuiz.questions];
                                                    const options = [...updated[qIdx].options, ''];
                                                    updated[qIdx] = { ...updated[qIdx], options };
                                                    setNewQuiz({...newQuiz, questions: updated});
                                                }}
                                                className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-indigo-200 hover:text-indigo-400 transition-all"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Tambah Opsi
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const updated = newQuiz.questions.filter((_, i) => i !== qIdx);
                                        setNewQuiz({...newQuiz, questions: updated});
                                    }}
                                    className="absolute -top-4 -right-4 bg-white text-red-400 hover:text-red-600 p-2 rounded-xl shadow-lg transition-colors border border-slate-100"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <button 
                            type="button"
                            onClick={() => setNewQuiz({
                                ...newQuiz,
                                questions: [...newQuiz.questions, { question: '', options: ['', '', '', ''], correctAnswerIndex: 0 }]
                            })}
                            className="flex-1 py-6 rounded-3xl border-4 border-dashed border-slate-100 text-slate-400 font-black uppercase tracking-widest text-xs hover:border-indigo-200 hover:text-indigo-400 transition-all"
                        >
                            + TAMBAH PERTANYAAN
                        </button>
                        <button type="submit" className="flex-1 rounded-3xl bg-indigo-900 py-6 text-lg font-black uppercase tracking-widest text-white shadow-2xl shadow-indigo-900/40 hover:bg-black transition-all">
                            {editingQuizId ? 'SIMPAN PERUBAHAN' : 'TERBITKAN SIMULASI'}
                        </button>
                    </div>
                  </div>
                </motion.form>
              </div>
            )}

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {quizzes.map(q => (
                <div key={q.id} className="rounded-[40px] bg-white p-10 shadow-sm border border-slate-100 flex flex-col group hover:shadow-2xl transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                      <HelpCircle className="h-24 w-24" />
                  </div>
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner">
                        <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">{q.title}</h3>
                  <div className="mt-4 flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Materi:</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                          {materials.find(m => m.id === q.materialId)?.title || 'Umum'}
                      </span>
                  </div>
                  <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                      <div className="text-2xl font-black text-slate-900 italic">{q.questions?.length || 0} <span className="text-[10px] uppercase font-black text-slate-300 not-italic tracking-widest">Soal</span></div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => startEditQuiz(q)}
                          className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => handleDelete('quizzes', q.id)}
                            className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
                        ><Trash2 className="h-4 w-4" /></button>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
