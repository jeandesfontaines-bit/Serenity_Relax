'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-[#F8F5F0]">
       <div className="w-16 h-16 border-4 border-[#5F27CD]/20 border-t-[#5F27CD] rounded-full animate-spin" />
    </div>
  );

  return <div className="min-h-screen bg-[#F8F5F0]">{children}</div>;
}
