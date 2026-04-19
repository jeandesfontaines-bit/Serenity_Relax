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
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sessionClientId, setSessionClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const storedId = sessionStorage.getItem('serenity_client_id');
    setSessionClientId(storedId);

    if (storedId && firestore) {
      getDoc(doc(firestore, 'clients', storedId)).then(snap => {
        if (snap.exists()) setClientName(snap.data().firstName);
      });
    }
  }, [firestore]);

  if (!mounted) return null;

  const handleSignOut = async () => {
    try {
      if (auth?.currentUser) await signOut(auth);
      sessionStorage.removeItem('serenity_client_id');
      setSessionClientId(null);
      setClientName(null);
      setIsMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isTherapistArea = pathname?.startsWith('/therapist');
  const isLoginPage = pathname === '/login';
  const isTherapist = user && user.email === 'jean.desfontaines@gmail.com';
  
  const effectiveUser = user && !user.isAnonymous ? {
    name: user.displayName?.split(' ')[0] || 'Profil',
    photo: user.photoURL,
    type: isTherapist ? 'therapist' : 'client'
  } : sessionClientId ? {
    name: clientName || 'Client',
    photo: null,
    type: 'client'
  } : null;

  const adminLinks = [
    { id: "dashboard", label: "Accueil", href: "/therapist/dashboard" },
    { id: "clients", label: "Clients", href: "/therapist/clients" },
    { id: "invoices", label: "Factures", href: "/therapist/invoices" },
  ];

  if (isLoginPage) return null;

  return (
    <>
      <div className="sticky top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1.5 hover:opacity-80 transition-opacity">
            <span className="font-sans font-black tracking-[0.15em] text-[#222F3E] text-base">SERENITY</span>
            <span className="font-cursive text-xl text-[#5F27CD]">Relax</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {isTherapistArea ? (
              adminLinks.map((link) => (
                <Link 
                  key={link.id} 
                  href={link.href} 
                  className={`text-[0.65rem] font-sans font-black uppercase tracking-widest transition-colors ${pathname === link.href ? 'text-[#5F27CD]' : 'text-[#576574] hover:text-[#222F3E]'}`}
                >
                  {link.label}
                </Link>
              ))
            ) : (
              <>
                {isTherapist && (
                  <Link href="/therapist/dashboard" className="text-[0.65rem] font-sans font-black uppercase tracking-widest text-[#5F27CD] flex items-center gap-1.5">
                    <ShieldCheck size={14} /> Dashboard
                  </Link>
                )}
                {!isTherapist && effectiveUser && (
                  <Link href="/client/portal" className="text-[0.65rem] font-sans font-black uppercase tracking-widest text-[#222F3E] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#FECA57]" /> Mon Sanctuaire
                  </Link>
                )}
                <button
                  onClick={onBookingClick}
                  className="px-5 py-2 rounded-lg font-black uppercase text-[0.65rem] tracking-widest bg-gradient-to-r from-[#5F27CD] to-[#0ABDE3] text-white shadow-sm hover:brightness-110 active:scale-95 transition-all"
                >
                  Réserver
                </button>
              </>
            )}

            {effectiveUser ? (
              <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                <div className="text-right">
                  <p className="text-[0.55rem] font-black uppercase tracking-widest text-[#222F3E]">{effectiveUser.name}</p>
                  <button onClick={handleSignOut} className="text-[0.5rem] font-bold uppercase text-[#FF6B6B] hover:underline">Déconnexion</button>
                </div>
                {effectiveUser.photo ? (
                  <img src={effectiveUser.photo} alt="" className="w-8 h-8 rounded-lg object-cover border border-white shadow-sm" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-[#F8F5F0] text-[#5F27CD] flex items-center justify-center border border-gray-100">
                    <UserIcon size={14} />
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="text-[0.65rem] font-sans font-black uppercase tracking-widest text-[#222F3E] hover:text-[#5F27CD]">Connexion</Link>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors"
          >
            <motion.div animate={{ rotate: isMenuOpen ? 180 : 0 }}>
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.div>
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xl z-[999] md:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-white rounded-b-[2rem] px-6 pt-24 pb-10 flex flex-col gap-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-4 text-xl font-black uppercase tracking-tighter">
                <Link href="/" onClick={() => setIsMenuOpen(false)}>Accueil</Link>
                {!isTherapistArea && (
                  <button onClick={() => { onBookingClick?.(); setIsMenuOpen(false); }} className="text-left">Réserver</button>
                )}
                {isTherapist && (
                  <Link href="/therapist/dashboard" onClick={() => setIsMenuOpen(false)} className="text-[#5F27CD]">Dashboard</Link>
                )}
              </div>

              <div className="pt-6 border-t border-gray-100">
                {effectiveUser ? (
                  <div className="flex items-center justify-between">
                    <span className="font-black uppercase tracking-widest text-sm">{effectiveUser.name}</span>
                    <button onClick={handleSignOut} className="font-bold uppercase text-[#FF6B6B] text-xs">Déconnexion</button>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-lg font-black uppercase tracking-tighter">Connexion</Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
