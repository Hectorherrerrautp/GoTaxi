// public/utils.js

import maplibregl from 'maplibre-gl';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import { amazonLocationClient, AuthHelper } from '@aws/amazon-location-client';

/**
 * Inicializa el mapa con estilo Amazon Location Service.
 */
export function initializeMap({ container, apiKey, region, mapStyle = 'Standard', colorScheme = 'Dark' }) {
  const styleUrl = `https://maps.geo.${region}.amazonaws.com/v2/styles/${mapStyle}/descriptor?key=${apiKey}&color-scheme=${colorScheme}`;
  return new maplibregl.Map({
    container,
    style: styleUrl,
    center: [-123.116226, 49.246292],
    zoom: 10,
    validateStyle: false
  });
}

/**
 * Crea y devuelve una instancia de GeoPlaces para búsquedas.
 */
export function getGeoPlaces({ map, apiKey, region }) {
  const authHelper = amazonLocationClient.withAPIKey(apiKey, region);
  const clientConfig = authHelper.getClientConfig();
  const locationClient = new amazonLocationClient.GeoPlacesClient(clientConfig);
  return new amazonLocationClient.GeoPlaces({ client: locationClient, map });
}

/**
 * Renderiza contenido HTML para un popup.
 */
function renderPopup(feature) {
  return `
    <div class="popup-content">
      <span class="${feature.place_type.toLowerCase()} badge">${feature.place_type}</span><br/>
      ${feature.place_name}
    </div>
  `;
}

/**
 * Crea un popup en base a una feature de Places.
 */
function createPopup(feature) {
  return new maplibregl.Popup({ offset: 30 })
    .setLngLat(feature.geometry.coordinates)
    .setHTML(renderPopup(feature));
}

/**
 * Añade el cuadro de búsqueda (geocoder) al mapa.
 */
export function addSearchBox({ map, geoPlaces }) {
  const geocoder = new MaplibreGeocoder(geoPlaces, {
    maplibregl,
    showResultsWhileTyping: true,
    debounceSearch: 300,
    limit: 30,
    popuprender: renderPopup,
    reverseGeocode: true,
    zoom: 14,
    placeholder: 'Search text or nearby (lat,long)'
  });

  map.addControl(geocoder, 'top-left');

  geocoder.on('result', async ({ result }) => {
    if (result.result_type === 'Place') {
      const details = await geoPlaces.searchByPlaceId(result.id);
      if (details.features.length) {
        createPopup(details.features[0]).addTo(map);
      }
    }
  });
}

/**
 * Añade reverse-geocoding al hacer clic en el mapa.
 */
export function addMapClick({ map, geoPlaces }) {
  map.on('click', async ({ lngLat }) => {
    const resp = await geoPlaces.reverseGeocode({
      query: [lngLat.lng, lngLat.lat],
      limit: 1,
      click: true
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
