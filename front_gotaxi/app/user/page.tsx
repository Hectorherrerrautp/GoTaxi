'use client';

import React, { useState, useEffect } from 'react';
import Map from '../../components/Map';

// Calcula distancia entre dos coordenadas usando la fórmula de Haversine
function haversineDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function HomePage() {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<[number, number] | null>(null);
  const [fare, setFare] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const baseFare = 2.5;
  const ratePerKm = 1.2;

  // Calcula tarifa estimada al cambiar coords
  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      const dist = haversineDistance(pickupCoords, dropoffCoords);
      setFare(baseFare + dist * ratePerKm);
    } else {
      setFare(null);
      setStatus(null);
    }
  }, [pickupCoords, dropoffCoords]);

  // Solicita viaje al backend
  const solicitarViaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupCoords || !dropoffCoords) return alert('Selecciona origen y destino');

    try {
      const dist = haversineDistance(pickupCoords, dropoffCoords);
      const response = await fetch(
        'https://012ghhm2ee.execute-api.us-east-1.amazonaws.com/dev/solicitar-viaje',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'usuario123',
            origen: pickup,
            destino: dropoff,
            origenCoords: pickupCoords,
            destinoCoords: dropoffCoords,
            distancia_km: dist,
            tarifa_estim: fare,
          }),
        }
      );
      const data = await response.json();
      setStatus(data.estado);
      alert(`Tu viaje está en estado: ${data.estado}`);
    } catch (error) {
      console.error('Error al solicitar el viaje:', error);
      alert('Error al solicitar el viaje.');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-4 bg-black shadow-md">
        <div className="flex items-center">
          <img src="/logogotaxi.png" alt="GoTaxi Logo" className="w-8 h-8" />
          <span className="ml-2 text-2xl font-bold text-yellow-500">GoTaxi</span>
        </div>
        <nav>
          <a href="/reports" className="text-white hover:text-gray-300 font-medium">Reportes</a>
        </nav>
        <div className="w-8 h-8 rounded-full overflow-hidden">
          <img src="/userloo.png" alt="Perfil" className="w-full h-full object-cover" />
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <aside className="w-full max-w-sm bg-white m-6 p-4 rounded-lg shadow-lg">
          <h2 className="text-black text-xl font-semibold mb-4">Get a ride</h2>
          <form className="space-y-4" onSubmit={solicitarViaje}>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <input
                type="text"
                placeholder="Pickup location"
                value={pickup}
                readOnly
                className="w-full focus:outline-none text-gray-600"
              />
            </div>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <input
                type="text"
                placeholder="Dropoff location"
                value={dropoff}
                readOnly
                className="w-full focus:outline-none text-gray-600"
              />
            </div>
            {fare !== null && (
              <p className="text-gray-700">
                Dist: {haversineDistance(pickupCoords!, dropoffCoords!).toFixed(2)} km — Costo: ${fare.toFixed(2)}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600 transition"
            >
              Pedir Viaje
            </button>
          </form>
          {status && (
            <div className="mt-4 p-4 bg-blue-100 text-blue-800 rounded">
              <strong>Estado del viaje:</strong> {status}
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
