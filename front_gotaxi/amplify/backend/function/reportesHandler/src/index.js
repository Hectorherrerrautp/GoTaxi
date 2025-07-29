// reportesHandler – Lambda Node.js 22
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

// Amplify siempre inyecta STORAGE_<tableResource>_NAME.
// Si además añadiste “ViajesTableName” como variable extra,
// mantenemos ambos por compatibilidad.
const TABLE =
  process.env.STORAGE_VIAJESDB_NAME || process.env.ViajesTableName;

const client = new DynamoDBClient({});

// Helpers para respuestas HTTP
const ok = (body) => ({
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,GET',
  },
  body: JSON.stringify(body),
});
const notFound = () => ({ statusCode: 404, body: 'Not found' });
const error = (msg) => ({ statusCode: 500, body: msg });

exports.handler = async (event) => {
  // Pre-flight CORS
  if (event.httpMethod === 'OPTIONS') return ok('');

  // Segmento final del path (/reportes/<segmento>)
  const segment =
    event.pathParameters?.proxy || event.path?.split('/').pop() || '';

  console.log('TABLE ENV:', TABLE, 'segment:', segment);

  try {
    // Scan completo (para pocos ítems). Optimízalo con Query + GSI cuando crezca.
    const { Items } = await client.send(
      new ScanCommand({ TableName: TABLE })
    );
    const viajes = Items.map(unmarshall);

    switch (segment) {
  // AHORA devuelve el dinero total gastado
  case 'today': {
    const totalDinero = viajes.reduce(
      (sum, v) => sum + Number(v.tarifa_estim || 0),
      0
    );
    return ok({ totalDinero });
  }

  case 'total':
    return ok({ countTotal: viajes.length });

      case 'historial': {
        const hist = viajes.map((v) => ({
          viajeId: v.viajeId,
          origen: v.origen,
          destino: v.destino,
          costo: Number(v.tarifa_estim || 0),
        }));
        return ok(hist);
      }

      default:
        return notFound();
    }
  } catch (e) {
    console.error(e);
    return error('Error interno: ' + e.name);
  }
};
