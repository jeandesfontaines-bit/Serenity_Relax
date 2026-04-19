import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Serif_Display, Meow_Script } from 'next/font/google';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
});

const meowScript = Meow_Script({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-meow',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Serenity Relax Therapy • Genève Cointrin',
  description: 'Sanctuaire sensoriel confidentiel à Genève Cointrin',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${plusJakarta.variable} ${dmSerif.variable} ${meowScript.variable} antialiased`}>
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
