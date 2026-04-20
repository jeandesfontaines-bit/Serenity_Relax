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
        body: JSON.stringify({ type: 'MAGIC_LINK', email: email.toLowerCase() })
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
        <div className="text-center mb-xl">
          <Link href="/" className="inline-block mb-l">
            <h1 className="font-heading text-[1.8rem] tracking-widest text-onyx uppercase font-medium">Serenity Relax</h1>
            <div className="h-[1px] w-l mx-auto mt-xxs bg-onyx/20" />
            <span className="font-cursive text-2xl text-sage-green mt-xs block">by João</span>
          </Link>
          <h2 className="font-heading text-h2 font-medium text-onyx tracking-heading">Espace Privé</h2>
          <p className="font-heading text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-xs">EXCELLENCE THÉRAPEUTIQUE</p>
        </div>

        <div className="bg-white border border-border p-xl rounded-card shadow-xl shadow-onyx/5 relative overflow-hidden transition-all duration-500">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-l p-m rounded-md flex items-start gap-xs bg-danger-background text-danger border border-danger/10"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="font-heading text-[10px] font-bold uppercase tracking-widest leading-relaxed">{error}</p>
              </motion.div>
            )}

            {magicLinkSent ? (
              <motion.div 
                key="magic-link-sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-l space-y-l"
              >
                <div className="w-xxl h-xxl rounded-md flex items-center justify-center mx-auto bg-success-background text-success">
                  <Mail className="w-8 h-8" />
                </div>
                <div className="space-y-xxs">
                  <h3 className="font-heading text-h3 font-medium text-onyx tracking-heading">Vérifiez vos emails</h3>
                  <p className="font-heading text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-loose">Un lien magique a été envoyé à :<br/><strong className="text-onyx">{email}</strong></p>
                </div>
                <button 
                  onClick={() => setMagicLinkSent(false)}
                  className="font-heading text-[10px] font-black uppercase tracking-widest text-info hover:text-info/80 transition-colors"
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
                className="space-y-xl"
              >
                <div className="space-y-xxs">
                  <label className="font-heading text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 ml-xs">VOTRE ADRESSE EMAIL</label>
                  <div className="relative group">
                    <User className="absolute left-m top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-onyx transition-colors" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@exemple.com"
                      className="w-full bg-secondary/50 border border-border h-xl pl-xl pr-m rounded-md text-small font-heading font-black text-onyx uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-onyx transition-all placeholder:text-muted-foreground/20"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-xl bg-onyx text-white rounded-md text-small font-heading font-black uppercase tracking-widest transition-all duration-500 hover:scale-[1.02] shadow-xl shadow-onyx/10 flex items-center justify-center gap-xs group disabled:opacity-30"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Continuer
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-xs" />
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
                className="space-y-xl"
              >
                <div className="flex items-center gap-m p-m rounded-md bg-secondary border border-border">
                  <div className="w-l h-l bg-white rounded-md flex items-center justify-center shadow-sm">
                    <User className="w-4 h-4 text-onyx" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-heading text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Connecté en tant que</p>
                    <p className="font-heading text-small font-black text-onyx truncate uppercase tracking-widest">{email}</p>
                  </div>
                  <button onClick={() => setStep('email')} className="text-muted-foreground hover:text-onyx transition-colors">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                </div>

                {isTherapist ? (
                  <form onSubmit={handleEmailLogin} className="space-y-xl">
                    <div className="space-y-xxs">
                      <label className="font-heading text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 ml-xs">MOT DE PASSE</label>
                      <div className="relative group">
                        <Lock className="absolute left-m top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 transition-colors" />
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-secondary/50 border border-border h-xl pl-xl pr-m rounded-md text-small font-heading font-black text-onyx uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-onyx transition-all placeholder:text-muted-foreground/20"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-m pt-xxs">
                      <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-xl bg-onyx text-white rounded-md text-small font-heading font-black uppercase tracking-widest transition-all duration-500 hover:scale-[1.02] shadow-xl shadow-onyx/10 flex items-center justify-center gap-xs disabled:opacity-30"
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Accéder au Dashboard'}
                      </button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                        <div className="relative flex justify-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/30"><span className="bg-white px-xs">OU</span></div>
                      </div>

                      <button 
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full h-xl flex items-center justify-center gap-xs bg-white hover:bg-secondary text-onyx border border-border rounded-md text-small font-heading font-black uppercase tracking-widest transition-all shadow-sm"
                      >
                        <Chrome className="w-4 h-4" />
                        Continuer avec Google
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-xl">
                    <div className="p-m bg-onyx text-white rounded-md shadow-xl shadow-onyx/20 space-y-m relative overflow-hidden group">
                      <Sparkles className="absolute top-[-20px] right-[-20px] w-20 h-20 text-white/10 rotate-12 transition-transform duration-1000 group-hover:scale-150" />
                      <h3 className="font-heading text-h3 font-medium relative z-10">Lien Magique</h3>
                      <p className="font-heading text-[10px] font-bold text-white/70 uppercase tracking-widest leading-loose relative z-10">
                        Pour votre sécurité, nous utilisons des liens magiques. Vous recevrez un accès instantané par email.
                      </p>
                      <button 
                        onClick={handleSendMagicLink}
                        disabled={isLoading}
                        className="w-full h-xl bg-white text-onyx rounded-md font-heading text-small font-black uppercase tracking-widest transition-all hover:bg-white/90 active:scale-[0.98] flex items-center justify-center gap-xs mt-l relative z-10"
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                          <>
                            Envoyer mon lien
                            <Mail className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                    
                    <p className="font-heading text-[9px] font-bold text-muted-foreground text-center uppercase tracking-widest">
                      Lien valable 15 minutes. Vérifiez vos spams.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center mt-xl space-y-m">
          <p className="font-heading text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-loose">
            Besoin d'aide ? <Link href="mailto:contact@serenity-relax.ch" className="text-onyx underline underline-offset-4 decoration-onyx/20 hover:decoration-onyx transition-all">Contactez João</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
