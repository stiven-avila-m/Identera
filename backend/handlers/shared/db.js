/**
 * shared/db.js
 * Cliente DynamoDB compartido entre todas las Lambdas.
 * Implementa las mismas operaciones que el database.py original.
 */

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "IdenteraDB";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const db = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

// ─── USUARIOS ────────────────────────────────────────────────────────────────

async function crearUsuario({ id, email, name, role, status, password }) {
  const now = new Date().toISOString();
  const item = {
    PK: `USER#${email}`,
    SK: `PROFILE#${email}`,
    id: id || randomUUID(),
    email,
    name,
    role,
    status,
    password,
    createdAt: now,
    entity_type: "usuario",
  };
  await db.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
}

async function obtenerUsuario(email) {
  const res = await db.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${email}`, SK: `PROFILE#${email}` },
    })
  );
  return res.Item || null;
}

async function listarUsuarios() {
  const res = await db.send(new ScanCommand({ TableName: TABLE_NAME }));
  return (res.Items || []).filter((i) => i.entity_type === "usuario");
}

async function eliminarUsuario(email) {
  await db.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${email}`, SK: `PROFILE#${email}` },
    })
  );
}

async function actualizarPerfilUsuario(oldEmail, { name, email: newEmail, password }) {
  const oldUser = await obtenerUsuario(oldEmail);
  if (!oldUser) throw new Error(`Usuario no encontrado: ${oldEmail}`);

  if (oldEmail !== newEmail) {
    const existe = await obtenerUsuario(newEmail);
    if (existe) throw new Error(`Ya existe un usuario con el correo ${newEmail}`);
    await eliminarUsuario(oldEmail);
  }

  const item = {
    ...oldUser,
    PK: `USER#${newEmail}`,
    SK: `PROFILE#${newEmail}`,
    email: newEmail,
    name,
    password: password || oldUser.password,
  };

  await db.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
}

// ─── VALIDACIONES / CARNETS ───────────────────────────────────────────────────

async function crearValidacion({ id, userId, fecha, data }) {
  const item = {
    PK: "VALIDACIONES_GLOBAL",
    SK: `VAL#${id}`,
    id,
    userId,
    fecha,
    data,
    entity_type: "validacion",
  };
  await db.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
}

async function listarValidaciones() {
  const res = await db.send(new ScanCommand({ TableName: TABLE_NAME }));
  return (res.Items || []).filter((i) => i.entity_type === "validacion");
}

async function eliminarValidacion(id) {
  await db.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: "VALIDACIONES_GLOBAL", SK: `VAL#${id}` },
    })
  );
}

async function limpiarValidaciones() {
  const todas = await listarValidaciones();
  await Promise.all(todas.map((v) => eliminarValidacion(v.id)));
}

// ─── HELPERS DE RESPUESTA HTTP ────────────────────────────────────────────────

function ok(body, statusCode = 200) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

function err(message, statusCode = 400) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    },
    body: JSON.stringify({ detail: message }),
  };
}

// Elimina campos internos de DynamoDB antes de devolver al frontend
function sanitizeUser(user) {
  if (!user) return null;
  const { password, PK, SK, entity_type, ...safe } = user;
  return safe;
}

function sanitizeValidacion(v) {
  if (!v) return null;
  const { PK, SK, entity_type, ...safe } = v;
  return safe;
}

module.exports = {
  db,
  TABLE_NAME,
  // clientes DynamoDB para uso directo en handlers
  PutCommand,
  ScanCommand,
  // usuarios
  crearUsuario,
  obtenerUsuario,
  listarUsuarios,
  eliminarUsuario,
  actualizarPerfilUsuario,
  // validaciones
  crearValidacion,
  listarValidaciones,
  eliminarValidacion,
  limpiarValidaciones,
  // helpers
  ok,
  err,
  sanitizeUser,
  sanitizeValidacion,
  PutCommand,
};
