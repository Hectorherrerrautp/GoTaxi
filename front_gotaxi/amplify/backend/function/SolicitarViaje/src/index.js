/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_VIAJESDB_ARN
	STORAGE_VIAJESDB_NAME
	STORAGE_VIAJESDB_STREAMARN
Amplify Params - DO NOT EDIT */

const {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
  QueryCommand,
  GetItemCommand,         // <-- import añadido
} = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient({});
const TABLE = process.env.ViajesTableName;
const GSI   = 'estadoIndex';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods':  'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers':  'Content-Type',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  // === GET con viajeId o estado ===
  if (event.httpMethod === 'GET') {
    const qs = event.queryStringParameters || {};
    const { viajeId, estado } = qs;

    // 1) GET by PK
    if (viajeId) {
      try {
        const getParams = {
          TableName: TABLE,
          Key: { viajeId: { S: viajeId } },
        };
        const result = await client.send(new GetItemCommand(getParams));
        if (!result.Item) {
          return {
            statusCode: 404,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Viaje no encontrado' }),
          };
        }
        const item = unmarshall(result.Item);
        // parse coords con try/catch
        try { item.origenCoords = JSON.parse(item.origenCoords); }
        catch{} 
        try { item.destinoCoords = JSON.parse(item.destinoCoords); }
        catch{}
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ item }),
        };
      } catch (error) {
        console.error('Error GET viajeId:', error);
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Error interno GET viajeId' }),
        };
      }
    }

    // 2) GET by estado
    if (!estado) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Falta el parámetro estado' }),
      };
    }
    try {
      const params = {
        TableName: TABLE,
        IndexName: GSI,
        KeyConditionExpression:    '#e = :estado',
        ExpressionAttributeNames:  { '#e': 'estado' },
        ExpressionAttributeValues: { ':estado': { S: estado } },
      };
      const result = await client.send(new QueryCommand(params));
      const items = (result.Items || []).map((item) => {
        const u = unmarshall(item);
        try { u.origenCoords = JSON.parse(u.origenCoords); } catch{}
        try { u.destinoCoords = JSON.parse(u.destinoCoords); } catch{}
        return u;
      });
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ items }),
      };
    } catch (error) {
      console.error('Error GET estado:', error);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Error interno GET estado' }),
      };
    }
  }

  // === POST (crear o actualizar estado) ===
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);
      // actualizar estado existente
      if (body.viajeId && body.nuevoEstado) {
        await client.send(new UpdateItemCommand({
          TableName: TABLE,
          Key: { viajeId: { S: body.viajeId } },
          UpdateExpression: 'SET #e = :ne',
          ExpressionAttributeNames: { '#e': 'estado' },
          ExpressionAttributeValues: { ':ne': { S: body.nuevoEstado } },
        }));
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ ok: true }),
        };
      }
      // crear nuevo
      const viajeId = `viaje_${Date.now()}`;
      if (
        !body.userId || !body.origen || !body.destino ||
        !body.origenCoords || !body.destinoCoords ||
        typeof body.distancia_km !== 'number' ||
        typeof body.tarifa_estim !== 'number'
      ) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Datos incompletos' }),
        };
      }
      await client.send(new PutItemCommand({
        TableName: TABLE,
        Item: {
          viajeId:      { S: viajeId },
          userId:       { S: body.userId },
          origen:       { S: body.origen },
          destino:      { S: body.destino },
          origenCoords: { S: JSON.stringify(body.origenCoords) },
          destinoCoords:{ S: JSON.stringify(body.destinoCoords) },
          distancia_km: { N: body.distancia_km.toString() },
          tarifa_estim: { N: body.tarifa_estim.toString() },
          estado:       { S: 'en_espera' },
        },
      }));
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ viajeId, estado: 'en_espera' }),
      };
    } catch (error) {
      console.error('Error POST:', error);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Error interno POST' }),
      };
    }
  }

  return {
    statusCode: 405,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: 'Método no permitido' }),
  };
};
