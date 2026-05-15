import type { Metadata, Viewport } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';
import { BookingProvider } from '@/context/BookingContext';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: "Serenity Relax by João | Massothérapie Genève",
  description: "Expérience de massage thérapeutique et bien-être à Genève. Soins signatures : Bambous, Drainage Lymphatique, Aromathérapie et plus.",
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: "Serenity Relax by João",
    description: "L'équilibre par le toucher.",
    images: [{ url: 'https://files.cdn-files-a.com/uploads/11301091/2000_68f25aa9ea85d.jpg' }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf8f2' },
    { media: '(prefers-color-scheme: dark)', color: '#152023' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${montserrat.variable}`}>
      <body className="antialiased">
        <FirebaseClientProvider>
          <BookingProvider>
            {children}
            <Toaster />
          </BookingProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
