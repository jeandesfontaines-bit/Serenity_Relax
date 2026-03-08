import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AuraFlow Wellness | Modern Holistic Therapy',
  description: 'A contemporary sanctuary for physical and mental restoration.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-secondary/20">{children}</body>
    </html>
  );
}
