'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [sessionClientId, setSessionClientId] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    setSessionClientId(sessionStorage.getItem('serenity_client_id'));
    setSessionReady(true);
  }, []);

  useEffect(() => {
    if (!isUserLoading && sessionReady && !user && !sessionClientId) {
      router.push('/login');
    }
  }, [isUserLoading, router, sessionClientId, sessionReady, user]);

  if (isUserLoading || !sessionReady) return (
    <div className="h-screen flex items-center justify-center bg-[#F8F5F0]">
       <div className="w-16 h-16 border-4 border-[#5F27CD]/20 border-t-[#5F27CD] rounded-full animate-spin" />
    </div>
  );

  if (!user && !sessionClientId) return null;

  return <div className="min-h-screen bg-[#F8F5F0]">{children}</div>;
}
