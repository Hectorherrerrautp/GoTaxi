'use client';

import { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { initializeMap, getRoute, drawRoute } from '../../utils/mapUtils';

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

const API_BASE =
  'https://012ghhm2ee.execute-api.us-east-1.amazonaws.com/dev';

export default function DriverHome() {
  const [solicitudes, setSolicitudes] = useState<Viaje[]>([]);
  const [activa, setActiva] = useState<Viaje | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  /* ───────────────────────────────────────────── Polling solicitudes */
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
    } catch (err) {
      console.error('Error fetching solicitudes', err);
    }
  };

  /* ───────────────────────────────────────────── Mapa + polling */
  useEffect(() => {
    const map = initializeMap('map', 'Standard', 'Light');
    mapRef.current = map;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const current: [number, number] = [coords.longitude, coords.latitude];
        map.setCenter(current);
        new maplibregl.Marker({ color: 'green' }).setLngLat(current).addTo(map);
      },
      (err) => console.error('Geo error', err),
      { enableHighAccuracy: true },
    );

    fetchSolicitudes();
    const interval = setInterval(fetchSolicitudes, 10000);
    return () => {
      map.remove();
      clearInterval(interval);
    };
  }, []);

  /* ───────────────────────────────────────────── Aceptar viaje  */
  const aceptarViaje = (viaje: Viaje) => {
    fetch(`${API_BASE}/solicitar-viaje`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        viajeId: viaje.viajeId,
        conductorId: 'cond123',
        nuevoEstado: 'aceptado', // ← ahora “aceptado”
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);

        setSolicitudes((prev) =>
          prev.filter((v) => v.viajeId !== viaje.viajeId),
        );
        setActiva({ ...viaje, estado: 'aceptado' });

        /* Ruta hasta el punto de recogida */
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
          { enableHighAccuracy: true },
        );
      })
      .catch((err) => console.error('Error al aceptar viaje:', err));
  };

  /* ───────────────────────────────────────────── Iniciar transporte */
  const iniciarTransporte = async () => {
    if (!activa || !mapRef.current) return;
    try {
      /* 1) Cambiar estado a “en_curso” */
      await fetch(`${API_BASE}/solicitar-viaje`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viajeId: activa.viajeId,
          nuevoEstado: 'en_curso',
        }),
      });
      setActiva({ ...activa, estado: 'en_curso' });

      /* 2) Trazar ruta origen → destino */
      const geo = await getRoute(activa.origenCoords, activa.destinoCoords);
      drawRoute(mapRef.current, geo);
    } catch (err) {
      console.error('Error al iniciar transporte:', err);
    }
  };

  /* ───────────────────────────────────────────── Finalizar viaje */
  const finalizarViaje = async () => {
    if (!activa) return;
    try {
      const res = await fetch(`${API_BASE}/solicitar-viaje`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viajeId: activa.viajeId,
          nuevoEstado: 'finalizado',
        }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);

      setActiva(null);
      setSolicitudes([]); // refresco en próximo polling

      /* Limpia ruta del mapa */
      if (mapRef.current) {
        mapRef.current.getLayer('route') && mapRef.current.removeLayer('route');
        mapRef.current.getSource('route') &&
          mapRef.current.removeSource('route');
      }
    } catch (err) {
      console.error('Error al finalizar viaje:', err);
    }
  };

  /* ───────────────────────────────────────────── Rechazar */
  const rechazarViaje = (viajeId: string) => {
    fetch(`${API_BASE}/solicitar-viaje`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ viajeId, nuevoEstado: 'rechazado' }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        setSolicitudes((prev) => prev.filter((v) => v.viajeId !== viajeId));
      })
      .catch((err) => console.error('Error al rechazar viaje:', err));
  };

  /* ───────────────────────────────────────────── UI */
  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-4 bg-black shadow-md">
        <div className="flex items-center">
          <img src="/logogotaxi.png" alt="GoTaxi Logo" className="w-8 h-8" />
          <span className="ml-2 text-2xl font-bold text-yellow-500">GoTaxi</span>
        </div>
        <nav>
          <a
            href="/reports"
            className="text-white hover:text-gray-300 font-medium"
          >
            Reportes
          </a>
        </nav>
        <div className="w-8 h-8 rounded-full overflow-hidden">
          <img
            src="/userloo.png"
            alt="Perfil"
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      <main className="flex flex-1">
        {/* Panel lateral */}
        <aside className="w-80 bg-black p-4 overflow-auto text-white">
          <h2 className="text-lg font-semibold mb-2">Solicitudes</h2>

          {/* Viaje activo */}
          {activa && (
            <div className="p-2 bg-yellow-500 text-black rounded mb-4">
              <strong>Viaje activo:</strong> {activa.viajeId}
              <br />
              <span className="text-sm">
                Estado: {activa.estado}
                <br />
                <br />
                <strong>De:</strong> {activa.origen}
                <br />
                <strong>Hasta:</strong> {activa.destino}
              </span>
              {/* Botones contextuales */}
              {activa.estado === 'aceptado' && (
                <button
                  onClick={iniciarTransporte}
                  className="mt-3 w-full px-2 py-1 text-sm bg-white text-black rounded"
                >
                  Iniciar transporte
                </button>
              )}
              {activa.estado === 'en_curso' && (
                <button
                  onClick={finalizarViaje}
                  className="mt-3 w-full px-2 py-1 text-sm bg-black text-white rounded"
                >
                  Finalizar viaje
                </button>
              )}
            </div>
          )}

          {/* Nuevas solicitudes */}
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

        {/* Mapa */}
        <div id="map" className="flex-1" />
      </main>
    </div>
  );
}
