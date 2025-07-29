'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut }   from 'aws-amplify/auth';   // v6 API

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();          // cierra sesión Cognito
    router.push('/');    // vuelve al login
  };

  return (
    <div className="relative">
      {/* avatar */}
      <div
        className="w-8 h-8 rounded-full overflow-hidden cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <img
          src="/userloo.png"
          alt="Perfil"
          className="w-full h-full object-cover"
        />
      </div>

      {/* dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg z-50"
        >
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
