//mapUtils.ts
import maplibregl, { IControl } from 'maplibre-gl';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';

declare const amazonLocationClient: any;
declare const GeoPlaces: any;

const API_KEY = process.env.NEXT_PUBLIC_AMAZON_LOCATION_API_KEY!;
const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION!;
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export function initializeMap(
  container: string | HTMLElement,
  mapStyle = 'Standard',
  colorScheme = 'Light'
): maplibregl.Map {
  const styleUrl =
    `https://maps.geo.${AWS_REGION}.amazonaws.com/v2/styles/${mapStyle}/descriptor?key=${API_KEY}&color-scheme=${colorScheme}`;
  const map = new maplibregl.Map({ container, style: styleUrl, center: [-79.5167, 8.98332], zoom: 10 });
  map.addControl(new maplibregl.NavigationControl());
  return map;
}

export function getGeoPlaces(map: maplibregl.Map): any {
  const authHelper = amazonLocationClient.withAPIKey(API_KEY, AWS_REGION);
  const locationClient = new amazonLocationClient.GeoPlacesClient(authHelper.getClientConfig());
  return new GeoPlaces(locationClient, map);
}

export async function getRoute(
  start: [number, number],
  end: [number, number]
): Promise<GeoJSON.LineString> {
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Route error: ${res.status}`);
  const { routes } = await res.json();
  return routes[0].geometry;
}

export function drawRoute(
  map: maplibregl.Map | undefined,
  geometry: GeoJSON.LineString
): void {
  if (!map || typeof map.getSource !== 'function') {
    console.warn('drawRoute: map inválido o no inicializado');
    return;
  }
  const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = { type: 'Feature', geometry, properties: {} };
  const src = map.getSource('route') as maplibregl.GeoJSONSource;
  if (src) {
    src.setData(routeGeoJSON);
  } else {
    map.addSource('route', { type: 'geojson', data: routeGeoJSON });
    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#3887be', 'line-width': 5 },
    });
  }
}

export function addSearchBox(map: maplibregl.Map, geoPlaces: any): void {
  const geocoder: unknown = new MaplibreGeocoder(geoPlaces, {
    maplibregl,
    showResultsWhileTyping: true,
    debounceSearch: 300,
    limit: 30,
    popuprender: renderPopup,
    reverseGeocode: true,
    zoom: 14,
    placeholder: 'Buscar dirección o (lat,long)',
  });
  map.addControl(geocoder as IControl, 'top-left');
  (geocoder as any).on('result', async (e: any) => {
    if (e.result.result_type === 'Place') {
      const placeResults = await geoPlaces.searchByPlaceId(e.result.id);
      if (placeResults.features.length) createPopup(placeResults.features[0]).addTo(map);
    }
  });
}

export function renderPopup(feature: any): string {
  return `<div class="popup-content"><span class="${feature.place_type.toLowerCase()} badge">${feature.place_type}</span><br>${feature.place_name}</div>`;
}

export function createPopup(feature: any): maplibregl.Popup {
  return new maplibregl.Popup({ offset: 30 }).setLngLat(feature.geometry.coordinates).setHTML(renderPopup(feature));
}