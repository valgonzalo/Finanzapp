import type { Metadata } from 'next';
import { Urbanist } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import FloatingActions from '@/components/FloatingActions';

const urbanist = Urbanist({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-urbanist' 
});

export const metadata: Metadata = {
  title: 'FinanzApp',
  description: 'App de Finanzas Personales',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FinanzApp',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import ConditionalLayout from '@/components/ConditionalLayout';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${urbanist.variable}`}>
      <body className="bg-background text-text-primary antialiased selection:bg-primary/30">
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
        </div>
        <ConditionalLayout>
          <main className="min-h-screen w-full max-w-[2000px] mx-auto relative px-4 md:px-8">
            {children}
          </main>
        </ConditionalLayout>
      </body>
    </html>
  );
}
