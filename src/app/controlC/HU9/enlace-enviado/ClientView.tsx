'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const BASE_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/controlC';

export default function ClientView({ email, token }: { email?: string; token?: string }) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(300); // 5 minutos
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!email || typeof window === 'undefined') return;
    const localKey = `servineo_last_request_${email}`;
    const last = localStorage.getItem(localKey);
    if (!last) return setCanResend(true);
    const diff = Date.now() - Number(last);
    setCanResend(diff >= 60_000);
  }, [email, info, countdown]);

  const minutos = useMemo(() => Math.floor(countdown / 60), [countdown]);
  const segundos = useMemo(() => countdown % 60, [countdown]);

  const handleResend = async () => {
    setInfo(null);
    if (!email) return setInfo('No se encontró el correo. Vuelve a la pantalla anterior.');
    if (!canResend) return setInfo('Ya existe una solicitud en curso. Intenta nuevamente en 1 minuto.');

    setLoading(true);
    const fallback = setTimeout(() => setInfo('Estamos tardando más de lo normal…'), 3000);

    try {
      const res = await fetch(`${BASE_API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`servineo_last_request_${email}`, String(Date.now()));
        }
        setInfo('Enlace reenviado. Revisa tu bandeja de entrada.');
        setCountdown(300);
        setCanResend(false);
      } else if (res.status === 429) {
        setInfo('Ya existe una solicitud en curso. Intenta nuevamente en 1 minuto.');
        setCanResend(false);
      } else if (res.status === 404) {
        setInfo('El correo no está asociado a ninguna cuenta.');
      } else {
        setInfo(data.message || 'No se pudo reenviar el enlace.');
      }
    } catch {
      setInfo('Error de conexión con el servidor.');
    } finally {
      clearTimeout(fallback);
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <p className="text-sm text-gray-700">
        Te enviamos un enlace para ingresar sin contraseña. Por seguridad, el enlace caduca en
        <span className="font-medium"> 5 minutos</span>.
      </p>

      <div className="mt-5 flex flex-col items-center gap-2" aria-live="polite">
        <p className="text-sm text-gray-700">Tiempo restante para usar el enlace:</p>
        <div
          className="px-6 py-2 rounded-full bg-gray-100 ring-1 ring-gray-300 text-3xl font-semibold text-gray-900 tracking-widest tabular-nums shadow-sm"
          title="Tiempo restante"
        >
          {String(minutos).padStart(2, '0')}:{String(segundos).padStart(2, '0')}
        </div>
      </div>

      {info && (
        <div role="status" aria-live="polite" className="mt-4 rounded-xl bg-servineo-100/5 border border-servineo-300/40 text-gray-800 p-3 text-sm">
          {info}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleResend}
          disabled={loading || !canResend || !email}
          className={`rounded-xl p-3.5 font-semibold transition shadow ${
            loading || !canResend || !email
              ? 'bg-servineo-200 text-white cursor-not-allowed'
              : 'bg-servineo-500 hover:bg-servineo-600 text-white'
          }`}
        >
          {loading ? 'Reenviando…' : 'Reenviar enlace'}
        </button>

        <button
          onClick={() => router.push('/controlC/HU4/login')}
          className="rounded-xl p-3.5 font-semibold transition shadow bg-white text-servineo-500 hover:text-servineo-600 ring-1 ring-servineo-300 hover:ring-servineo-400"
        >
          Volver a inicio de sesión
        </button>
      </div>

      <div className="mt-6 text-xs text-gray-600 space-y-1">
        <p>• Revisa la carpeta de <span className="font-medium">Spam</span> o <span className="font-medium">Promociones</span> si no ves el correo.</p>
        <p>• Al generar un nuevo enlace, los anteriores quedan <span className="font-medium">inválidos</span>.</p>
      </div>
    </div>
  );
}
