import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Serif_Display, Allison } from 'next/font/google';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';
import { BookingProvider } from '@/context/BookingContext';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const serif = DM_Serif_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400'],
});

const allison = Allison({
  subsets: ['latin'],
  variable: '--font-allison',
  weight: ['400'],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${jakarta.variable} ${serif.variable} ${allison.variable}`}>
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
