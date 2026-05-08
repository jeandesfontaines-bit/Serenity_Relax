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
import { Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

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
        setIsTherapist(false);
        // For clients, we go straight to magic link or show password if they prefer
        // Matching the UI mockup which has email and password fields
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
      setError(err.message || 'Une erreur est survenue.');
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
      setError("Impossible d'envoyer le lien. Merci de réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(132,204,22,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_26%),linear-gradient(180deg,#fffdfa_0%,#f7f8fc_100%)]">
        <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,rgba(132,204,22,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_26%),linear-gradient(180deg,#fffdfa_0%,#f7f8fc_100%)] md:flex-row">
      {/* Left Panel - Image & Branding */}
      <div className="hidden md:flex md:w-1/2 relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(132,204,22,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.24),transparent_34%),linear-gradient(145deg,#f8fafc_0%,#eef2ff_42%,#e2e8f0_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(15,23,42,0.12))]" />
        <div className="absolute -left-12 top-24 h-72 w-72 rounded-full bg-[#d9f99d]/35 blur-3xl" />
        <div className="absolute right-[-4rem] top-[-2rem] h-80 w-80 rounded-full bg-[#c7d2fe]/45 blur-3xl" />
        <div className="absolute bottom-10 left-20 h-64 w-64 rounded-full bg-white/60 blur-3xl" />
        <div className="absolute bottom-16 right-12 h-56 w-56 rounded-[38%_62%_63%_37%/46%_43%_57%_54%] bg-[#0f172a]/88 shadow-[0_30px_80px_rgba(15,23,42,0.18)]" />
        <div className="absolute left-[16%] top-[22%] h-72 w-72 rounded-[42%_58%_54%_46%/58%_40%_60%_42%] border border-white/50 bg-white/55 backdrop-blur-md shadow-[0_24px_60px_rgba(15,23,42,0.08)]" />
        <div className="absolute left-[34%] top-[34%] h-56 w-56 rounded-[58%_42%_31%_69%/46%_50%_50%_54%] bg-[linear-gradient(135deg,rgba(255,255,255,0.85),rgba(224,231,255,0.78))] shadow-[0_24px_60px_rgba(15,23,42,0.1)]" />
        <div className="absolute right-[12%] top-[22%] h-40 w-40 rounded-full border border-white/50 bg-white/45 backdrop-blur-md shadow-[0_18px_40px_rgba(15,23,42,0.08)]" />
        <div className="absolute right-[18%] top-[46%] h-32 w-32 rounded-full bg-[#84cc16]/28 blur-2xl" />
        
        <div className="relative z-10 w-full h-full p-20 flex flex-col justify-between">
          <div className="flex items-center">
            <div className="rounded-[24px] border border-white/15 bg-white/8 px-5 py-4 backdrop-blur-md">
              <div>
                <div className="flex items-baseline gap-2">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-white/78 md:text-[0.8rem]">
                    SERENITY RELAX THERAPY
                  </p>
                  <span className="font-serif text-[0.64rem] italic leading-none text-white/95 md:text-[0.72rem]">by João</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 max-w-xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[6rem] font-serif text-white leading-[0.9] tracking-tighter font-light"
            >
              Entrez dans votre <br />
              espace <br />
              de soin.
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="h-[1px] w-32 origin-left bg-[#d9f99d]/70"
            />
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-sans leading-relaxed font-light tracking-wide text-white/82"
            >
              Un espace confidentiel à Genève Cointrin <br />
              pensé pour prolonger votre expérience de soin.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="relative flex flex-1 items-center justify-center p-8 md:p-24">
        <div className="w-full max-w-md space-y-14 rounded-[36px] border border-white/60 bg-[rgba(255,255,255,0.78)] p-8 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-10">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-[3.5rem] font-serif leading-[0.92] tracking-tighter text-[#0f172a] font-light md:text-[4rem]">
                Connexion
              </h2>
              <div className="flex items-center gap-3 pt-2">
                <div className="h-[1px] w-12 bg-[#6366f1]/25" />
                <p className="text-[1.15rem] font-serif italic font-light text-[#6366f1]/55 md:text-[1.3rem]">
                  Serenity Relax Therapy
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <p className="max-w-[90%] text-[1rem] font-sans font-light leading-relaxed tracking-wide text-[#475569]">
              Cet accès est réservé aux personnes disposant d'une réservation
              confirmée ou d'un lien de connexion envoyé par e-mail.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {magicLinkSent ? (
              <motion.div 
                key="sent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8 py-4"
              >
                <div className="space-y-6 rounded-[28px] border border-[#e2e8f0] bg-white/90 p-8 shadow-[0_10px_32px_rgba(15,23,42,0.05)]">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef2ff]">
                    <Mail className="h-6 w-6 text-[#4f46e5]" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-serif text-[#0f172a]">Vérifiez votre boîte mail</h3>
                    <p className="text-sm leading-relaxed text-[#475569]">
                      Nous avons envoyé un lien de connexion à <br/>
                      <span className="font-bold text-[#0f172a]">{email}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => setMagicLinkSent(false)}
                    className="w-full border-t border-[#e2e8f0] py-4 text-[0.7rem] font-bold uppercase tracking-widest text-[#4f46e5] transition-colors hover:text-[#312e81]"
                  >
                    Renvoyer le lien
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-10"
              >
                {error && (
                  <div className="flex items-center gap-3 rounded-[18px] border border-[#fecaca] bg-[#fff1f2] p-4 text-sm text-[#be123c]">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <form className="space-y-12">
                  <div className="space-y-10">
                    {/* Email Field */}
                    <div className="space-y-4">
                      <label className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#64748b]">
                        Quelle est votre adresse e-mail ?
                      </label>
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-[18px] border border-[#dbe3ef] bg-white/78 px-5 py-4 text-[1.05rem] font-light text-[#0f172a] transition-all placeholder:text-[#94a3b8] focus:border-[#6366f1] focus:outline-none focus:ring-4 focus:ring-[#6366f1]/10"
                        required
                      />
                    </div>

                    {/* Password Field (only show if email entered or therapist identified) */}
                    {(step === 'auth' || email.length > 5) && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <label className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#64748b]">
                          {isTherapist ? 'Saisissez votre mot de passe' : 'Mot de passe'}
                        </label>
                        <input 
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-[18px] border border-[#dbe3ef] bg-white/78 px-5 py-4 text-[1.05rem] font-light text-[#0f172a] transition-all placeholder:text-[#94a3b8] focus:border-[#6366f1] focus:outline-none focus:ring-4 focus:ring-[#6366f1]/10"
                        />
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-8 pt-4">
                    {isTherapist ? (
                      <button 
                        onClick={handleEmailLogin}
                        disabled={isLoading || !password}
                        className="flex w-full items-center justify-center gap-3 rounded-[18px] bg-gradient-to-r from-[#5b21b6] to-[#6366f1] py-5 text-[0.8rem] font-bold uppercase tracking-[0.2em] text-white shadow-[0_14px_28px_rgba(99,102,241,0.2)] transition-all hover:-translate-y-[1px] disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Se connecter'}
                      </button>
                    ) : (
                      <button 
                        onClick={handleSendMagicLink}
                        disabled={isLoading || !email}
                        className="flex w-full items-center justify-center gap-3 rounded-[18px] bg-gradient-to-r from-[#5b21b6] to-[#6366f1] py-5 text-[0.8rem] font-bold uppercase tracking-[0.2em] text-white shadow-[0_14px_28px_rgba(99,102,241,0.2)] transition-all hover:-translate-y-[1px] disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                          <>
                            Envoyer le lien de connexion
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#e2e8f0]"></div>
                      </div>
                      <div className="relative flex justify-center text-[0.6rem] uppercase tracking-[0.3em]">
                        <span className="bg-[rgba(255,255,255,0.88)] px-6 font-medium text-[#94a3b8]">Ou continuer avec</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <button 
                        onClick={handleGoogleLogin}
                        type="button"
                        className="group flex items-center justify-center gap-3 rounded-[18px] border border-[#e2e8f0] bg-white/88 py-4 transition-all shadow-sm hover:-translate-y-[1px] hover:bg-white"
                      >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 transition-transform group-hover:scale-110" alt="Google" />
                        <span className="text-[0.75rem] font-bold uppercase tracking-wider text-[#312e81]">Google</span>
                      </button>
                      <button 
                        type="button"
                        className="group flex items-center justify-center gap-3 rounded-[18px] border border-[#e2e8f0] bg-white/88 py-4 transition-all shadow-sm hover:-translate-y-[1px] hover:bg-white"
                      >
                        <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 384 512" fill="currentColor">
                          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                        </svg>
                        <span className="text-[0.75rem] font-bold uppercase tracking-wider text-[#312e81]">Apple</span>
                      </button>
                    </div>
                  </div>
                </form>

                <p className="text-center text-[0.8rem] leading-relaxed text-[#64748b]">
                  Les clients reçoivent un lien de connexion par e-mail après <br/>
                  leur première réservation. Aucun mot de passe n'est requis.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
