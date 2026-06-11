"use strict";
/**
 * identera-lambda-qr
 *
 * Rutas (API Gateway REST — path llega sin stage):
 *
 *   GET  /qr/regenerar?userId=   → genera un nuevo código (no persiste)
 *   POST /qr/regenerar            → persiste el nuevo código en el carnet activo
 *                                   y en el perfil del usuario
 *
 * Usado por:
 *   - apiService.regenerarQR()  → POST /qr/regenerar con { userId }
 *   - CrearQR.jsx botón "Regenerar Código QR" (usa saveValidacion, no este endpoint)
 *
 * Nota: el frontend actualmente genera el código localmente en el cliente
 * (generateCodigoValidador en carnetUtils.js) y luego lo guarda via
 * POST /validaciones. Este endpoint es para la regeneración desde MisCarnets
 * que sí delega al backend.
 */

const {
  listarValidaciones,
  listarUsuarios,
  PutCommand,
  ScanCommand,
  db,
  TABLE_NAME,
  ok,
  err,
} = require("./shared/db");

// Genera código alfanumérico de 8 chars — mismo charset que el frontend
function generarCodigo() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function parseBody(raw) {
  try { return JSON.parse(raw || "{}"); } catch { return {}; }
}

function getSegments(event) {
  const raw = event.path || event.rawPath || "/";
  const parts = raw.replace(/^\/+/, "").split("/");
  const knownStages = ["prod", "dev", "staging"];
  if (knownStages.includes(parts[0])) parts.shift();
  return parts;
}

exports.handler = async (event) => {
  const method   = (event.httpMethod || event.requestContext?.http?.method || "").toUpperCase();
  const segments = getSegments(event);

  console.log(`[qr] ${method} /${segments.join("/")}`, {
    qs: event.queryStringParameters,
    body: event.body?.substring(0, 200),
  });

  try {

    if (method === "OPTIONS") return ok({});

    // ══════════════════════════════════════════════════════════════════════
    // GET /qr/regenerar?userId=
    // Genera un nuevo código pero NO lo persiste.
    // Útil para previsualizaciones o flujos que confirman después.
    // ══════════════════════════════════════════════════════════════════════
    if (method === "GET") {
      const userId = event.queryStringParameters?.userId;
      if (!userId) return err("Falta el parámetro userId", 400);

      return ok({ userId, codigoValidador: generarCodigo() });
    }

    // ══════════════════════════════════════════════════════════════════════
    // POST /qr/regenerar
    // Body: { userId }
    // Genera un nuevo código y lo persiste en:
    //   1. El carnet activo del usuario (tabla VALIDACIONES_GLOBAL)
    //   2. El perfil del usuario (tabla USER#email)
    // Responde: { userId, codigoValidador }
    // Usado por: apiService.regenerarQR() desde MisCarnets.jsx
    // ══════════════════════════════════════════════════════════════════════
    if (method === "POST") {
      const { userId } = parseBody(event.body);
      if (!userId) return err("Falta el campo userId", 400);

      const nuevoCodigo = generarCodigo();

      // ── 1. Actualizar carnet activo ──────────────────────────────────
      const validaciones = await listarValidaciones();
      const carnet = validaciones.find((v) => v.userId === userId);

      if (carnet) {
        const carnetActualizado = {
          ...carnet,
          data: { ...carnet.data, codigoValidador: nuevoCodigo },
        };
        await db.send(new PutCommand({ TableName: TABLE_NAME, Item: carnetActualizado }));
      }

      // ── 2. Actualizar perfil del usuario ─────────────────────────────
      // Buscamos por campo "id" (no por email/PK) igual que el Python original
      const scan = await db.send(new ScanCommand({ TableName: TABLE_NAME }));
      const usuario = (scan.Items || []).find(
        (i) => i.entity_type === "usuario" && i.id === userId
      );

      if (usuario) {
        const usuarioActualizado = { ...usuario, codigoValidador: nuevoCodigo };
        await db.send(new PutCommand({ TableName: TABLE_NAME, Item: usuarioActualizado }));
      }

      return ok({ userId, codigoValidador: nuevoCodigo });
    }

    return err(`Ruta no encontrada: ${method} /${segments.join("/")}`, 404);

  } catch (e) {
    console.error("[qr] Error inesperado:", e);
    return err(e.message || "Error interno del servidor", 500);
  }
};
