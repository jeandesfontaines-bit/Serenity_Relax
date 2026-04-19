'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ClientPortalRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirige vers le nouveau tableau de bord Zen
    router.replace('/client/dashboard');
  }, [router]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F8F5F0] gap-6">
       <div className="w-16 h-16 border-4 border-[#5F27CD]/20 border-t-[#5F27CD] rounded-full animate-spin" />
       <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-[#5F27CD] animate-pulse">Relocalisation vers votre Sanctuaire...</p>
    </div>
  );
}