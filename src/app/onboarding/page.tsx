import { Suspense } from 'react';
import OnboardingClient from './OnboardingClient';

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen grid place-items-center">
          <div className="text-sm text-[#9CA3AF]">Carregando...</div>
        </main>
      }
    >
      <OnboardingClient />
    </Suspense>
  );
}
