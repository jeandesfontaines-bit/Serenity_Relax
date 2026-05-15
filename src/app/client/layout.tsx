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
    <div className="landing-v2 flex h-screen items-center justify-center bg-[var(--landing-page-bg)]">
       <div className="h-16 w-16 animate-spin rounded-full border-4 border-[rgba(21,56,57,0.16)] border-t-[var(--teal-deep)]" />
    </div>
  );

  if (!user && !sessionClientId) return null;

  return <div className="landing-v2 min-h-screen" style={{ background: 'var(--landing-page-bg)' }}>{children}</div>;
}
