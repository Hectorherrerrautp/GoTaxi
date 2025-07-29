// app/confirm/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth'; // v6 APIs

export default function ConfirmPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get('email') || '';

  const [code, setCode]   = useState('');
  const [error, setError] = useState('');
  const [info,  setInfo]  = useState('');

  /* ───────── Confirmar código ───────── */
  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      setInfo('Cuenta confirmada. Redirigiendo al login…');
      router.push('/'); // redirección al login
    } catch (err: unknown) {               // ← sin `any`
      setError(
        err instanceof Error ? err.message : 'Error al confirmar',
      );
    }
  };

  /* ───────── Reenviar código ───────── */
  const handleResend = async () => {
    setError('');
    setInfo('');
    try {
      await resendSignUpCode({ username: email });
      setInfo('Código reenviado a tu correo.');
    } catch (err: unknown) {               // ← sin `any`
      setError(
        err instanceof Error ? err.message : 'No fue posible reenviar el código',
      );
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="w-full max-w-md p-6 bg-black rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          Confirmar registro
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {info  && <p className="text-green-400 text-center mb-4">{info}</p>}

        <form onSubmit={handleConfirm} className="space-y-4">
          <p className="text-sm text-yellow-500">
            Ingresa el código enviado a <b>{email}</b>
          </p>

          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código de verificación"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />

          <button
            type="submit"
            className="w-full bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600 transition"
          >
            Confirmar
          </button>

          {/* Reenviar */}
          <button
            type="button"
            onClick={handleResend}
            className="w-full bg-gray-700 text-white py-2 rounded-lg font-semibold hover:bg-gray-600 transition"
          >
            Reenviar código
          </button>
        </form>
      </div>
    </div>
  );
}
