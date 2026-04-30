'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useUser } from '@/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { LogIn, User, Lock, Chrome, ArrowRight, Loader2, Mail, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const auth = useAuth();
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

  useEffect(() => {
    if (user && !isUserLoading) {
      if (user.email === 'jean.desfontaines@gmail.com') {
        router.push('/therapist/dashboard');
      } else {
        router.push('/client/portal');
      }
    }
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
      if (email.toLowerCase() === 'jean.desfontaines@gmail.com') {
        setIsTherapist(true);
        setIsClient(false);
        setStep('auth');
      } else {
        setIsClient(true);
        setIsTherapist(false);
        setStep('auth');
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
      const response = await fetch('/api/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() })
      });
      if (response.ok) {
        setMagicLinkSent(true);
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send magic link');
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #F0F4F8, #FAFBFD)' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#54A0FF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #F0F4F8 0%, #FAFBFD 40%, #F8F5F0 100%)' }}>
      {/* Vibrant background orbs */}
      <div className="absolute top-[-15%] right-[-15%] w-[50%] aspect-square rounded-full blur-[120px] opacity-20" style={{ background: 'linear-gradient(135deg, #54A0FF, #5F27CD)' }} />
      <div className="absolute bottom-[-15%] left-[-15%] w-[50%] aspect-square rounded-full blur-[120px] opacity-15" style={{ background: 'linear-gradient(135deg, #1DD1A1, #48DBFB)' }} />
      <div className="absolute top-[30%] left-[50%] w-[20%] aspect-square rounded-full blur-[80px] opacity-10" style={{ background: '#F368E0' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-8">
            <h1 className="text-[1.8rem] font-serif tracking-widest text-[#222F3E] uppercase">Serenity Relax</h1>
            <div className="h-[2px] w-16 mx-auto mt-2 rounded-full" style={{ background: 'linear-gradient(90deg, #54A0FF, #5F27CD)' }} />
            <span className="font-cursive text-2xl text-[#5F27CD] mt-1 block">by João</span>
          </Link>
          <h2 className="text-2xl font-serif italic text-[#222F3E]">Espace Privé</h2>
          <p className="text-[0.6rem] font-sans font-black uppercase tracking-[0.3em] text-[#576574] mt-3">Excellence Thérapeutique</p>
        </div>

        <div className="bg-white/60 backdrop-blur-2xl border border-white/60 p-10 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] relative overflow-hidden transition-all duration-500">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 p-4 text-[0.75rem] rounded-2xl flex items-start gap-3"
                style={{ background: 'rgba(255,107,107,0.08)', color: '#EE5A53', border: '1px solid rgba(255,107,107,0.15)' }}
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
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-xl" style={{ background: 'linear-gradient(135deg, #54A0FF, #5F27CD)', boxShadow: '0 10px 30px rgba(84,160,255,0.3)' }}>
                  <Mail className="text-white w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif font-bold text-[#222F3E]">Vérifiez vos emails</h3>
                  <p className="text-[0.85rem] font-sans text-[#576574] italic">Un lien de connexion magique a été envoyé à :<br/><strong className="text-[#222F3E]">{email}</strong></p>
                </div>
                <button 
                  onClick={() => setMagicLinkSent(false)}
                  className="text-[0.6rem] font-sans font-black uppercase tracking-widest text-[#54A0FF] hover:text-[#5F27CD] transition-colors"
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
                  <label className="text-[0.6rem] font-sans font-black uppercase tracking-[0.2em] text-[#576574] ml-4">VOTRE ADRESSE EMAIL</label>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8D6E5] group-hover:text-[#54A0FF] transition-colors" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@exemple.com"
                      className="w-full bg-white/50 border border-[#C8D6E5]/50 py-5 pl-14 pr-6 rounded-full text-[0.95rem] font-sans focus:outline-none focus:ring-2 focus:ring-[#54A0FF]/30 focus:border-[#54A0FF]/50 transition-all placeholder:text-[#C8D6E5]"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full text-white py-5 rounded-full text-[0.65rem] font-black uppercase tracking-[0.2em] transition-all duration-500 hover:shadow-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
                  style={{ background: 'linear-gradient(135deg, #54A0FF, #5F27CD)', boxShadow: '0 4px 20px rgba(84,160,255,0.3)' }}
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
                <div className="flex items-center gap-4 p-4 rounded-3xl" style={{ background: 'rgba(84,160,255,0.06)', border: '1px solid rgba(84,160,255,0.12)' }}>
                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <User className="w-5 h-5 text-[#54A0FF]" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[0.6rem] font-sans font-black text-[#576574] uppercase tracking-widest">Connecté en tant que</p>
                    <p className="text-[0.85rem] font-sans font-bold text-[#222F3E] truncate">{email}</p>
                  </div>
                  <button onClick={() => setStep('email')} className="text-[#C8D6E5] hover:text-[#54A0FF] transition-colors">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                </div>

                {isTherapist ? (
                  <form onSubmit={handleEmailLogin} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[0.6rem] font-sans font-black uppercase tracking-[0.2em] text-[#576574] ml-4">MOT DE PASSE</label>
                      <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8D6E5] transition-colors" />
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white/50 border border-[#C8D6E5]/50 py-5 pl-14 pr-6 rounded-full text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-[#54A0FF]/30 focus:border-[#54A0FF]/50 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full text-white py-5 rounded-full text-[0.65rem] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #54A0FF, #5F27CD)', boxShadow: '0 4px 20px rgba(84,160,255,0.3)' }}
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Accéder au Dashboard'}
                      </button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#C8D6E5]/30"></div></div>
                        <div className="relative flex justify-center text-[0.6rem] uppercase tracking-widest"><span className="bg-white/60 px-4 text-[#C8D6E5]">OU</span></div>
                      </div>

                      <button 
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-white/80 text-[#222F3E] border border-[#C8D6E5]/50 py-4 rounded-full text-[0.65rem] font-black uppercase tracking-widest transition-all shadow-sm"
                      >
                        <Chrome className="w-4 h-4" />
                        Continuer avec Google
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-8 py-4">
                    <div className="p-6 text-white rounded-[2rem] shadow-xl space-y-4 relative overflow-hidden group" style={{ background: 'linear-gradient(135deg, #5F27CD, #54A0FF)', boxShadow: '0 10px 30px rgba(95,39,205,0.2)' }}>
                      <Sparkles className="absolute top-[-20px] right-[-20px] w-20 h-20 text-white/10 rotate-12 transition-transform duration-1000 group-hover:scale-150" />
                      <h3 className="text-xl font-serif font-bold italic relative z-10">Lien Magique</h3>
                      <p className="text-[0.8rem] font-sans text-white/70 italic leading-relaxed relative z-10">
                        Pour votre sécurité, nous utilisons des liens magiques. Vous recevrez un accès instantané par email.
                      </p>
                      <button 
                        onClick={handleSendMagicLink}
                        disabled={isLoading}
                        className="w-full bg-white text-[#5F27CD] py-4 rounded-full text-[0.65rem] font-black uppercase tracking-[0.2em] transition-all hover:bg-white/90 active:scale-[0.98] flex items-center justify-center gap-3 mt-4 relative z-10"
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                          <>
                            Envoyer mon lien
                            <Mail className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                    
                    <p className="text-[0.7rem] font-sans text-[#576574] text-center italic">
                      Lien valable 15 minutes. Vérifiez vos spams.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center mt-12 space-y-4">
          <p className="text-[0.7rem] font-sans text-[#576574] tracking-[0.05em]">
            Besoin d'aide ? <Link href="mailto:contact@serenity-relax.ch" className="text-[#54A0FF] font-bold border-b border-[#54A0FF]/20 hover:border-[#54A0FF] transition-all">Contactez João</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
