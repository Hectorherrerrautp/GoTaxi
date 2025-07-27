'use client';

import React, { useState, useEffect } from 'react';
import Map from '../../components/Map';

// Haversine
function haversineDistance(
  a: [number, number],
  b: [number, number]
): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const R = 6371;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

const API_BASE = 'https://012ghhm2ee.execute-api.us-east-1.amazonaws.com/dev';

export default function HomePage() {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<[number, number] | null>(null);
  const [fare, setFare] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [viajeId, setViajeId] = useState<string | null>(null);

  const baseFare = 2.5;
  const ratePerKm = 1.2;

  // Recalcular tarifa
  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      const d = haversineDistance(pickupCoords, dropoffCoords);
      setFare(baseFare + d * ratePerKm);
    } else {
      setFare(null);
      setStatus(null);
      setViajeId(null);
    }
  }, [pickupCoords, dropoffCoords]);

  // Polling de estado
  useEffect(() => {
    if (!viajeId) return;

    // usar window.setInterval para que devuelva number
    const iv = window.setInterval(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/solicitar-viaje?viajeId=${viajeId}`
        );
        if (!res.ok) {
          console.error('Status polling error:', res.status);
          return;
        }
        const json = await res.json();
        const nuevoEstado = json.item.estado;
        setStatus(nuevoEstado);

        // Si ya no está en "en_espera", limpiamos el intervalo
        if (nuevoEstado !== 'en_espera') {
          window.clearInterval(iv);
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    }, 5000);

    // llamada inicial
    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/solicitar-viaje?viajeId=${viajeId}`
        );
        if (res.ok) {
          const json = await res.json();
          setStatus(json.item.estado);
        }
      } catch {}
    })();

    return () => {
      window.clearInterval(iv);
    };
  }, [viajeId]);

  const solicitarViaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupCoords || !dropoffCoords) {
      alert('Selecciona origen y destino');
      return;
    }
    const dist = haversineDistance(pickupCoords, dropoffCoords);
    const estFare = baseFare + dist * ratePerKm;

    try {
      const res = await fetch(`${API_BASE}/solicitar-viaje`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'usuario123',
          origen: pickup,
          destino: dropoff,
          origenCoords: pickupCoords,
          destinoCoords: dropoffCoords,
          distancia_km: dist,
          tarifa_estim: estFare,
        }),
      });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setViajeId(data.viajeId);
      setStatus(data.estado);
      alert(`Tu viaje está en estado: ${data.estado}`);
    } catch (err) {
      console.error('Error al solicitar:', err);
      alert('Error al solicitar el viaje.');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-4 bg-black shadow-md">
        <div className="flex items-center">
          <img src="/logogotaxi.png" alt="Logo" className="w-8 h-8" />
          <span className="ml-2 text-2xl font-bold text-yellow-500">GoTaxi</span>
        </div>
        <nav>
          <a href="/reports" className="text-white">Reportes</a>
        </nav>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <aside className="w-full max-w-sm bg-white m-6 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Get a ride</h2>
          <form onSubmit={solicitarViaje} className="space-y-4">
            <div className="border rounded px-3 py-2">
              <input
                type="text"
                placeholder="Pickup location"
                value={pickup}
                readOnly
                className="w-full"
              />
            </div>
            <div className="border rounded px-3 py-2">
              <input
                type="text"
                placeholder="Dropoff location"
                value={dropoff}
                readOnly
                className="w-full"
              />
            </div>
            {fare != null && (
              <p>
                Dist: {haversineDistance(pickupCoords!, dropoffCoords!).toFixed(2)} km — Costo: ${fare.toFixed(2)}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-yellow-500 text-white py-2 rounded-lg"
            >
              Pedir Viaje
            </button>
          </form>
          {status && (
            <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded">
              <strong>Estado:</strong> {status}
            </div>
          )}
        </aside>

        <div className="flex-1 m-6 rounded-lg overflow-hidden">
          <Map
            onSetPickup={(addr, coords) => {
              setPickup(addr);
              setPickupCoords(coords);
            }}
            onSetDropoff={(addr, coords) => {
              setDropoff(addr);
              setDropoffCoords(coords);
            }}
          />
        </div>
      </main>
    </div>
  );
}
