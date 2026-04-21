'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, User as UserIcon, ShieldCheck, Sparkles } from 'lucide-react';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';

interface NavbarProps {
  onBookingClick?: () => void;
}

export function Navbar({ onBookingClick }: NavbarProps) {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [clientName, setClientName] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const storedId = sessionStorage.getItem('serenity_client_id');

    if (storedId && firestore) {
      getDoc(doc(firestore, 'clients', storedId)).then(snap => {
        if (snap.exists()) {
          setClientName(snap.data().firstName);
        }
      });
    }
  }, [firestore]);

  if (!mounted) return null;

  const handleSignOut = async () => {
    try {
      if (auth.currentUser) await signOut(auth);
      sessionStorage.removeItem('serenity_client_id');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isTherapistArea = pathname?.startsWith('/therapist');
  const isLoginPage = pathname === '/login';
  const isTherapist = user && user.email === 'jean.desfontaines@gmail.com';
  const effectiveUser = user && !user.isAnonymous ? { name: user.displayName?.split(' ')[0] || 'Profil' } : clientName ? { name: clientName } : null;

  const adminLinks = [
    { id: "dashboard", label: "Accueil", href: "/therapist/dashboard" },
    { id: "clients", label: "Clients", href: "/therapist/clients" },
  ];

  if (isLoginPage) return null;

  return (
    <div className="absolute top-10 left-0 right-0 z-50 px-6">
      <nav className="max-w-6xl mx-auto bg-white/80 backdrop-blur-3xl border border-white/40 shadow-2xl shadow-onyx/5 rounded-full px-8 py-3 transform transition-all hover:scale-[1.01]">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex flex-col items-start leading-none group">
            <span className="font-serif text-h4 text-onyx tracking-tighter">Serenity Relax</span>
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.4em] text-onyx/40">Therapy Genève</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-10">
            {isTherapistArea ? (
              adminLinks.map((link) => (
                <Link 
                  key={link.id} 
                  href={link.href} 
                  className={`font-heading text-[10px] font-black uppercase tracking-widest transition-colors ${pathname === link.href ? 'text-fresh-green' : 'text-onyx/60 hover:text-onyx'}`}
                >
                  {link.label}
                </Link>
              ))
            ) : (
              <div className="flex items-center gap-10">
                <Link href="#services" className="font-heading text-[10px] font-black uppercase tracking-widest text-onyx/40 hover:text-onyx transition-all">Les Soins</Link>
                {isTherapist && <Link href="/therapist/dashboard" className="font-heading text-[10px] font-black uppercase tracking-widest text-fresh-green">Admin</Link>}
                
                <button 
                  onClick={onBookingClick}
                  className="h-10 px-8 bg-ochre text-white font-heading text-[10px] font-black uppercase tracking-widest rounded-full transition-all hover:shadow-xl hover:shadow-ochre/20"
                >
                  Réserver
                </button>
              </div>
            )}

            {effectiveUser && (
              <div className="h-4 w-[1px] bg-border" />
            )}

            {effectiveUser ? (
              <div className="flex items-center gap-4">
                <span className="font-heading text-[10px] font-black uppercase tracking-widest text-onyx">{effectiveUser.name}</span>
                <button onClick={handleSignOut} className="p-2 text-onyx/30 hover:text-danger-foreground transition-all"><LogOut size={14} /></button>
              </div>
            ) : (
               <Link href="/login" className="p-2 text-onyx/20 hover:text-onyx transition-all"><UserIcon size={16} /></Link>
            )}
          </div>
          
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-onyx p-1"><Menu size={20}/></button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-3xl shadow-2xl rounded-[3rem] border border-white/40 p-10 flex flex-col gap-6 md:hidden text-center overflow-hidden"
            >
              <Link href="#services" onClick={() => setIsMenuOpen(false)} className="font-serif text-h3 text-onyx">Les Soins Signatures</Link>
              <button 
                onClick={() => { setIsMenuOpen(false); onBookingClick?.(); }} 
                className="h-14 bg-onyx text-sandstone font-heading text-[11px] font-black uppercase tracking-widest rounded-full"
              >
                Prendre rendez-vous
              </button>
              {effectiveUser ? (
                <button onClick={handleSignOut} className="font-heading text-[9px] font-black uppercase tracking-[0.3em] text-onyx/30">Déconnexion</button>
              ) : (
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="font-heading text-[9px] font-black uppercase tracking-[0.3em] text-onyx/30">Accès Client</Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}
