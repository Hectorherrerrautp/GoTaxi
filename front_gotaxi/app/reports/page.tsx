'use client';

import React, { useEffect, useState } from 'react';

type Viaje = {
  viajeId: string;
  origen: string;
  destino: string;
  estado: string;
  tarifa_estim?: number;
  distancia_km?: number;
  userId?: string;
};

export default function Reportes() {
  const [reportes, setReportes] = useState<{
    totalViajes: number;
    viajesEnEspera: number;
    viajesCompletados: number;
    historial: Viaje[];
  } | null>(null);

  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        const res = await fetch('https://012ghhm2ee.execute-api.us-east-1.amazonaws.com/dev/reportes');
        if (!res.ok) throw new Error('Error al obtener los reportes');
        const data = await res.json();
        setReportes(data);
      } catch (err) {
        if (err instanceof Error) {
          console.error(err.message);
          setError('No se pudieron cargar los reportes: ' + err.message);
        } else {
          console.error('Error desconocido');
          setError('Error desconocido');
        }
      }
    };

    fetchReportes();
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!reportes) return <p className="text-gray-700">Cargando reportes...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-yellow-600">Reportes de Viajes</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold text-gray-700">Total de Viajes</h2>
          <p className="text-2xl text-blue-600 font-bold">{reportes.totalViajes}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold text-gray-700">En Espera</h2>
          <p className="text-2xl text-yellow-600 font-bold">{reportes.viajesEnEspera}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold text-gray-700">Completados</h2>
          <p className="text-2xl text-green-600 font-bold">{reportes.viajesCompletados}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-yellow-500 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Viaje ID</th>
              <th className="px-4 py-2 text-left">Origen</th>
              <th className="px-4 py-2 text-left">Destino</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-left">Tarifa</th>
              <th className="px-4 py-2 text-left">Distancia (km)</th>
            </tr>
          </thead>
          <tbody>
            {reportes.historial.map((viaje) => (
              <tr key={viaje.viajeId} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{viaje.viajeId}</td>
                <td className="px-4 py-2">{viaje.origen}</td>
                <td className="px-4 py-2">{viaje.destino}</td>
                <td className="px-4 py-2">{viaje.estado}</td>
                <td className="px-4 py-2">${viaje.tarifa_estim?.toFixed(2) || '-'}</td>
                <td className="px-4 py-2">{viaje.distancia_km?.toFixed(2) || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
