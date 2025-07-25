// amplify/backend/function/SolicitarViaje/src/index.js
let viajes = [];  // **** array en memoria para demo ****

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
  // 1) Preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  // 2) GET /solicitar-viaje?estado=en_espera
  if (event.httpMethod === 'GET') {
    const estado = event.queryStringParameters?.estado;
    const lista = estado
      ? viajes.filter((v) => v.estado === estado)
      : viajes;
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(lista),
    };
  }

  // 3) POST crea nueva solicitud
  if (event.httpMethod === 'POST') {
    const { userId, origen, destino, origenCoords, destinoCoords, distancia_km, tarifa_estim } = JSON.parse(event.body);
    const nuevo = {
      viajeId: `viaje_${Date.now()}`,
      userId,
      origen,
      destino,
      origenCoords,
      destinoCoords,
      distancia_km,
      tarifa_estim,
      estado: 'en_espera',
    };
    viajes.push(nuevo);
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(nuevo),
    };
  }

  // 4) Otros métodos
  return { statusCode: 405, headers: CORS_HEADERS, body: '' };
};
