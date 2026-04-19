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
    <div className="h-screen flex items-center justify-center bg-[#F8F5F0]">
       <div className="w-16 h-16 border-4 border-[#059669]/20 border-t-[#059669] rounded-full animate-spin" />
    </div>
  );

  return <>{children}</>;
}
