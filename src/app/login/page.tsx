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
import { Mail, ArrowRight, Loader2, Chrome, AlertCircle, Share2 } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
        <Loader2 className="w-8 h-8 animate-spin text-[#435544]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#faf9f7]">
      {/* Left Panel - Image & Branding */}
      <div className="hidden md:flex md:w-1/2 relative h-screen overflow-hidden">
        <img 
          src="/images/login-bg.png" 
          alt="Sanctuary" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative z-10 w-full h-full p-20 flex flex-col justify-between">
          <div className="flex items-center">
            <div className="flex items-center gap-4">
              <span className="text-[0.7rem] font-sans font-bold tracking-[0.6em] text-white uppercase opacity-90">
                Serenity Relax Therapy
              </span>
              <span className="font-cursive text-4xl text-white/95 leading-none pt-2">by João</span>
            </div>
          </div>

          <div className="space-y-8 max-w-xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[6rem] font-serif text-white leading-[0.9] tracking-tighter font-light"
            >
              Discover your <br />
              personal <br />
              sanctuary.
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="w-32 h-[1px] bg-white/40 origin-left"
            />
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-sans text-white/80 leading-relaxed font-light tracking-wide"
            >
              A sensory sanctuary in Geneva Cointrin <br />
              dedicated to physical and mental restoration.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-24 relative bg-[#faf9f7]">
        <div className="w-full max-w-md space-y-16">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-[4rem] font-serif text-[#1a1c1b] tracking-tighter leading-[0.9] font-light">
                Création de Compte
              </h2>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-12 h-[1px] bg-[#435544]/20" />
                <p className="text-[1.3rem] font-serif italic text-[#435544]/50 font-light">
                  Serenity Relax Therapy
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-[1rem] font-sans text-[#434842] opacity-70 leading-relaxed font-light tracking-wide max-w-[90%]">
              Access is exclusive to clients with a confirmed booking.
              Join our community for a personalized wellness experience.
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
                <div className="p-8 rounded-2xl bg-white border border-[#efeeec] shadow-sm space-y-6">
                  <div className="w-16 h-16 rounded-full bg-[#435544]/5 flex items-center justify-center mx-auto">
                    <Mail className="text-[#435544] w-6 h-6" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-serif text-[#1a1c1b]">Check your inbox</h3>
                    <p className="text-sm font-['Manrope'] text-[#434842] leading-relaxed">
                      We've sent a magic link to <br/>
                      <span className="font-bold text-[#1a1c1b]">{email}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => setMagicLinkSent(false)}
                    className="w-full py-4 text-[0.7rem] font-bold uppercase tracking-widest text-[#435544] border-t border-[#efeeec] hover:text-[#725a38] transition-colors"
                  >
                    Resend link
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
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <form className="space-y-12">
                  <div className="space-y-10">
                    {/* Email Field */}
                    <div className="space-y-4">
                      <label className="text-[0.65rem] font-['Manrope'] font-bold uppercase tracking-[0.2em] text-[#434842]/60">
                        What is your email address?
                      </label>
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-transparent border-b border-[#c3c8c0] py-4 text-[1.1rem] font-['Manrope'] text-[#1a1c1b] focus:outline-none focus:border-[#435544] transition-all placeholder:text-[#c3c8c0]/30 font-light"
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
                        <label className="text-[0.65rem] font-['Manrope'] font-bold uppercase tracking-[0.2em] text-[#434842]/60">
                          {isTherapist ? 'Enter your password' : 'Confirm your password'}
                        </label>
                        <input 
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-transparent border-b border-[#c3c8c0] py-4 text-[1.1rem] font-['Manrope'] text-[#1a1c1b] focus:outline-none focus:border-[#435544] transition-all placeholder:text-[#c3c8c0]/30 font-light"
                        />
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-8 pt-4">
                    {isTherapist ? (
                      <button 
                        onClick={handleEmailLogin}
                        disabled={isLoading || !password}
                        className="w-full bg-[#435544] text-white py-5 rounded-lg text-[0.8rem] font-bold uppercase tracking-[0.2em] transition-all hover:bg-[#364436] disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-[#435544]/10"
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                      </button>
                    ) : (
                      <button 
                        onClick={handleSendMagicLink}
                        disabled={isLoading || !email}
                        className="w-full bg-[#435544] text-white py-5 rounded-lg text-[0.8rem] font-bold uppercase tracking-[0.2em] transition-all hover:bg-[#364436] disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-[#435544]/10"
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                          <>
                            Send Magic Link
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#efeeec]"></div>
                      </div>
                      <div className="relative flex justify-center text-[0.6rem] uppercase tracking-[0.3em]">
                        <span className="bg-[#faf9f7] px-6 text-[#747872] font-['Manrope'] font-medium">Or sign in with</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <button 
                        onClick={handleGoogleLogin}
                        type="button"
                        className="flex items-center justify-center gap-3 bg-white border border-[#efeeec] py-4 rounded-xl hover:bg-white/80 transition-all shadow-sm group"
                      >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 transition-transform group-hover:scale-110" alt="Google" />
                        <span className="text-[0.75rem] font-['Manrope'] font-bold uppercase tracking-wider text-[#435544]">Google</span>
                      </button>
                      <button 
                        type="button"
                        className="flex items-center justify-center gap-3 bg-white border border-[#efeeec] py-4 rounded-xl hover:bg-white/80 transition-all shadow-sm group"
                      >
                        <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 384 512" fill="currentColor">
                          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                        </svg>
                        <span className="text-[0.75rem] font-['Manrope'] font-bold uppercase tracking-wider text-[#435544]">Apple</span>
                      </button>
                    </div>
                  </div>
                </form>

                <p className="text-[0.8rem] font-['Manrope'] text-[#434842]/60 text-center leading-relaxed">
                  Clients will receive an email to access their account after <br/>
                  their first session is booked. No password required.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
