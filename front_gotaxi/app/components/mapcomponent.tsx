"use client";  // ← con esto marcas el componente como cliente

import { useEffect, useState } from 'react';
import { LocationClient, GetMapTileURLCommand } from '@aws-sdk/client-location';

const locationClient = new LocationClient({
  region: 'us-east-1', // tu región
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,    // usa variables de entorno
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  },
});

export default function MapComponent() {
  const [mapUrl, setMapUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapTile = async () => {
      try {
        const command = new GetMapTileURLCommand({
          MapName: 'GoTaxi-API-Key', // reemplaza con el nombre de tu mapa
          X: 0,
          Y: 0,
          Z: 2,
        });
        const data = await locationClient.send(command);
        setMapUrl(data.TileURL);
      } catch (err) {
        console.error('Error fetching map tile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMapTile();
  }, []);

  return (
    <div className="relative w-full h-full bg-gray-300 rounded-md">
      {loading
        ? <p className="p-4 text-center">Cargando mapa...</p>
        : <img src={mapUrl} alt="Amazon Location Map" className="w-full h-full object-cover rounded-md" />}
    </div>
  );
}
