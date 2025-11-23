import { Suspense } from 'react';
import AuthPageClient from './AuthPageClient';

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center text-sm text-zinc-400">
          Carregando...
        </main>
      }
    >
      <AuthPageClient />
    </Suspense>
  );
}
