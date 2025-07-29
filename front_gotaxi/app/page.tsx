// app/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Amplify } from 'aws-amplify';
import {
  signIn,
  fetchAuthSession,
  getCurrentUser,
  signOut,
} from 'aws-amplify/auth';

import awsconfig from '../src/aws-exports';

Amplify.configure(awsconfig);

export default function Login() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [selectedRole, setSelectedRole] =
    useState<'user' | 'driver'>('user'); // solo visual

  /* -------- handler de inicio de sesión -------- */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      /* 1️⃣  Cierra sesión previa si existe */
      try {
        await getCurrentUser();
        await signOut();
      } catch {
        /* No había usuario */
      }

      /* 2️⃣  Iniciar sesión */
      await signIn({ username: email, password });

      /* 3️⃣  Obtener rol */
      const session = await fetchAuthSession();
      const payload = session.tokens?.idToken?.payload;
      const roleFromToken = payload?.['custom:role'] as string | undefined;

      // ⇨ Si el token no trae rol, usamos el seleccionado en la UI
      const role = roleFromToken ?? selectedRole;

      router.push(role === 'driver' ? '/driver' : '/user');
    } catch (err: unknown) {                    // ← sin `any`
      console.error('Login error:', err);

      // type-guard rápido para errores Amplify
      const authErr = err as { name?: string; message?: string };

      if (authErr.name === 'UserNotConfirmedException') {
        router.push(`/confirm?email=${encodeURIComponent(email)}`);
      } else {
        setError(authErr.message ?? 'Credenciales inválidas');
      }
    }
  };

  const handleRegister = () => router.push('/register');

  /* -------------- JSX -------------- */
  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="w-full max-w-md p-6 bg-black shadow-lg rounded-lg">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="/logotaxi.png" alt="GoTaxi Logo" className="w-20 h-20" />
        </div>

        <h2 className="text-white text-2xl font-bold mb-4 text-center">
          Inicio de sesión
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-white">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="correo@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-white">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="••••••••"
            />
          </div>

          {/* Selector visual de rol */}
          <div className="text-white">
            <span className="block mb-2">Entrar como:</span>
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={selectedRole === 'user'}
                  onChange={() => setSelectedRole('user')}
                  className="mr-2"
                />
                Pasajero
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="driver"
                  checked={selectedRole === 'driver'}
                  onChange={() => setSelectedRole('driver')}
                  className="mr-2"
                />
                Conductor
              </label>
            </div>
          </div>

          {/* Botón de inicio */}
          <button
            type="submit"
            className="w-full bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600 transition"
          >
            Iniciar sesión
          </button>
        </form>

        {/* Botón de registro */}
        <button
          type="button"
          onClick={handleRegister}
          className="w-full mt-4 bg-gray-700 text-white py-2 rounded-lg font-semibold hover:bg-gray-600 transition"
        >
          Registrarse
        </button>
      </div>
    </div>
  );
}
