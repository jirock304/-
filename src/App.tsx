import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from './types';

// Pages
import Home from './pages/Home';
import NewsDetail from './pages/NewsDetail';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import ScrapsPage from './pages/ScrapsPage';
import LoginPage from './pages/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminEditor from './pages/Admin/Editor';

// Components
import Layout from './components/Layout';

import { School } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            setUserProfile(null);
          }
        } catch (e) {
          console.error("Error fetching profile", e);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-bg-dark space-y-6">
        <div className="relative">
          <div className="w-20 h-20 bg-accent rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(204,255,0,0.2)] animate-pulse">
            <School size={40} className="text-bg-dark fill-bg-dark" />
          </div>
          <div className="absolute inset-0 border-2 border-accent border-t-transparent rounded-[2rem] animate-spin"></div>
        </div>
        <div className="flex flex-col items-center gap-2">
           <h1 className="text-2xl font-black italic tracking-tighter text-white">YOGO</h1>
           <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"></span>
           </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors theme="dark" />
      <Routes>
        <Route element={<Layout user={user} userProfile={userProfile} />}>
          <Route path="/" element={<Home />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/scraps" element={<ScrapsPage user={user} />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            userProfile?.isAdmin ? <AdminDashboard /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/admin/editor" 
          element={
            userProfile?.isAdmin ? <AdminEditor /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/admin/editor/:id" 
          element={
            userProfile?.isAdmin ? <AdminEditor /> : <Navigate to="/login" />
          } 
        />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
