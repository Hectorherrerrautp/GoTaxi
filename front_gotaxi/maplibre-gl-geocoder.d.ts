// maplibre-gl-geocoder.d.ts
declare module '@maplibre/maplibre-gl-geocoder' {
  import { Control } from 'maplibre-gl';

  /** Opciones mínimas para el geocoder */
  interface GeocoderOptions {
    maplibregl?: any;
    showResultsWhileTyping?: boolean;
    debounceSearch?: number;
    limit?: number;
    popuprender?: (feature: any) => string;
    reverseGeocode?: boolean;
    zoom?: number;
    placeholder?: string;
  }

  /**
   * El constructor acepta:
   *   1) geoPlacesService: instancia de GeoPlaces (Amazon Location)
   *   2) opts: configuración del geocoder
   */
  class MaplibreGeocoder extends Control {
    constructor(geoPlacesService: any, opts?: GeocoderOptions);
  }

  export default MaplibreGeocoder;
}
