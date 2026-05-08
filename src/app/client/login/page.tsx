'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Loader2, CheckCircle2, XCircle, Sparkle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ClientLoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const firestore = useFirestore();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function verifyToken() {
      if (!firestore) return;

      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token || !email) {
        setStatus('error');
        setErrorMsg('Ce lien de connexion semble incomplet ou a déjà été utilisé.');
        return;
      }

      try {
        const q = query(
          collection(firestore, 'clients'),
          where('email', '==', email),
          where('magicToken', '==', token),
          limit(1)
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
          const client = { id: snap.docs[0].id, ...snap.docs[0].data() };
          sessionStorage.setItem('serenity_client_id', client.id);
          setStatus('success');
          
          setTimeout(() => {
            router.push('/client/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setErrorMsg('Identifiants non reconnus. Merci de vérifier votre email ou de demander un nouveau lien.');
        }
      } catch (err: any) {
        console.error('Error verifying token:', err);
        setStatus('error');
        setErrorMsg('Un silence inhabituel... Une erreur est survenue lors de la connexion.');
      }
    }

    verifyToken();
  }, [firestore, searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFC] p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-[100px] -mr-48 -mt-48 opacity-60" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-50 rounded-full blur-[100px] -ml-48 -mb-48 opacity-60" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl shadow-neutral-200/50 border border-neutral-100 relative z-10"
      >
        <div className="mb-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-neutral-900/10">
            <Sparkle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-[10px] font-sans font-black uppercase tracking-[0.4em] text-neutral-400">Expérience Serenity</h1>
        </div>

        <AnimatePresence mode="wait">
          {status === 'verifying' && (
            <motion.div 
              key="verifying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-center mb-8">
                <Loader2 className="w-10 h-10 text-neutral-900 animate-spin" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-neutral-900">Vérification de votre accès...</h2>
              <p className="text-neutral-500 font-sans italic">Nous préparons votre espace de sérénité.</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={40} strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-neutral-900 leading-tight">Bienvenue dans votre <span className="text-neutral-400 italic font-light">sanctuaire</span></h2>
              <p className="text-emerald-600/70 font-sans font-medium">Connexion établie avec succès.</p>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <XCircle size={40} strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-neutral-900 italic">Oups...</h2>
              <p className="text-neutral-500 font-sans leading-relaxed">{errorMsg}</p>
              <button 
                onClick={() => router.push('/')}
                className="mt-8 w-full group py-5 bg-neutral-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-neutral-800 transition-all active:scale-95"
              >
                Retour à l'accueil
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 pt-8 border-t border-neutral-50">
          <p className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-neutral-300">
            &copy; {new Date().getFullYear()} Sanctuary Wellness
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function ClientLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FDFDFC]">
          <Loader2 className="w-12 h-12 text-neutral-900 animate-spin" />
        </div>
      }
    >
      <ClientLoginContent />
    </Suspense>
  );
}
