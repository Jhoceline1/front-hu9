// src/app/controlC/HU9/verify/page.tsx
import { Suspense } from 'react';
import VerifyClient from './cliente';

export const dynamic = 'force-dynamic'; // evita prerender estático en Vercel

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center p-6">
          <p className="text-white text-lg">Verificando...</p>
        </main>
      }
    >
      <VerifyClient />
    </Suspense>
  );
}
