
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, LayoutGrid, Users, Wallet, User, Calendar } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
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

  const isTherapistArea = pathname?.startsWith('/therapist');

  const adminLinks = [
    { id: "dashboard", label: "Accueil", icon: LayoutGrid, href: "/therapist/dashboard" },
    { id: "clients", label: "Clients", icon: Users, href: "/therapist/clients" },
    { id: "invoices", label: "Factures", icon: Wallet, href: "/therapist/invoices" },
  ];

  const publicLinks = [
    { label: "Connexion", href: "/client/portal", icon: User },
    { label: "Réserver", href: "/booking", icon: Calendar },
  ];

  return (
    <nav className="absolute top-0 left-0 right-0 z-[100] px-6 py-4 md:py-6 bg-transparent">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-baseline gap-1 md:gap-2 cursor-pointer group">
          <span className="font-sans font-bold text-xs md:text-base lg:text-lg tracking-[0.3em] text-neutral-900 uppercase transition-all duration-500">SERENITY RELAX</span>
          <span className="font-cursive text-[10px] md:text-xs lg:text-sm text-white bg-neutral-900 px-2 py-0.5 rounded-full tracking-normal whitespace-nowrap normal-case transition-colors ml-1">by João</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-10">
          {isTherapistArea ? (
            <>
              {adminLinks.map((link) => (
                <Link 
                  key={link.id} 
                  href={link.href} 
                  className={`flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-widest transition-colors ${pathname === link.href ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-900'}`}
                >
                  <link.icon size={12} /> {link.label}
                </Link>
              ))}
            </>
          ) : (
            <>
              {publicLinks.map((link) => (
                <Link 
                  key={link.label} 
                  href={link.href} 
                  className="flex items-center gap-3 text-[10px] font-sans font-black uppercase tracking-[0.3em] text-neutral-900 hover:opacity-60 transition-all"
                >
                  <link.icon size={14} strokeWidth={2.5} />
                  {link.label}
                </Link>
              ))}
            </>
          )}

          {user && !user.isAnonymous && (
            <button onClick={handleSignOut} className="text-neutral-300 hover:text-rose-500 transition-colors ml-4">
              <LogOut size={16}/>
            </button>
          )}
        </div>
        
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-neutral-900 p-1">
          {isMenuOpen ? <X size={20}/> : <Menu size={20}/>}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-neutral-50 p-8 flex flex-col gap-8 md:hidden text-center"
          >
            {isTherapistArea ? (
              adminLinks.map((link) => (
                <Link key={link.id} href={link.href} onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-3 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-900">
                  <link.icon size={14} /> {link.label}
                </Link>
              ))
            ) : (
              publicLinks.map((link) => (
                <Link key={link.label} href={link.href} onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-4 text-[11px] font-sans font-black uppercase tracking-[0.3em] text-neutral-900">
                  <link.icon size={16} strokeWidth={2.5} />
                  {link.label}
                </Link>
              ))
            )}
            
            {user && !user.isAnonymous && (
              <button onClick={handleSignOut} className="text-center text-[10px] font-sans font-bold uppercase tracking-widest text-rose-500 pt-4 border-t border-neutral-50">Déconnexion</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
