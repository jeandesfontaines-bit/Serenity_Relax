'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Menu, X, LogOut, User } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSignOut = () => {
    signOut(auth);
    setIsMenuOpen(false);
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-[100] px-6 py-6 bg-transparent">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-baseline gap-2 cursor-pointer group">
          <span className="font-sans font-bold text-sm md:text-base tracking-[0.2em] text-primary uppercase">SERENITY RELAX</span>
          <span className="font-cursive text-[22px] text-muted-foreground tracking-normal whitespace-nowrap normal-case group-hover:text-primary transition-colors">by João</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/client/portal" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Espace Client</Link>
          <Link href="/therapist/dashboard" className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest text-primary shadow-sm hover:shadow-md transition-all border border-black/5">
            <LayoutDashboard size={12} /> Admin
          </Link>
          {user && !user.isAnonymous && (
            <button onClick={handleSignOut} className="text-muted-foreground hover:text-destructive transition-colors">
              <LogOut size={16}/>
            </button>
          )}
        </div>
        
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-primary">
          {isMenuOpen ? <X size={20}/> : <Menu size={20}/>}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-black/5 p-8 flex flex-col gap-6 md:hidden"
          >
            <Link href="/client/portal" onClick={() => setIsMenuOpen(false)} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Espace Client</Link>
            <Link href="/therapist/dashboard" onClick={() => setIsMenuOpen(false)} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Admin</Link>
            {user && !user.isAnonymous && (
              <button onClick={handleSignOut} className="text-left text-[10px] font-bold uppercase tracking-widest text-destructive">Déconnexion</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
