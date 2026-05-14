'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

export default function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Sécurité Thérapeute
    if (user === null) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return (
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
