// app/reports/page.tsx
'use client';

import { useEffect, useState } from 'react';

interface Viaje {
  viajeId: string;
  origen: string;
  destino: string;
  costo: number;          // ① cambia la interfaz
}

export default function ReportesPage() {
  const [totalDinero, setTotalDinero] = useState<number | null>(null);
  const [countTotal, setCountTotal]   = useState<number | null>(null);
  const [historial,  setHistorial]    = useState<Viaje[]>([]);
  const [loading,    setLoading]      = useState(true);
  const [error,      setError]        = useState('');

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) { setError('NEXT_PUBLIC_API_URL no definida'); setLoading(false); return; }

    (async () => {
      try {
        const [dineroRes, totalRes, histRes] = await Promise.all([
          fetch(`${api}/reportes/today`),     // totalDinero
          fetch(`${api}/reportes/total`),     // countTotal
          fetch(`${api}/reportes/historial`)  // historial con costo
        ]);
        if (!dineroRes.ok || !totalRes.ok || !histRes.ok)
          throw new Error('Error al cargar los reportes');

        const { totalDinero } = await dineroRes.json();
        const { countTotal }  = await totalRes.json();
        const hist            = await histRes.json() as Viaje[];

        setTotalDinero(totalDinero);
        setCountTotal(countTotal);
        setHistorial(hist);
      } catch (e) {
        setError((e as Error).message);
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="p-8 text-center">Cargando reportes…</div>;
  if (error)   return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-semibold">Reportes de Viajes</h1>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-black shadow rounded">
          <p className="text-yellow-500">Dinero total gastado</p>
          <p className="text-3xl font-bold">
            {totalDinero?.toLocaleString('es-PA', { style: 'currency', currency: 'USD' }) ?? '—'}
          </p>
        </div>
        <div className="p-4 bg-black shadow rounded">
          <p className="text-yellow-500">Total de viajes</p>
          <p className="text-3xl font-bold">{countTotal ?? '—'}</p>
        </div>
      </div>

      {/* Historial */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Historial de Viajes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-black rounded shadow text-yellow-500">
            <thead>
              <tr className="bg-black">
                <th className="px-4 py-2 text-left text-sm font-medium">ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Origen</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Destino</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Costo (USD)</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((v) => (
                <tr key={v.viajeId} className="border-t hover:bg-gray-800">
                  <td className="px-4 py-2 text-sm">{v.viajeId}</td>
                  <td className="px-4 py-2 text-sm">{v.origen}</td>
                  <td className="px-4 py-2 text-sm">{v.destino}</td>
                  <td className="px-4 py-2 text-sm">
                    {v.costo.toLocaleString('es-PA', { style: 'currency', currency: 'USD' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
