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
import { LogIn, User, Lock, Chrome, ArrowRight, Loader2, Mail, Sparkles, AlertCircle } from 'lucide-react';
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
  const [isClient, setIsClient] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (user && !isUserLoading) {
      if (user.email === 'jean.desfontaines@gmail.com') {
        router.push('/therapist/dashboard');
      } else {
        router.push('/client/portal');
      }
    }
    
    // Check session storage for client
    const clientId = sessionStorage.getItem('serenity_client_id');
    if (clientId && !user) {
      router.push('/client/portal');
    }
  }, [user, isUserLoading, router]);

  const handleIdentifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Is it the therapist?
      if (email.toLowerCase() === 'jean.desfontaines@gmail.com') {
        setIsTherapist(true);
        setIsClient(false);
        setStep('auth');
      } else {
        // 2. Search for client in Firestore
        if (firestore) {
          const q = query(collection(firestore, 'clients'), where('email', '==', email.toLowerCase()));
          const snap = await getDocs(q);
          
          if (!snap.empty) {
            setIsClient(true);
            setIsTherapist(false);
            setStep('auth');
          } else {
            setError("Email non reconnu. Si vous êtes nouveau, merci de réserver votre premier soin pour créer un profil.");
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de la vérification.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue lors de la connexion Google.');
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      setError('Email ou mot de passe incorrect.');
      setIsLoading(false);
    }
  };

  const handleSendMagicLink = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'MAGIC_LINK',
          email: email.toLowerCase()
        })
      });

      if (response.ok) {
        setMagicLinkSent(true);
      } else {
        throw new Error('Failed to send magic link');
      }
    } catch (err) {
      console.error(err);
      setError("Impossible d'envoyer le lien de connexion. Merci de réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f3ef]">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f3ef] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] aspect-square bg-[#eceae2] rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] aspect-square bg-[#eceae2] rounded-full blur-3xl opacity-50" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-8">
            <h1 className="text-[1.8rem] font-serif tracking-widest text-neutral-900 uppercase">Serenity Relax</h1>
            <div className="h-[1px] w-full bg-neutral-900/10 mt-2 scale-x-50" />
            <span className="font-cursive text-2xl text-neutral-400 mt-1 block">by João</span>
          </Link>
          <h2 className="text-2xl font-serif italic text-neutral-800">Espace Privé</h2>
          <p className="text-[0.6rem] font-sans font-black uppercase tracking-[0.3em] text-neutral-400 mt-3">Excellence Thérapeutique</p>
        </div>

        <div className="bg-white/60 backdrop-blur-2xl border border-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden transition-all duration-500">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 p-4 bg-rose-50/50 text-rose-600 text-[0.75rem] rounded-2xl border border-rose-100 flex items-start gap-3"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="font-sans font-medium italic">{error}</p>
              </motion.div>
            )}

            {magicLinkSent ? (
              <motion.div 
                key="magic-link-sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-6"
              >
                <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-neutral-200">
                  <Mail className="text-white w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif font-bold text-neutral-900">Vérifiez vos emails</h3>
                  <p className="text-[0.85rem] font-sans text-neutral-500 italic">Un lien de connexion magique a été envoyé à :<br/><strong>{email}</strong></p>
                </div>
                <button 
                  onClick={() => setMagicLinkSent(false)}
                  className="text-[0.6rem] font-sans font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                  Renvoyer le lien
                </button>
              </motion.div>
            ) : step === 'email' ? (
              <motion.form 
                key="step-email"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleIdentifyEmail}
                className="space-y-8"
              >
                <div className="space-y-3">
                  <label className="text-[0.6rem] font-sans font-black uppercase tracking-[0.2em] text-neutral-400 ml-4">VOTRE ADRESSE EMAIL</label>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 group-hover:text-neutral-900 transition-colors" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@exemple.com"
                      className="w-full bg-neutral-50/50 border border-neutral-100 py-5 pl-14 pr-6 rounded-full text-[0.95rem] font-sans focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-all placeholder:text-neutral-300"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full bg-neutral-900 text-white py-5 rounded-full text-[0.65rem] font-black uppercase tracking-[0.2em] transition-all duration-500 hover:bg-neutral-800 hover:shadow-xl hover:shadow-neutral-900/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Continuer
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="step-auth"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-3xl border border-neutral-100">
                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <User className="w-5 h-5 text-neutral-900" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[0.6rem] font-sans font-black text-neutral-400 uppercase tracking-widest">Connecté en tant que</p>
                    <p className="text-[0.85rem] font-sans font-bold text-neutral-900 truncate">{email}</p>
                  </div>
                  <button onClick={() => setStep('email')} className="text-neutral-300 hover:text-neutral-900 transition-colors">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                </div>

                {isTherapist ? (
                  <form onSubmit={handleEmailLogin} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[0.6rem] font-sans font-black uppercase tracking-[0.2em] text-neutral-400 ml-4">MOT DE PASSE</label>
                      <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 transition-colors" />
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-neutral-50/50 border border-neutral-100 py-5 pl-14 pr-6 rounded-full text-[0.95rem] focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-neutral-900 text-white py-5 rounded-full text-[0.65rem] font-black uppercase tracking-[0.2em] transition-all hover:bg-neutral-800 flex items-center justify-center gap-2"
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Accéder au Dashboard'}
                      </button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-100"></div></div>
                        <div className="relative flex justify-center text-[0.6rem] uppercase tracking-widest"><span className="bg-white px-4 text-neutral-300">OU</span></div>
                      </div>

                      <button 
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200 py-4 rounded-full text-[0.65rem] font-black uppercase tracking-widest transition-all shadow-sm"
                      >
                        <Chrome className="w-4 h-4" />
                        Continuer avec Google
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-8 py-4">
                    <div className="p-6 bg-neutral-900 text-white rounded-[2rem] shadow-xl shadow-neutral-900/10 space-y-4 relative overflow-hidden group">
                      <Sparkles className="absolute top-[-20px] right-[-20px] w-20 h-20 text-white/5 rotate-12 transition-transform duration-1000 group-hover:scale-150" />
                      <h3 className="text-xl font-serif font-bold italic relative z-10">Lien Magique</h3>
                      <p className="text-[0.8rem] font-sans text-neutral-400 italic leading-relaxed relative z-10">
                        Pour votre sécurité, nous utilisons des liens magiques. Vous recevrez un accès instantané par email.
                      </p>
                      <button 
                        onClick={handleSendMagicLink}
                        disabled={isLoading}
                        className="w-full bg-white text-neutral-900 py-4 rounded-full text-[0.65rem] font-black uppercase tracking-[0.2em] transition-all hover:bg-neutral-50 active:scale-[0.98] flex items-center justify-center gap-3 mt-4 relative z-10"
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                          <>
                            Envoyer mon lien
                            <Mail className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                    
                    <p className="text-[0.7rem] font-sans text-neutral-400 text-center italic">
                      Lien valable 15 minutes. Vérifiez vos spams.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center mt-12 space-y-4">
          <p className="text-[0.7rem] font-sans text-neutral-500 tracking-[0.05em]">
            Besoin d'aide ? <Link href="mailto:contact@serenity-relax.ch" className="text-neutral-900 font-bold border-b border-neutral-900/10 hover:border-neutral-900 transition-all">Contactez João</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
