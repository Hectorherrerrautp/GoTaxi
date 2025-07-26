// app/register/page.tsx
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
  'custom:role': 'user' | 'driver';
}

// Tipado para los parámetros de signUp
interface SignUpInput {
  username: string;
  password: string;
  attributes: SignUpAttributes;
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail]       = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole]         = useState<'user'|'driver'>('user');
  const [error, setError]       = useState<string>('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const params: SignUpInput = {
      username: email,
      password,
      attributes: {
        email,
        'custom:role': role,
      }
    };

    try {
      await signUp(params);
      router.push(role === 'driver' ? '/driver/home' : '/user/home');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Registro</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block mb-1 font-medium">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="correo@example.com"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block mb-1 font-medium">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Role selector */}
          <div>
            <span className="block mb-1 font-medium">Registrarme como:</span>
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === 'user'}
                  onChange={() => setRole('user')}
                  className="mr-2"
                />
                Pasajero
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="driver"
                  checked={role === 'driver'}
                  onChange={() => setRole('driver')}
                  className="mr-2"
                />
                Conductor
              </label>
            </div>
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
