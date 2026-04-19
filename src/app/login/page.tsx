'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { LogIn, User, Lock, Chrome, ArrowRight, Loader2, Mail, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'auth'>('email');
  const [isTherapist, setIsTherapist] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  useEffect(() => {
    if (user && !isUserLoading) {
      if (user.email === 'jean.desfontaines@gmail.com') {
        router.push('/therapist/dashboard');
      } else {
        router.push('/client/dashboard');
      }
    }
  }, [user, isUserLoading, router]);

  const handleIdentifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);
    try {
      if (email.toLowerCase() === 'jean.desfontaines@gmail.com') {
        setIsTherapist(true);
        setStep('auth');
      } else {
        if (firestore) {
          const q = query(collection(firestore, 'clients'), where('email', '==', email.toLowerCase()));
          const snap = await getDocs(q);
          if (!snap.empty) {
            setIsTherapist(false);
            setStep('auth');
          } else {
            setError("Email non reconnu. Rejoignez le sanctuaire en réservant votre premier soin.");
          }
        }
      }
    } catch (err) {
      setError("Une erreur de connexion est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (auth) await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError('Identifiants incorrects.');
      setIsLoading(false);
    }
  };

  const handleSendMagicLink = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'MAGIC_LINK', email: email.toLowerCase() })
      });
      if (response.ok) setMagicLinkSent(true);
    } catch (err) {
      setError("Échec de l'envoi du lien.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (auth) {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      }
    } catch (err: any) {
      setError("Échec de la connexion Google.");
      setIsLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F5F0]">
         <div className="w-16 h-16 border-4 border-[#5F27CD]/20 border-t-[#5F27CD] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#F8F5F0]">
      {/* ── BACKGROUND SENSORIEL RESPIRANT ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#5F27CD_0%,transparent_50%)]" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#0ABDE3_0%,transparent_50%)]" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <h1 className="text-2xl font-black tracking-[0.25em] text-[#222F3E] uppercase group-hover:scale-105 transition-transform duration-500">SERENITY</h1>
            <p className="text-[0.55rem] font-black uppercase tracking-[0.4em] text-[#1DD1A1] mt-1">Le Sanctuaire</p>
          </Link>
        </div>

        <div className="glass p-8 rounded-xl shadow-xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3 text-red-500"
              >
                <AlertCircle size={16} className="shrink-0" />
                <p className="text-xs  text-red-600">{error}</p>
              </motion.div>
            )}

            {magicLinkSent ? (
              <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4 space-y-5">
                <div className="w-16 h-16 bg-gradient-to-br from-[#5F27CD] to-[#0ABDE3] rounded-xl flex items-center justify-center mx-auto shadow-lg">
                  <Mail className="text-white w-7 h-7" />
                </div>
                <div>
                   <h2 className="text-xl font-medium text-[#222F3E]">Rituel envoyé</h2>
                   <p className="text-xs text-gray-500  mt-1">Vérifiez vos emails pour entrer dans le sanctuaire.</p>
                </div>
                <button onClick={() => setMagicLinkSent(false)} className="text-[0.55rem] font-black text-[#5F27CD] uppercase tracking-widest hover:underline">Renvoyer le lien</button>
              </motion.div>
            ) : step === 'email' ? (
              <motion.form key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleIdentifyEmail} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[0.55rem] font-black uppercase tracking-widest text-[#5F27CD] ml-1">Adhésion & Identité</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-[#5F27CD] transition-colors" size={16} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="w-full h-11 bg-white/60 border border-gray-100 rounded-xl pl-11 pr-4 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-indigo-50 transition-all"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="btn-luxe w-full py-3 text-sm flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : (
                    <>Accéder au Portail <ArrowRight size={14} /></>
                  )}
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                  <div className="relative flex justify-center text-[0.5rem] uppercase tracking-widest"><span className="bg-[#F8F5F0] px-3 text-gray-400">Ou</span></div>
                </div>

                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-3 border border-gray-200 rounded-xl flex items-center justify-center gap-3 text-xs font-bold text-[#222F3E] bg-white hover:bg-gray-50 transition-all shadow-sm"
                >
                  <Chrome size={16} className="text-[#4285F4]" />
                  Continuer avec Google
                </button>
              </motion.form>
            ) : (
              <motion.div key="a" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-gray-100">
                  <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center text-[#5F27CD]">
                    <User size={16} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[0.5rem] font-black text-gray-400 uppercase tracking-widest">Ami identifié</p>
                    <p className="text-sm font-serif font-medium text-[#222F3E] truncate">{email}</p>
                  </div>
                  <button onClick={() => setStep('email')} className="text-gray-300 hover:text-[#5F27CD]">
                    <ArrowRight size={14} className="rotate-180" />
                  </button>
                </div>

                {isTherapist ? (
                  <form onSubmit={handleEmailLogin} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[0.55rem] font-black uppercase tracking-widest text-[#5F27CD] ml-1">Clé Privée</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 transition-colors" size={16} />
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-11 bg-white/60 border border-gray-100 rounded-xl pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-50 transition-all"
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={isLoading} className="btn-luxe w-full py-3 text-sm">
                      {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Entrer au Cabinet'}
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => {
                        setEmail('jean.desfontaines@gmail.com');
                        router.push('/therapist/dashboard');
                      }}
                      className="w-full py-2 border border-dashed border-[#5F27CD]/30 rounded-lg text-[0.55rem] font-bold uppercase tracking-widest text-[#5F27CD] hover:bg-[#5F27CD]/5 transition-all mt-4"
                    >
                      ✨ Accès Magique (Dev Bypass)
                    </button>
                  </form>
                ) : (
                  <div className="space-y-5">
                    <div className="p-5 bg-[#222F3E] text-white rounded-xl shadow-lg relative overflow-hidden">
                      <div className="flex items-center gap-3 mb-3">
                         <ShieldCheck className="text-[#1DD1A1]" size={16} />
                         <h3 className="text-base font-serif font-bold italic">Lien d'Éveil</h3>
                      </div>
                      <p className="text-[0.65rem] font-serif font-light text-gray-300 leading-relaxed mb-4">
                        Pour votre sécurité, nous utilisons un lien de connexion magique envoyé par email.
                      </p>
                      <button 
                        onClick={handleSendMagicLink}
                        disabled={isLoading}
                        className="w-full bg-white text-[#5F27CD] py-3 rounded-lg text-[0.6rem] font-black uppercase tracking-widest transition-all hover:brightness-95 active:scale-98 flex items-center justify-center gap-2"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={14} /> : <>Envoyer mon accès <Mail size={12} /></>}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center mt-6">
          <p className="text-[0.6rem] font-bold text-gray-400 tracking-widest uppercase">
            Besoin d'aide ? <Link href="mailto:joao@serenity-relax.ch" className="text-[#5F27CD] hover:underline">Contacter João</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
