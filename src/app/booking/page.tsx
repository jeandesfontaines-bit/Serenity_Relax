
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirige vers la page d'accueil car la réservation est maintenant un panneau latéral (Sheet)
    router.push('/');
  }, [router]);

  return null;
}
