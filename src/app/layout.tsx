import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { Toaster } from 'sonner';
import BackgroundFX from '@/components/BackgroundFX';

export const metadata: Metadata = {
  title: 'MatchIT',
  description: 'Marketplace de hardware com swipe + chat em tempo real',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#0B0E12] text-[#E5E7EB] antialiased">
        <BackgroundFX />
        <AuthProvider>
          {children}
          <Toaster richColors theme="dark" position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
