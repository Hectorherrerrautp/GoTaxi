// components/Map.tsx
'use client';

import { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import {
  initializeMap,
  getGeoPlaces,
  addSearchBox,
  getRoute,
  drawRoute,
} from '../utils/mapUtils';

interface MapProps {
  onSetPickup: (addr: string, coords: [number, number]) => void;
  onSetDropoff: (addr: string, coords: [number, number]) => void;
}

export default function Map({ onSetPickup, onSetDropoff }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef<{ pickup?: [number, number]; dropoff?: [number, number] }>({});
  const mapRef = useRef<maplibregl.Map | null>(null);
  const pickupMarkerRef = useRef<maplibregl.Marker | null>(null);
  const dropoffMarkerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = initializeMap(containerRef.current, 'Standard', 'Light');
    mapRef.current = map;

    const geolocateControl = new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: false });
    map.addControl(geolocateControl, 'top-right');
    map.once('load', () => geolocateControl.trigger());
    geolocateControl.on('geolocate', async (pos) => {
      const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
      map.flyTo({ center: coords, zoom: 15 });
      const geoPlaces = getGeoPlaces(map);
      const res = await geoPlaces.reverseGeocode({ query: coords, limit: 1, click: true });
      if (res.features.length) {
        const feature = res.features[0];
        pickupMarkerRef.current = new maplibregl.Marker({ color: 'green' }).setLngLat(coords).addTo(map);
        coordsRef.current.pickup = coords;
        onSetPickup(feature.place_name, coords);
      }
    });

    const geoPlaces = getGeoPlaces(map);
    addSearchBox(map, geoPlaces);

    map.on('click', async ({ lngLat }) => {
      const m = mapRef.current!;
      const resp = await geoPlaces.reverseGeocode({ query: [lngLat.lng, lngLat.lat], limit: 1, click: true });
      if (!resp.features.length) return;
      const feat = resp.features[0];
      // Asumimos que feat.geometry.coordinates es [number, number]
      const c = feat.geometry.coordinates as [number, number];

      if (!coordsRef.current.pickup) {
        coordsRef.current.pickup = c;
        pickupMarkerRef.current = new maplibregl.Marker({ color: 'green' }).setLngLat(c).addTo(m);
        onSetPickup(feat.place_name, c);
        return;
      }
      if (!coordsRef.current.dropoff) {
        coordsRef.current.dropoff = c;
        dropoffMarkerRef.current = new maplibregl.Marker({ color: 'red' }).setLngLat(c).addTo(m);
        onSetDropoff(feat.place_name, c);
        try {
          const g = await getRoute(coordsRef.current.pickup, coordsRef.current.dropoff);
          drawRoute(m, g);
        } catch {
          // Ignorar errores de ruta
        }
        return;
      }

      // Reemplazar dropoff existente
      dropoffMarkerRef.current?.remove();
      if (m.getLayer('route')) m.removeLayer('route');
      if (m.getSource('route')) m.removeSource('route');
      coordsRef.current.dropoff = c;
      dropoffMarkerRef.current = new maplibregl.Marker({ color: 'red' }).setLngLat(c).addTo(m);
      onSetDropoff(feat.place_name, c);
      try {
        const g = await getRoute(coordsRef.current.pickup, coordsRef.current.dropoff);
        drawRoute(m, g);
      } catch {
        // Ignorar errores de ruta
      }
    });

    return () => map.remove();
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full rounded-lg"
      style={{ minHeight: '300px' }}
    />
  );
}
