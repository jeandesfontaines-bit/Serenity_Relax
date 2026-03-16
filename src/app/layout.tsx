
import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'SERENITY RELAX | Excellence Thérapeutique by João',
  description: 'Un sanctuaire sensoriel confidentiel à Genève Cointrin pour la restauration physique et mentale.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Outfit:wght@100..900&family=Homemade+Apple&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased selection:bg-secondary/20 bg-[#FAFAFA]">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
