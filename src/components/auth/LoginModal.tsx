'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import LoginPanel from './LoginPanel';

export default function LoginModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="landing-v2 landing-booking-modal fixed inset-0 z-[140] flex items-end justify-center bg-black/45 px-0 py-0 backdrop-blur-xl md:items-center md:px-4 md:py-5">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="landing-bg-surface landing-border-soft relative z-10 flex w-full max-w-[36rem] flex-col overflow-hidden rounded-t-[2.5rem] shadow-[0_40px_100px_-20px_rgba(21,32,35,0.2)] md:rounded-[2.5rem] md:border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        <div className="flex w-full justify-center pt-3 pb-1 md:hidden">
          <div className="landing-bg-subtle-strong h-1.5 w-12 rounded-full" />
        </div>
        <button
          onClick={onClose}
          className="landing-border-soft landing-bg-surface landing-text-high absolute right-6 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-[var(--off-black)] hover:text-[var(--off-white)] active:scale-95"
          aria-label="Fermer la connexion"
        >
          <X size={20} />
        </button>
        <section className="max-h-[88vh] overflow-y-auto px-6 py-8 md:px-12 md:py-12">
          <LoginPanel onSuccess={onClose} redirectIfAuthenticated={false} framed={false} />
        </section>
      </div>
    </div>,
    document.body
  );
}
