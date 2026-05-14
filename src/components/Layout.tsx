import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  Book, 
  Search, 
  User, 
  LayoutDashboard, 
  LogOut,
  Menu,
  X,
  Bookmark,
  School
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../types';
import { auth } from '../lib/firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
}

export default function Layout({ user, userProfile }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Trends', path: '/category/trend', icon: TrendingUp },
    { name: 'School Life', path: '/category/school-life', icon: Book },
    { name: 'Scraps', path: '/scraps', icon: Bookmark },
  ];

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-bg-dark text-[#e0e0e0] overflow-hidden selection:bg-accent selection:text-bg-dark">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_30%,#1a2e1a_0%,transparent_50%),radial-gradient(circle_at_80%_70%,#1a1a2e_0%,transparent_50%)] opacity-40 pointer-events-none"></div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 glass border-r border-white/5 flex-col py-8 z-20 shrink-0">
        <div className="px-8 mb-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(204,255,0,0.4)]">
            <School size={28} className="text-bg-dark fill-bg-dark" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter leading-none italic">YOGO</h1>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">요고어때 Project</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group",
                isActive(item.path) 
                  ? "bg-white/10 text-white font-bold" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={22} className={cn(isActive(item.path) ? "text-white" : "group-hover:text-white")} />
              <span className="text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="px-4 mt-auto space-y-1">
          {userProfile?.isAdmin && (
            <Link
              to="/admin"
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                isActive('/admin') ? "bg-accent/10 text-accent font-bold" : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <LayoutDashboard size={22} />
              <span className="text-sm">Manager</span>
            </Link>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all"
            >
              <LogOut size={22} />
              <span className="text-sm">Logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              <User size={22} />
              <span className="text-sm">Login</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Header */}
        <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-6 md:px-10 z-10 shrink-0">
          <div className="flex items-center gap-3 md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-white/5 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <School size={20} className="text-accent fill-accent" />
              <h1 className="text-lg font-black tracking-tighter italic">YOGO</h1>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-4 hidden sm:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="검색어를 입력하세요" 
                className="w-full bg-[#111111] border border-white/5 rounded-full py-2.5 pl-12 pr-4 outline-none focus:border-accent/40 focus:bg-white/5 transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
             {user && (
               <div className="hidden md:flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                 <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-black text-bg-dark">{user.email?.[0].toUpperCase()}</span>
                 </div>
                 <span className="text-xs font-medium text-white/60">{userProfile?.displayName || user.email?.split('@')[0]}</span>
               </div>
             )}
             <Link to="/search" className="sm:hidden p-2 hover:bg-white/5 rounded-full"><Search size={20}/></Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="p-6 md:p-10 max-w-7xl mx-auto w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
          
          {/* Footer */}
          <footer className="px-10 py-12 border-t border-white/5 bg-black/20 mt-10">
            <div className="flex flex-col md:flex-row justify-between gap-8 text-[10px] text-white/40 uppercase tracking-[0.2em] font-semibold">
              <div>© 2026 YOGO PROJECT | ALL STUDENTS CONNECTED</div>
              <div className="flex flex-wrap gap-6">
                <span className="hover:text-accent cursor-pointer transition-colors">Privacy Policy</span>
                <span className="hover:text-accent cursor-pointer transition-colors">Terms of Service</span>
                <span className="hover:text-accent cursor-pointer transition-colors">Contact Manager</span>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-bg-dark border-r border-white/5 z-50 p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                    <School size={18} className="text-bg-dark fill-bg-dark" />
                  </div>
                  <h1 className="text-lg font-black tracking-tighter italic">YOGO</h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2"><X size={20}/></button>
              </div>

              <nav className="space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 text-lg",
                      isActive(item.path) ? "text-accent font-bold" : "text-white/40"
                    )}
                  >
                    <item.icon size={22} />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>

              <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
                {userProfile?.isAdmin && (
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-white/40"><LayoutDashboard size={22} /> Manager</Link>
                )}
                {user ? (
                  <button onClick={handleLogout} className="flex items-center gap-4 text-red-400/60"><LogOut size={22} /> Logout</button>
                ) : (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-accent font-bold"><User size={22} /> Login</Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
