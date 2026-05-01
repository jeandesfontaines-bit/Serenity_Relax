'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, User as UserIcon, ShieldCheck, Sparkles } from 'lucide-react';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';

export function Navbar({ onBookingClick }: { onBookingClick?: () => void }) {
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
        if (snap.exists()) {
          setClientName(snap.data().firstName);
        }
      });
    }
  }, [firestore]);

  if (!mounted) return null;

  const handleSignOut = async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
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

  const mainLinks = [
    { label: 'STUDIO', href: '/#hero' },
    { label: 'TREATMENTS', href: '/#services' },
    { label: 'PHILOSOPHY', href: '/#about' },
    { label: 'FAQ', href: '/#faq' },
  ];

  if (isLoginPage) return null;

  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-[#faf9f7]/70 backdrop-blur-xl border-b border-[#efeeec]">
      <div className="flex justify-between items-center w-full px-8 md:px-16 py-8 max-w-[1440px] mx-auto">
        <Link href="/" className="flex items-baseline gap-2 group">
          <span className="font-sans font-medium text-[16px] md:text-[20px] tracking-[0.3em] text-[#1a1c1b] whitespace-nowrap uppercase">
            SERENITY RELAX THERAPY
          </span>
          <span className="font-cursive text-[22px] md:text-[28px] text-[#5a6366] whitespace-nowrap lowercase" style={{ fontFamily: 'var(--font-signature)' }}>
            by João
          </span>
        </Link>
        
        <nav className="hidden lg:flex items-center space-x-16">
          {isTherapistArea ? (
            adminLinks.map((link) => (
                <Link 
                  key={link.id} 
                  href={link.href} 
                  className={`font-serif uppercase tracking-[0.4em] text-[10px] transition-all duration-700 ${pathname === link.href ? 'text-[#1a1c1b] italic font-medium' : 'text-[#c3c8c0] hover:text-[#1a1c1b]'}`}
                >
                  {link.label}
                </Link>
              ))
            ) : (
              mainLinks.map((link) => (
                <Link 
                  key={link.label} 
                  href={link.href} 
                  className="font-serif uppercase tracking-[0.4em] text-[10px] text-[#c3c8c0] hover:text-[#1a1c1b] transition-all duration-700"
                >
                  {link.label}
                </Link>
              ))
            )}
        </nav>

        <div className="flex items-center gap-12">
          {effectiveUser ? (
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end justify-center">
                 <span className="font-serif uppercase tracking-[0.3em] text-[8px] text-[#1a1c1b] leading-none mb-1">{effectiveUser.name}</span>
                 <button onClick={handleSignOut} className="font-serif uppercase tracking-[0.3em] text-[8px] text-[#c3c8c0] hover:text-[#1a1c1b] transition-colors leading-none">Sortie</button>
              </div>
              <div className="w-10 h-10 border border-[#efeeec] flex items-center justify-center bg-white text-[#1a1c1b] overflow-hidden group hover:border-[#435544] transition-colors duration-700">
                {effectiveUser.photo ? (
                  <img src={effectiveUser.photo} alt="" className="w-full h-full object-cover transition-all" />
                ) : (
                  <UserIcon size={14} strokeWidth={1} />
                )}
              </div>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="font-serif uppercase tracking-[0.4em] text-[10px] text-[#c3c8c0] hover:text-[#1a1c1b] transition-all duration-700"
            >
              ACCÈS
            </Link>
          )}

          <button 
            onClick={onBookingClick}
            className="font-serif uppercase tracking-[0.5em] text-[10px] px-8 py-4 bg-[#1a1c1b] text-white hover:bg-[#435544] transition-all duration-1000 hidden sm:block shadow-2xl shadow-[#1a1c1b]/10"
          >
            SÉANCE
          </button>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden text-[#1a1c1b] p-2 hover:bg-[#faf9f7] transition-colors">
            {isMenuOpen ? <X size={20} strokeWidth={1} /> : <Menu size={20} strokeWidth={1} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-[#efeeec] overflow-hidden"
          >
            <div className="flex flex-col p-8 gap-6 text-center">
              {(isTherapistArea ? adminLinks : mainLinks).map((link) => (
                <Link key={link.label} href={link.href} onClick={() => setIsMenuOpen(false)} className="font-serif uppercase tracking-[0.4em] text-[10px] text-[#1a1c1b]">
                  {link.label}
                </Link>
              ))}
              {!effectiveUser && (
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="font-serif uppercase tracking-[0.4em] text-[10px] text-[#1a1c1b] pt-4 border-t border-[#efeeec]">
                  LOGIN
                </Link>
              )}
              <button 
                onClick={() => { setIsMenuOpen(false); onBookingClick?.(); }} 
                className="font-serif uppercase tracking-[0.4em] text-[10px] px-6 py-4 bg-[#1a1c1b] text-white"
              >
                Réserver
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
