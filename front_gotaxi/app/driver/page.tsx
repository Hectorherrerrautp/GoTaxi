// app/driver/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  initializeMap,
  getRoute,
  drawRoute,
} from '../../utils/mapUtils';

interface Viaje {
  viajeId: string;
  userId: string;
  origen: string;
  destino: string;
  origenCoords: [number, number];
  destinoCoords: [number, number];
  tarifa_estim: number;
  estado: string;
}

// Puede llegar o bien un array directo de Viaje, o un objeto con campo items
type SolicitudesResponse = Viaje[] | { items: Viaje[] };

const API_BASE = 'https://012ghhm2ee.execute-api.us-east-1.amazonaws.com/dev';

export default function DriverHome() {
  const [solicitudes, setSolicitudes] = useState<Viaje[]>([]);
  const [activa, setActiva] = useState<Viaje | null>(null);
  const mapRef = useRef<ReturnType<typeof initializeMap> | null>(null);

  // 1) Polling de solicitudes pendientes
  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const res = await fetch(`${API_BASE}/SolicitarViaje?estado=en_espera`);
        const data = (await res.json()) as SolicitudesResponse;
        const arr: Viaje[] = Array.isArray(data)
          ? data
          : Array.isArray(data.items)
            ? data.items
            : [];
        setSolicitudes(arr);
      } catch (err: unknown) {
        console.error('Error fetching solicitudes', err);
      }
    };

    fetchSolicitudes();
    const interval = setInterval(fetchSolicitudes, 10_000);
    return () => clearInterval(interval);
  }, []);

  // 2) Inicializar mapa
  useEffect(() => {
    const map = initializeMap('map', 'Standard', 'Light');
    mapRef.current = map;
    return () => map.remove();
  }, []);

  // 3) Aceptar viaje
  const aceptarViaje = (viaje: Viaje) => {
    fetch(`${API_BASE}/SolicitarViaje`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        viajeId: viaje.viajeId,
        conductorId: 'cond123',
        nuevoEstado: 'en_curso',
      }),
    })
      .then(() => {
        setActiva(viaje);
        navigator.geolocation.getCurrentPosition(
          async ({ coords }) => {
            const currentCoords: [number, number] = [
              coords.longitude,
              coords.latitude,
            ];
            if (mapRef.current) {
              const geo = await getRoute(currentCoords, viaje.origenCoords);
              drawRoute(mapRef.current, geo);
            }
          },
          (geoError) => {
            console.error('Error al obtener ubicación', geoError);
          },
          { enableHighAccuracy: true }
        );
      })
      .catch((err: unknown) => console.error('Error al aceptar viaje', err));
  };

  // 4) Iniciar transporte: ruta recogida → destino
  const iniciarTransporte = async () => {
    if (!activa || !mapRef.current) return;
    try {
      const geo = await getRoute(activa.origenCoords, activa.destinoCoords);
      drawRoute(mapRef.current, geo);
    } catch (err: unknown) {
      console.error('Error al trazar ruta al destino', err);
    }
  };

  // 5) Rechazar viaje
  const rechazarViaje = (viajeId: string) => {
    fetch(`${API_BASE}/SolicitarViaje`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ viajeId, nuevoEstado: 'rechazado' }),
    })
      .then(() =>
        setSolicitudes((prev) =>
          prev.filter((v) => v.viajeId !== viajeId)
        )
      )
      .catch((err: unknown) =>
        console.error('Error al rechazar viaje', err)
      );
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="px-6 py-4 bg-black text-white">Panel Conductor</header>
      <main className="flex flex-1">
        <aside className="w-80 bg-white p-4 overflow-auto">
          <h2 className="text-lg font-semibold mb-2">Solicitudes</h2>

          {activa && (
            <div className="p-2 bg-green-100 rounded mb-4">
              <strong>Viaje activo:</strong> {activa.viajeId}
              <button
                onClick={iniciarTransporte}
                className="ml-2 text-sm text-blue-600"
              >
                Iniciar transporte
              </button>
            </div>
          )}

          {solicitudes.length === 0 && !activa && (
            <p>No hay solicitudes pendientes.</p>
          )}

          {solicitudes.map((v) => (
            <div key={v.viajeId} className="border-b pb-2 mb-2">
              <p>
                <strong>ID:</strong> {v.viajeId}
              </p>
              <p>
                <strong>Origen:</strong> {v.origen}
              </p>
              <p>
                <strong>Destino:</strong> {v.destino}
              </p>
              <p>
                <strong>Tarifa:</strong> ${v.tarifa_estim.toFixed(2)}
              </p>
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => aceptarViaje(v)}
                  className="px-2 py-1 bg-green-500 text-white rounded"
                >
                  Aceptar
                </button>
                <button
                  onClick={() => rechazarViaje(v.viajeId)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </aside>
        <div id="map" className="flex-1" />
      </main>
    </div>
  );
}
