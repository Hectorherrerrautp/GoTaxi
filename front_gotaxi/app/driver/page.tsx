'use client';

import { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl'; // Import necesario
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

type SolicitudesResponse = Viaje[] | { items: Viaje[] };

const API_BASE = 'https://012ghhm2ee.execute-api.us-east-1.amazonaws.com/dev';

export default function DriverHome() {
  const [solicitudes, setSolicitudes] = useState<Viaje[]>([]);
  const [activa, setActiva] = useState<Viaje | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // 1) Polling de solicitudes pendientes
  const fetchSolicitudes = async () => {
    try {
      const res = await fetch(`${API_BASE}/solicitar-viaje?estado=en_espera`);
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

  // 2) Inicializar mapa y arrancar polling
  useEffect(() => {
    const map = initializeMap('map', 'Standard', 'Light');
    mapRef.current = map;

    // Mostrar ubicación del conductor
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const current: [number, number] = [coords.longitude, coords.latitude];
        map.setCenter(current);

        // Agregar marcador de ubicación
        new maplibregl.Marker({ color: 'green' })
          .setLngLat(current)
          .addTo(map);
      },
      (err) => console.error('Error al obtener ubicación del conductor:', err),
      { enableHighAccuracy: true }
    );

    fetchSolicitudes();
    const interval = setInterval(fetchSolicitudes, 10000);

    return () => {
      map.remove();
      clearInterval(interval);
    };
  }, []);

  // 3) Aceptar viaje
  const aceptarViaje = (viaje: Viaje) => {
    fetch(`${API_BASE}/solicitar-viaje`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        viajeId: viaje.viajeId,
        conductorId: 'cond123',
        nuevoEstado: 'en_curso',
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        setSolicitudes((prev) =>
          prev.filter((v) => v.viajeId !== viaje.viajeId)
        );
        setActiva({ ...viaje, estado: 'en_curso' });

        // Ruta desde ubicación actual al origen
        navigator.geolocation.getCurrentPosition(
          async ({ coords }) => {
            const current: [number, number] = [
              coords.longitude,
              coords.latitude,
            ];
            if (mapRef.current) {
              const geo = await getRoute(current, viaje.origenCoords);
              drawRoute(mapRef.current, geo);
            }
          },
          (err) => console.error('Geo error', err),
          { enableHighAccuracy: true }
        );
      })
      .catch((err) => console.error('Error al aceptar viaje:', err));
  };

  // 4) Iniciar transporte: origen → destino
  const iniciarTransporte = async () => {
    if (!activa || !mapRef.current) return;
    try {
      const geo = await getRoute(activa.origenCoords, activa.destinoCoords);
      drawRoute(mapRef.current, geo);
    } catch (err) {
      console.error('Error al trazar ruta al destino:', err);
    }
  };

  // 5) Rechazar viaje
  const rechazarViaje = (viajeId: string) => {
    fetch(`${API_BASE}/solicitar-viaje`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ viajeId, nuevoEstado: 'rechazado' }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        setSolicitudes((prev) =>
          prev.filter((v) => v.viajeId !== viajeId)
        );
      })
      .catch((err) => console.error('Error al rechazar viaje:', err));
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
      <main className="flex flex-1">
        <aside className="w-80 bg-black p-4 overflow-auto text-white">
          <h2 className="text-lg font-semibold mb-2">Solicitudes</h2>

          {activa && (
            <div className="p-2 bg-yellow-500 text-black rounded mb-4">
              <strong>Viaje activo:</strong> {activa.viajeId}
              <br /><br />
              <span>
                <strong>De:</strong><br /> {activa.origen}<br /><br />
                <strong>Hasta:</strong><br /> {activa.destino}<br />
              </span>
              <button
                onClick={iniciarTransporte}
                className="mt-2 px-2 py-1 text-sm bg-white text-black rounded"
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
              <p><strong>ID:</strong> {v.viajeId}</p>
              <p><strong>Origen:</strong> {v.origen}</p>
              <p><strong>Destino:</strong> {v.destino}</p>
              <p><strong>Tarifa:</strong> ${v.tarifa_estim.toFixed(2)}</p>
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => aceptarViaje(v)}
                  className="px-2 py-1 bg-yellow-500 text-black rounded"
                >
                  Aceptar
                </button>
                <button
                  onClick={() => rechazarViaje(v.viajeId)}
                  className="px-2 py-1 bg-white text-black rounded"
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
