// src/app/controlC/HU9/verify/page.tsx
import ClientVerify from './ClientVerify';

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function VerifyPage({ searchParams }: Props) {
  const token =
    typeof searchParams.token === 'string' ? searchParams.token : undefined;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-servineo-500 via-servineo-300 to-servineo-400 p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-sm w-full">
        <h1 className="text-xl font-semibold text-servineo-500 mb-4">
          Verificación
        </h1>
        {/* Toda la lógica del navegador vive en el componente cliente */}
        <ClientVerify token={token} />
      </div>
    </main>
  );
}
