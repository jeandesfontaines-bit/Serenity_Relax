'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useUser } from '@/firebase/provider';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { LogIn, User, Lock, Chrome, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user && !isUserLoading) {
      // Check if therapist (you can add a specific email check here)
      if (user.email === 'jean.desfontaines@gmail.com') {
        router.push('/therapist/dashboard');
      } else {
        router.push('/client/portal');
      }
    }
  }, [user, isUserLoading, router]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Redirection handled by useEffect
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
      // Redirection handled by useEffect
    } catch (err: any) {
      console.error(err);
      setError('Email ou mot de passe incorrect.');
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
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-8">
            <h1 className="text-3xl font-serif tracking-widest uppercase">Serenity Relax</h1>
            <div className="h-[1px] w-full bg-neutral-900 mt-1 scale-x-50" />
          </Link>
          <h2 className="text-2xl font-serif italic text-neutral-800">Espace Privé</h2>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">Excellence Thérapeutique</p>
        </div>

        <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 flex items-center gap-2"
              >
                <Lock className="w-3 h-3" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200 py-3.5 rounded-full text-sm font-medium transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Chrome className="w-5 h-5" />
            <span>Continuer avec Google</span>
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-transparent px-4 text-neutral-400">Ou par email</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-4">Email</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full bg-white/50 border border-neutral-200 py-3.5 pl-11 pr-4 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-all placeholder:text-neutral-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-4">Mot de Passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/50 border border-neutral-200 py-3.5 pl-11 pr-4 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-all placeholder:text-neutral-300"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-neutral-900 text-white py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 hover:bg-neutral-800 active:scale-95 disabled:opacity-50 mt-6 flex items-center justify-center gap-2 group"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  Connexion
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-neutral-500 tracking-wide">
            Pas encore de compte ? <Link href="/#booking" className="text-neutral-900 font-bold hover:underline decoration-neutral-300 underline-offset-4">Réservez un soin</Link> pour créer votre profil.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
