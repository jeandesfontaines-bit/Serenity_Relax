'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

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
        setErrorMsg('Lien de connexion invalide ou expiré.');
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
          // Store in session storage for the current session
          sessionStorage.setItem('serenity_client_id', client.id);
          setStatus('success');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/client/portal');
          }, 1500);
        } else {
          setStatus('error');
          setErrorMsg('Lien non reconnu. Merci de vérifier vos informations ou de refaire une réservation.');
        }
      } catch (err: any) {
        console.error('Error verifying token:', err);
        setStatus('error');
        setErrorMsg('Une erreur est survenue lors de la connexion.');
      }
    }

    verifyToken();
  }, [firestore, searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-8 font-sans">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-xl shadow-neutral-100 border border-neutral-100">
        {status === 'verifying' && (
          <div className="space-y-6">
            <Loader2 className="w-12 h-12 text-neutral-900 animate-spin mx-auto" />
            <h1 className="text-2xl font-serif font-bold">Vérification de votre accès...</h1>
            <p className="text-neutral-400">Nous préparons votre rituel.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-2xl font-serif font-bold">Connexion réussie</h1>
            <p className="text-emerald-600/70 font-medium">Redirection vers votre espace client...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <XCircle size={32} />
            </div>
            <h1 className="text-2xl font-serif font-bold italic">Oups !</h1>
            <p className="text-neutral-500 leading-relaxed">{errorMsg}</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-4 px-8 py-3 bg-neutral-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition"
            >
              RETOUR À L'ACCUEIL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClientLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
          <Loader2 className="w-12 h-12 text-neutral-900 animate-spin" />
        </div>
      }
    >
      <ClientLoginContent />
    </Suspense>
  );
}
