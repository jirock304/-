import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { LogIn, Github, Mail, ArrowRight, ShieldCheck, School } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const isAdmin = user.email === 'jirock304@gmail.com';
        // Create profile
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0],
          isAdmin, // Bootstrapped admin
          createdAt: serverTimestamp()
        });
        toast.success(isAdmin ? 'Welcome, Admin!' : 'Welcome to 요고어때!');
      } else {
        toast.info(`Welcome back, ${user.displayName}!`);
      }

      navigate('/');
    } catch (error: any) {
      console.error(error);
      toast.error('로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-dark relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-dark/5 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-md rounded-[3rem] p-10 md:p-14 relative z-10 border-white/5 shadow-2xl space-y-10"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-accent rounded-3xl mx-auto flex items-center justify-center shadow-glow mb-6 rotate-3">
             <School size={32} className="text-bg-dark fill-bg-dark" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter italic text-white">YOGO</h1>
          <p className="text-white/40 text-sm font-medium">요즘 고등학생들의 모든 소식, <br/>요고어때에서 확인하세요.</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 bg-white text-bg-dark p-4 rounded-2xl font-bold hover:bg-white/90 transition-all group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-bg-dark border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Mail size={20} />
                <span>Continue with Google</span>
                <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          <button 
            disabled
            className="w-full flex items-center justify-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-white/20 cursor-not-allowed"
          >
            <Github size={20} />
            <span>Coming Soon</span>
          </button>
        </div>

        <div className="pt-8 border-t border-white/5">
           <div className="flex items-center gap-3 text-white/20 justify-center">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Secured by Firebase</span>
           </div>
        </div>

        {/* Home Link */}
        <div className="text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-[10px] font-black uppercase text-accent/40 hover:text-accent tracking-[0.3em] transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
