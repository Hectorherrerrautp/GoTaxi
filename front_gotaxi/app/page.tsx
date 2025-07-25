// front_gotaxi/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState<'user' | 'driver'>('user');
  const [error, setError]       = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí podrías validar email/password contra tu backend
    // y mostrar errores. Por ahora asumimos éxito:
    if (role === 'driver') {
      router.push('/driver');
    } else {
      router.push('/user');
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="w-full max-w-md p-6 bg-black shadow-lg rounded-lg">
        {/* Logo GoTaxi */}
        <div className="flex justify-center mb-4">
          <img
            src="/logotaxi.png"
            alt="GoTaxi Logo"
            className="w-20 h-20"
          />
        </div>

        <h2 className="text-white text-2xl font-bold mb-4 text-center">
          Inicio de sesión
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-white">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Correo electrónico"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-white">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Contraseña"
            />
          </div>

          {/* Selector de rol */}
          <div className="mb-4 text-white">
            <span className="block mb-2">Entrar como:</span>
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
