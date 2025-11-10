import { Suspense } from 'react';
import EnlaceEnviadoClient from './cliente';

export const dynamic = 'force-dynamic';

export default function EnlaceEnviadoPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center p-6">
          <p className="text-white text-lg">Cargando...</p>
        </main>
      }
    >
      <EnlaceEnviadoClient />
    </Suspense>
  );
}
