'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

export default function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
  XS
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Sécurité Thérapeute
    if (!isUserLoading && user === null) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) return (
    <div className="h-screen flex items-center justify-center" style={{ background: 'hsl(var(--background))' }}>
      <div className="w-16 h-16 border-4 rounded-full animate-spin"
        style={{
          borderColor: 'hsl(var(--primary) / 0.2)',
          borderTopColor: 'hsl(var(--primary))'
        }}
      />
    </div>
  );

  return <>{children}</>;
}
