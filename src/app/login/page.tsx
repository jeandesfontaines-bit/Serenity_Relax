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
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      // Ignore the error if the user closed the popup
      if (err.code !== 'auth/cancelled-popup-request') {
        setError(err.message || 'Une erreur est survenue.');
      }
    } finally {
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
      <div className="flex min-h-screen items-center justify-center bg-[var(--off-white)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--teal-deep)]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--off-white)] md:flex-row">
      {/* Left Panel - Image & Branding */}
      <div className="hidden md:flex md:w-1/2 relative h-screen overflow-hidden">
        <img
          src="/images/login-bg.png"
          alt="Ambiance bien-être"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,32,35,0.12),rgba(21,32,35,0.42))]" />
        
        <div className="relative z-10 w-full h-full p-20 flex flex-col justify-between">
          <div className="flex items-center">
            <div className="flex items-baseline gap-2">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-white/78 md:text-[0.8rem]">
                SERENITY RELAX THERAPY
              </p>
              <span className="font-serif text-[0.64rem] italic leading-none text-white/95 md:text-[0.72rem]">by João</span>
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
              className="h-[1px] w-32 origin-left bg-[var(--neon)]/80"
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
        <div className="w-full max-w-md space-y-14 rounded-[36px] border border-[var(--teal-deep)]/12 bg-white p-8 shadow-[0_22px_60px_rgba(15,23,42,0.08)] md:p-10">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-[3.5rem] font-serif leading-[0.92] tracking-tighter text-[var(--off-black)] font-light md:text-[4rem]">
                Connexion
              </h2>
              <div className="flex items-center gap-3 pt-2">
                <div className="h-[1px] w-12 bg-[var(--teal-deep)]/25" />
                <p className="text-[1.15rem] font-serif italic font-light text-[var(--teal-deep)]/60 md:text-[1.3rem]">
                  Serenity Relax Therapy
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <p className="max-w-[90%] text-[1rem] font-sans font-light leading-relaxed tracking-wide text-[var(--teal-deep)]/80">
              Pour vous connecter, cliquez sur le lien fourni à la fin de votre réservation.
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
                <div className="space-y-6 rounded-[28px] border border-[var(--teal-deep)]/12 bg-[var(--off-white)] p-8 shadow-[0_10px_32px_rgba(15,23,42,0.05)]">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--neon)]/30">
                    <Mail className="h-6 w-6 text-[var(--teal-deep)]" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-serif text-[var(--off-black)]">Vérifiez votre boîte mail</h3>
                    <p className="text-sm leading-relaxed text-[var(--teal-deep)]/80">
                      Nous avons envoyé un lien de connexion à <br/>
                      <span className="font-bold text-[var(--off-black)]">{email}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => setMagicLinkSent(false)}
                    className="w-full border-t border-[var(--teal-deep)]/12 py-4 text-[0.7rem] font-bold uppercase tracking-widest text-[var(--teal-deep)] transition-colors hover:text-[var(--off-black)]"
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
                  <div className="flex items-center gap-3 rounded-[18px] border border-[#f5b4ab] bg-[#fce8e5] p-4 text-sm text-[#d04e41]">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <form className="space-y-12">
                  <div className="space-y-10">
                    {/* Email Field */}
                    <div className="space-y-4">
                      <label className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--teal-deep)]/70">
                        Quelle est votre adresse e-mail ?
                      </label>
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-[18px] border border-[var(--teal-deep)]/16 bg-white px-5 py-4 text-[1.05rem] font-light text-[var(--off-black)] transition-all placeholder:text-[var(--teal-deep)]/45 focus:border-[var(--teal)] focus:outline-none focus:ring-4 focus:ring-[var(--teal)]/15"
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
                        <label className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--teal-deep)]/70">
                          {isTherapist ? 'Saisissez votre mot de passe' : 'Mot de passe'}
                        </label>
                        <input 
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-[18px] border border-[var(--teal-deep)]/16 bg-white px-5 py-4 text-[1.05rem] font-light text-[var(--off-black)] transition-all placeholder:text-[var(--teal-deep)]/45 focus:border-[var(--teal)] focus:outline-none focus:ring-4 focus:ring-[var(--teal)]/15"
                        />
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-8 pt-4">
                    {isTherapist ? (
                      <button 
                        onClick={handleEmailLogin}
                        disabled={isLoading || !password}
                        className="flex w-full items-center justify-center gap-3 rounded-[18px] bg-[var(--teal-deep)] py-5 text-[0.8rem] font-bold uppercase tracking-[0.2em] text-white shadow-[0_14px_28px_rgba(39,94,106,0.25)] transition-all hover:-translate-y-[1px] hover:bg-[var(--off-black)] disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Se connecter'}
                      </button>
                    ) : (
                      <button 
                        onClick={handleSendMagicLink}
                        disabled={isLoading || !email}
                        className="flex w-full items-center justify-center gap-3 rounded-[18px] bg-[var(--teal-deep)] py-5 text-[0.8rem] font-bold uppercase tracking-[0.2em] text-white shadow-[0_14px_28px_rgba(39,94,106,0.25)] transition-all hover:-translate-y-[1px] hover:bg-[var(--off-black)] disabled:opacity-50"
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
                        <div className="w-full border-t border-[var(--teal-deep)]/12"></div>
                      </div>
                      <div className="relative flex justify-center text-[0.6rem] uppercase tracking-[0.3em]">
                        <span className="bg-white px-6 font-medium text-[var(--teal-deep)]/50">Ou continuer avec</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <button 
                        onClick={handleGoogleLogin}
                        type="button"
                        className="group flex items-center justify-center gap-3 rounded-[18px] border border-[var(--teal-deep)]/12 bg-white py-4 transition-all shadow-sm hover:-translate-y-[1px] hover:bg-[var(--off-white)]"
                      >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 transition-transform group-hover:scale-110" alt="Google" />
                        <span className="text-[0.75rem] font-bold uppercase tracking-wider text-[var(--teal-deep)]">Google</span>
                      </button>
                      <button 
                        type="button"
                        className="group flex items-center justify-center gap-3 rounded-[18px] border border-[var(--teal-deep)]/12 bg-white py-4 transition-all shadow-sm hover:-translate-y-[1px] hover:bg-[var(--off-white)]"
                      >
                        <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 384 512" fill="currentColor">
                          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                        </svg>
                        <span className="text-[0.75rem] font-bold uppercase tracking-wider text-[var(--teal-deep)]">Apple</span>
                      </button>
                    </div>
                  </div>
                </form>

                <p className="text-center text-[0.8rem] leading-relaxed text-[var(--teal-deep)]/70">
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
