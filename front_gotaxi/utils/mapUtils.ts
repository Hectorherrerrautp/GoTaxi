// utils/mapUtils.ts
import maplibregl from 'maplibre-gl';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';

const API_KEY = process.env.NEXT_PUBLIC_AMAZON_LOCATION_API_KEY!;
const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION!;

/** Inicializa el mapa */
export function initializeMap(
  container: string | HTMLElement,
  mapStyle = 'Standard',
  colorScheme = 'Light'
) {
  const styleUrl = `https://maps.geo.${AWS_REGION}.amazonaws.com/v2/styles/${mapStyle}/descriptor?key=${API_KEY}&color-scheme=${colorScheme}`;
  const map = new maplibregl.Map({
    container,
    style: styleUrl,
    center: [-79.5167, 8.98332],
    zoom: 10,
  });
  map.addControl(new maplibregl.NavigationControl());
  return map;
}

/** Crea instancia de GeoPlaces */
export function getGeoPlaces(map: maplibregl.Map) {
  // @ts-ignore: el bundle UMD inyecta amazonLocationClient
  const authHelper = amazonLocationClient.withAPIKey(API_KEY, AWS_REGION);
  // @ts-ignore
  const locationClient = new amazonLocationClient.GeoPlacesClient(
    authHelper.getClientConfig()
  );
  // @ts-ignore
  return new GeoPlaces(locationClient, map);
}

/** Agrega buscador de lugares */
export function addSearchBox(map: maplibregl.Map, geoPlaces: any) {
  const geocoder = new MaplibreGeocoder(geoPlaces, {
    maplibregl,
    showResultsWhileTyping: true,
    debounceSearch: 300,
    limit: 30,
    popuprender: renderPopup,
    reverseGeocode: true,
    zoom: 14,
    placeholder: 'Buscar dirección o (lat,long)',
  });
  map.addControl(geocoder, 'top-left');

  geocoder.on('result', async (e: any) => {
    if (e.result.result_type === 'Place') {
      const placeResults = await geoPlaces.searchByPlaceId(e.result.id);
      if (placeResults.features.length) {
        createPopup(placeResults.features[0]).addTo(map);
      }
    }
  });
}

/** Renderiza contenido de popup */
export function renderPopup(feature: any) {
  return `
    <div class="popup-content">
      <span class="${feature.place_type.toLowerCase()} badge">
        ${feature.place_type}
      </span><br>
      ${feature.place_name}
    </div>`;
}

/** Crea Popup genérico */
export function createPopup(feature: any) {
  return new maplibregl.Popup({ offset: 30 })
    .setLngLat(feature.geometry.coordinates)
    .setHTML(renderPopup(feature));
}

/** Habilita reverse-geocode al click */
export function addMapClick(map: maplibregl.Map, geoPlaces: any) {
  map.on('click', async ({ lngLat }) => {
    const resp = await geoPlaces.reverseGeocode({
      query: [lngLat.lng, lngLat.lat],
      limit: 1,
      click: true,
    });
    if (resp.features.length) {
      const feature = resp.features[0];
      const marker = new maplibregl.Marker({ color: 'orange' })
        .setLngLat(feature.geometry.coordinates)
        .setPopup(createPopup(feature))
        .addTo(map);
      marker.getPopup().on('close', () => marker.remove());
    }
  });
}
