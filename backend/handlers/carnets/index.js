"use strict";
/**
 * identera-lambda-carnets
 *
 * Rutas (API Gateway REST — path llega sin stage):
 *
 *   GET   /carnets              → lista carnets (filtra por ?userId=)
 *   POST  /carnets              → crea un carnet nuevo
 *   PATCH /carnets/{carnetId}   → edita campos del carnet (merge parcial)
 *
 * Usado por:
 *   - apiService.crearCarnet()  → POST /carnets
 *   - apiService.editarCarnet() → PATCH /carnets/{carnetId}
 *   - MisCarnets.jsx handleRegenerateQR() → llama apiService.updateValidacion()
 *     que NO existe en el servicio actual — el PATCH lo cubre este endpoint.
 */

const { randomUUID } = require("crypto");
const {
  crearValidacion,
  listarValidaciones,
  PutCommand,
  db,
  TABLE_NAME,
  ok,
  err,
  sanitizeValidacion,
} = require("./shared/db");

function parseBody(raw) {
  try { return JSON.parse(raw || "{}"); } catch { return {}; }
}

function getSegments(event) {
  const raw = event.path || event.rawPath || "/";
  const parts = raw.replace(/^\/+/, "").split("/");
  const knownStages = ["prod", "dev", "staging"];
  if (knownStages.includes(parts[0])) parts.shift();
  return parts;
  // ["carnets"]  |  ["carnets", "{carnetId}"]
}

// Mismo charset que el frontend (carnetUtils.js y CrearQR.jsx)
function generarCodigo() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

exports.handler = async (event) => {
  const method   = (event.httpMethod || event.requestContext?.http?.method || "").toUpperCase();
  const segments = getSegments(event);

  console.log(`[carnets] ${method} /${segments.join("/")}`, {
    qs: event.queryStringParameters,
    body: event.body?.substring(0, 200),
  });

  try {

    if (method === "OPTIONS") return ok({});

    // ══════════════════════════════════════════════════════════════════════
    // GET /carnets?userId=
    // Devuelve todos los carnets o filtra por usuario.
    // Usado por pantallas de listado de carnets.
    // ══════════════════════════════════════════════════════════════════════
    if (method === "GET" && !segments[1]) {
      const userId = event.queryStringParameters?.userId || null;
      const todas  = await listarValidaciones();
      const limpias = todas.map(sanitizeValidacion);
      return ok(userId ? limpias.filter((c) => c.userId === userId) : limpias);
    }

    // ══════════════════════════════════════════════════════════════════════
    // POST /carnets
    // Body (viene de apiService.crearCarnet):
    //   { id, userId, fechaCreacion, nombre, cargo, arl, eps, cedula,
    //     codigoValidador?, foto? }
    // Responde: carnet creado (objeto único, no array)
    // ══════════════════════════════════════════════════════════════════════
    if (method === "POST" && !segments[1]) {
      const body = parseBody(event.body);
      const { id, userId, fechaCreacion, ...camposData } = body;

      if (!userId) return err("Falta el campo userId", 400);

      const carnetId = id     || randomUUID();
      const fecha    = fechaCreacion || new Date().toISOString();

      // Asegura que siempre haya código validador
      const data = {
        ...camposData,
        codigoValidador: camposData.codigoValidador || generarCodigo(),
      };

      await crearValidacion({ id: carnetId, userId, fecha, data });

      // Releer el item recién creado para devolverlo limpio
      const todos   = await listarValidaciones();
      const creado  = todos.find((v) => v.id === carnetId);
      return ok(sanitizeValidacion(creado), 201);
    }

    // ══════════════════════════════════════════════════════════════════════
    // PATCH /carnets/{carnetId}
    // Body (viene de apiService.editarCarnet):
    //   campos parciales del objeto data (nombre, cargo, foto, etc.)
    // Responde: carnet actualizado (objeto único)
    //
    // También lo usa MisCarnets.handleRegenerateQR vía apiService.updateValidacion
    // (método que falta en apiService — ver nota abajo).
    // ══════════════════════════════════════════════════════════════════════
    if (method === "PATCH" && segments[1]) {
      const carnetId = decodeURIComponent(segments[1]);
      const cambios  = parseBody(event.body);

      const todos  = await listarValidaciones();
      const carnet = todos.find((v) => v.id === carnetId);

      if (!carnet) return err("Carnet no encontrado", 404);

      // Merge profundo: los campos recibidos sobreescriben los existentes
      const carnetActualizado = {
        ...carnet,
        data: { ...carnet.data, ...cambios },
      };

      await db.send(new PutCommand({ TableName: TABLE_NAME, Item: carnetActualizado }));

      return ok(sanitizeValidacion(carnetActualizado));
    }

    return err(`Ruta no encontrada: ${method} /${segments.join("/")}`, 404);

  } catch (e) {
    console.error("[carnets] Error inesperado:", e);
    return err(e.message || "Error interno del servidor", 500);
  }
};
