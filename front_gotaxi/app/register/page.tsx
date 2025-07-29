'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Importaciones de Amplify/Core y Auth
import { Amplify } from '@aws-amplify/core';
import { signUp } from '@aws-amplify/auth';

import awsconfig from '../../src/aws-exports';

Amplify.configure(awsconfig);

// Tipado para los atributos personalizados de registro
interface SignUpAttributes {
  email: string;
  'custom:role': 'user';
}

// Tipado para los parámetros de signUp
interface SignUpInput {
  username: string;
  password: string;
  attributes: SignUpAttributes;
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const params: SignUpInput = {
      username: email,
      password,
      attributes: {
        email,
        'custom:role': 'user',
      },
    };

    try {
      await signUp(params);
      router.push('/confirm?email=' + encodeURIComponent(email));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="w-full max-w-md p-6 bg-black rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Registro</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block mb-1 font-medium text-white">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@example.com"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block mb-1 font-medium text-white">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600 transition"
          >
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}
