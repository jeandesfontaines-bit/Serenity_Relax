'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@/firebase';
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, Loader2, Mail } from 'lucide-react';
import { isTherapistEmail } from '@/lib/therapist-auth';

export default function LoginPanel({
  onSuccess,
  redirectIfAuthenticated = true,
  framed = true,
}: {
  onSuccess?: () => void;
  redirectIfAuthenticated?: boolean;
  framed?: boolean;
}) {
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
  const frameClassName = framed
    ? 'w-full max-w-[36rem] space-y-8 rounded-[2.5rem] border border-[rgba(21,56,57,0.1)] bg-white/98 p-8 shadow-[0_30px_70px_rgba(15,23,42,0.1)] backdrop-blur-xl md:p-10'
    : 'w-full space-y-8';

  const navigateToDashboard = (signedInEmail?: string | null) => {
    if (isTherapistEmail(signedInEmail || user?.email)) {
      router.push('/therapist/dashboard');
      return;
    }
    router.push('/client/dashboard');
  };

  useEffect(() => {
    if (user && !isUserLoading) {
      if (redirectIfAuthenticated) {
        navigateToDashboard(user.email);
      }
    }
  }, [user, isUserLoading, redirectIfAuthenticated, router]);

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      if (!redirectIfAuthenticated) {
        onSuccess?.();
        navigateToDashboard(credential.user.email);
      }
    } catch (err: any) {
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
      const credential = await signInWithEmailAndPassword(auth, email, password);
      if (!redirectIfAuthenticated) {
        onSuccess?.();
        navigateToDashboard(credential.user.email);
      }
    } catch {
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
        body: JSON.stringify({ email: email.toLowerCase() }),
      });
      if (response.ok) {
        setMagicLinkSent(true);
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send magic link');
      }
    } catch {
      setError("Impossible d'envoyer le lien. Merci de réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrimarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const normalizedEmail = email.toLowerCase().trim();

    if (step === 'auth' && isTherapist) {
      await handleEmailLogin(e);
      return;
    }

    setError(null);
    if (isTherapistEmail(normalizedEmail)) {
      setIsLoading(true);
      try {
        setIsTherapist(true);
        setStep('auth');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsTherapist(false);
    await handleSendMagicLink();
  };

  if (isUserLoading) {
    return (
      <div className={`${frameClassName} flex min-h-[320px] items-center justify-center`}>
        <Loader2 className="h-8 w-8 animate-spin text-[var(--teal-deep)]" />
      </div>
    );
  }

  if (user && !redirectIfAuthenticated) {
    return (
      <div className={frameClassName}>
        <div className="space-y-4">
          <h2 id="login-modal-title" className="landing-type-h1 landing-text-high display-tight max-w-[8ch]">
            Connexion
          </h2>
          <div className="flex items-center gap-3">
            <div className="h-px w-12 bg-[var(--landing-tint)]" />
            <p className="landing-display-italic text-[1.15rem] text-[var(--landing-warm-muted)]">
              Serenity Relax Therapy
            </p>
          </div>
        </div>

        <div className="landing-bg-subtle landing-border-soft space-y-4 rounded-[1.75rem] border p-6 md:p-7">
          <p className="landing-type-micro text-[var(--landing-warm-muted)]">
            Session active
          </p>
          <p className="landing-type-body landing-text-high leading-relaxed">
            Connecté avec <span className="font-semibold">{user.email}</span>
          </p>
          <p className="landing-type-body-s landing-text-body max-w-[30ch] leading-relaxed">
            Vous pouvez ouvrir votre espace directement, ou vous déconnecter pour utiliser un autre compte.
          </p>
        </div>

        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={() => {
              onSuccess?.();
              navigateToDashboard(user.email);
            }}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-[var(--teal-deep)] py-4 text-[0.8rem] font-bold uppercase tracking-[0.18em] text-white shadow-[0_14px_28px_rgba(21,56,57,0.2)] transition-all hover:-translate-y-[1px] hover:bg-[var(--off-black)]"
          >
            Ouvrir mon espace
          </button>
          <button
            type="button"
            onClick={async () => {
              await signOut(auth);
            }}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-[var(--landing-tint)] bg-white py-4 text-[0.75rem] font-bold uppercase tracking-[0.16em] text-[var(--landing-warm-soft)] transition-all hover:bg-[var(--off-white)]"
          >
            Utiliser un autre compte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={frameClassName}>
      <div className="space-y-4">
        <h2 id="login-modal-title" className="landing-type-h1 landing-text-high display-tight max-w-[8ch]">
          Connexion
        </h2>
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-[var(--landing-tint)]" />
          <p className="landing-display-italic text-[1.15rem] text-[var(--landing-warm-muted)]">
            Serenity Relax Therapy
          </p>
        </div>
      </div>

      <p className="landing-type-body landing-text-body max-w-[34ch] leading-relaxed">
        Pour vous connecter, utilisez votre e-mail. Les clients reçoivent un lien de connexion après réservation.
      </p>

      {magicLinkSent ? (
        <div className="landing-bg-subtle landing-border-soft space-y-6 rounded-[1.75rem] border p-7 shadow-[0_10px_32px_rgba(15,23,42,0.05)] md:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--neon)]/30">
            <Mail className="h-6 w-6 text-[var(--teal-deep)]" />
          </div>
          <div className="space-y-2 text-center">
            <h3 className="landing-type-h4 landing-text-high display-tight">Vérifiez votre boîte mail</h3>
            <p className="landing-type-body-s landing-text-body leading-relaxed">
              Nous avons envoyé un lien de connexion à <br />
              <span className="font-semibold text-[var(--off-black)]">{email}</span>
            </p>
          </div>
          <button
            onClick={() => setMagicLinkSent(false)}
            className="w-full border-t border-[var(--landing-tint)] py-4 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-warm-soft)] transition-colors hover:text-[var(--off-black)]"
          >
            Renvoyer le lien
          </button>
        </div>
      ) : (
        <form onSubmit={handlePrimarySubmit} className="space-y-8">
          {error && (
            <div className="flex items-center gap-3 rounded-[1.2rem] border border-[#f5b4ab] bg-[#fce8e5] p-4 text-sm text-[#d04e41]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-4">
              <label className="landing-type-micro text-[var(--landing-warm-muted)]">
                Quelle est votre adresse e-mail ?
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-full border border-[var(--landing-tint)] bg-white px-6 py-4 text-[1.02rem] font-medium text-[var(--off-black)] transition-all placeholder:text-[var(--landing-warm-muted)]/75 focus:border-[var(--teal)] focus:outline-none focus:ring-4 focus:ring-[var(--teal)]/12"
                required
              />
            </div>

            {step === 'auth' && isTherapist && (
              <div className="space-y-4">
                <label className="landing-type-micro text-[var(--landing-warm-muted)]">
                  Saisissez votre mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-full border border-[var(--landing-tint)] bg-white px-6 py-4 text-[1.02rem] font-medium text-[var(--off-black)] transition-all placeholder:text-[var(--landing-warm-muted)]/75 focus:border-[var(--teal)] focus:outline-none focus:ring-4 focus:ring-[var(--teal)]/12"
                />
              </div>
            )}
          </div>

          <div className="space-y-7 pt-2">
            <button
              type="submit"
              disabled={isLoading || !email || (isTherapist && step === 'auth' && !password)}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-[var(--teal-deep)] py-4 text-[0.8rem] font-bold uppercase tracking-[0.18em] text-white shadow-[0_14px_28px_rgba(21,56,57,0.22)] transition-all hover:-translate-y-[1px] hover:bg-[var(--off-black)] disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isTherapist && step === 'auth' ? (
                'Se connecter'
              ) : (
                <>
                  Envoyer le lien de connexion
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--landing-tint)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="landing-type-micro bg-white px-6 text-[var(--landing-warm-muted)]">Ou continuer avec</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="group flex w-full items-center justify-center gap-3 rounded-full border border-[var(--landing-tint)] bg-white py-4 transition-all shadow-sm hover:-translate-y-[1px] hover:bg-[var(--off-white)]"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-4 w-4 transition-transform group-hover:scale-110" alt="Google" />
              <span className="text-[0.75rem] font-bold uppercase tracking-[0.16em] text-[var(--landing-warm-soft)]">Google</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
