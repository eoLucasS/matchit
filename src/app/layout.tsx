import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'MatchIT',
  description: 'Marketplace de hardware com swipe + chat ao vivo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#0B0E12] text-[#E5E7EB]">
        <Navbar />
        {children}
        <Toaster richColors theme="dark" />
      </body>
    </html>
  );
}
