'use client';
import { useRef, useEffect } from 'react';
import {
  initializeMap,
  getGeoPlaces,
  addSearchBox,
  addMapClick,
} from '@/utils/mapUtils';

export default function Map() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const map = initializeMap(ref.current, 'Standard', 'Light');
    const geoPlaces = getGeoPlaces(map);
    addSearchBox(map, geoPlaces);
    addMapClick(map, geoPlaces);
    return () => map.remove();
  }, []);

  return (
    <div
      ref={ref}
      className="h-full w-full rounded-lg"
      style={{ minHeight: '300px' }}
    />
  );
}
