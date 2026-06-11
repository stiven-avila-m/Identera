"use strict";
/**
 * identera-lambda-usuarios
 *
 * Rutas (API Gateway REST — path llega sin stage):
 *
 *   POST   /login                       → autenticación
 *   GET    /usuarios                    → listar todos (sin passwords)
 *   POST   /usuarios                    → crear usuario (+ carnet en blanco si role=USUARIO)
 *   PATCH  /usuarios/{email}/profile    → actualizar nombre, email y/o contraseña
 *   PATCH  /usuarios/{email}/status     → habilitar / inhabilitar cuenta
 *   PATCH  /usuarios/{email}/role       → cambiar rol
 *   DELETE /usuarios/{email}            → eliminar usuario y todos sus carnets
 *
 * Comportamiento idéntico al main.py original.
 */

const { randomUUID } = require("crypto");
const {
  crearUsuario,
  obtenerUsuario,
  listarUsuarios,
  eliminarUsuario,
  actualizarPerfilUsuario,
  crearValidacion,
  listarValidaciones,
  eliminarValidacion,
  PutCommand,
  db,
  TABLE_NAME,
  ok,
  err,
  sanitizeUser,
} = require("./shared/db");

// ID protegido del admin raíz — nunca se puede borrar ni inhabilitar
const ADMIN_PROTEGIDO_ID = "admin-id-123";

// ─── Normaliza el path quitando el stage de API GW si viene ──────────────────
function getSegments(event) {
  const raw = event.path || event.rawPath || "/";
  const parts = raw.replace(/^\/+/, "").split("/");
  const knownStages = ["prod", "dev", "staging"];
  if (knownStages.includes(parts[0])) parts.shift();
  return parts;
  // Ejemplos:
  // ["login"]
  // ["usuarios"]
  // ["usuarios", "juan@test.com", "profile"]
  // ["usuarios", "juan@test.com", "status"]
  // ["usuarios", "juan@test.com", "role"]
  // ["usuarios", "juan@test.com"]
}

exports.handler = async (event) => {
  const method   = (event.httpMethod || event.requestContext?.http?.method || "").toUpperCase();
  const segments = getSegments(event);

  console.log(`[usuarios] ${method} /${segments.join("/")}`, {
    qs: event.queryStringParameters,
    bodyPreview: event.body?.substring(0, 200),
  });

  try {

    // ── OPTIONS (preflight CORS) ───────────────────────────────────────────
    if (method === "OPTIONS") return ok({});

    // ══════════════════════════════════════════════════════════════════════
    // POST /login
    // Body: { email, password }
    // Responde: objeto usuario sin password
    // Usado por: Login.jsx → authService.login()
    // ══════════════════════════════════════════════════════════════════════
    if (method === "POST" && segments[0] === "login") {
      const body = parseBody(event.body);
      const { email, password } = body;

      if (!email || !password) {
        return err("Email y contraseña son obligatorios", 400);
      }

      const user = await obtenerUsuario(email);

      if (!user || user.password !== password) {
        return err("Credenciales incorrectas.", 401);
      }
      if (user.status === "disabled") {
        return err("Tu cuenta ha sido inhabilitada. Contacta al administrador.", 403);
      }

      return ok(sanitizeUser(user));
    }

    // ══════════════════════════════════════════════════════════════════════
    // GET /usuarios
    // Responde: array de usuarios sin password
    // Usado por: AdminDashboard.jsx → authService.getAllUsers()
    //            CrearQR.jsx → authService.getAllUsers()
    // ══════════════════════════════════════════════════════════════════════
    if (method === "GET" && segments[0] === "usuarios") {
      const users = await listarUsuarios();
      return ok(users.map(sanitizeUser));
    }

    // ══════════════════════════════════════════════════════════════════════
    // POST /usuarios
    // Body: { id, email, password, name, role, status }
    // Responde: usuario creado (sin password)
    // Usado por: AdminDashboard.jsx → authService.createUser()
    // Comportamiento especial: si role=USUARIO crea un carnet en blanco
    // ══════════════════════════════════════════════════════════════════════
    if (method === "POST" && segments[0] === "usuarios") {
      const body = parseBody(event.body);
      const { id, email, password, name, role, status } = body;

      if (!email || !password || !name || !role) {
        return err("Faltan campos obligatorios: email, password, name, role", 400);
      }

      const existe = await obtenerUsuario(email);
      if (existe) {
        return err("Ya existe un usuario con este correo.", 400);
      }

      const userId = id || randomUUID();

      await crearUsuario({
        id:     userId,
        email,
        name,
        role,
        status: status || "enabled",
        password,
      });

      // Carnet en blanco automático para iterantes (role=USUARIO)
      // Replica el comportamiento del registrar_usuario() de Python
      if (role === "USUARIO") {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let codigo = "";
        for (let i = 0; i < 8; i++) {
          codigo += chars[Math.floor(Math.random() * chars.length)];
        }
        await crearValidacion({
          id:     randomUUID(),
          userId,
          fecha:  new Date().toISOString(),
          data: {
            nombre:          name,
            cargo:           "Colaborador",
            arl:             "—",
            eps:             "—",
            cedula:          "—",
            codigoValidador: codigo,
            foto:            null,
          },
        });
      }

      // Devolver el usuario recién creado (sin password)
      const nuevo = await obtenerUsuario(email);
      return ok(sanitizeUser(nuevo), 201);
    }

    // ══════════════════════════════════════════════════════════════════════
    // PATCH /usuarios/{email}/profile
    // Body: { email: newEmail, name, password? }
    // Responde: usuario actualizado (sin password)
    // Usado por: AdminDashboard.jsx → authService.updateUserProfile()
    // ══════════════════════════════════════════════════════════════════════
    if (method === "PATCH" && segments[0] === "usuarios" && segments[2] === "profile") {
      const oldEmail = decodeURIComponent(segments[1]);
      const body     = parseBody(event.body);
      const { email: newEmail, name, password } = body;

      if (!newEmail || !name) {
        return err("Faltan campos obligatorios: email, name", 400);
      }

      const updated = await actualizarPerfilUsuario(oldEmail, {
        email: newEmail,
        name,
        password,
      });

      return ok(sanitizeUser(updated));
    }

    // ══════════════════════════════════════════════════════════════════════
    // PATCH /usuarios/{email}/status
    // Body: { status: "enabled" | "disabled" }
    // Responde: { status: "success" }
    // Usado por: AdminDashboard.jsx → authService.updateUserStatus()
    // ══════════════════════════════════════════════════════════════════════
    if (method === "PATCH" && segments[0] === "usuarios" && segments[2] === "status") {
      const email = decodeURIComponent(segments[1]);
      const { status } = parseBody(event.body);

      if (!status) return err("Falta el campo status", 400);

      const user = await obtenerUsuario(email);
      if (!user) return err("Usuario no encontrado", 404);
      if (user.id === ADMIN_PROTEGIDO_ID) {
        return err("No puedes inhabilitar al administrador principal.", 400);
      }

      const updated = { ...user, status };
      await db.send(new PutCommand({ TableName: TABLE_NAME, Item: updated }));

      return ok({ status: "success" });
    }

    // ══════════════════════════════════════════════════════════════════════
    // PATCH /usuarios/{email}/role
    // Body: { role: "ADMINISTRADOR" | "USUARIO" | "SEGURIDAD" }
    // Responde: { status: "success" }
    // Usado por: AdminDashboard.jsx → authService.updateUserRole()
    // ══════════════════════════════════════════════════════════════════════
    if (method === "PATCH" && segments[0] === "usuarios" && segments[2] === "role") {
      const email = decodeURIComponent(segments[1]);
      const { role } = parseBody(event.body);

      if (!role) return err("Falta el campo role", 400);

      const user = await obtenerUsuario(email);
      if (!user) return err("Usuario no encontrado", 404);
      if (user.id === ADMIN_PROTEGIDO_ID) {
        return err("No puedes cambiar el rol del administrador principal.", 400);
      }

      const updated = { ...user, role };
      await db.send(new PutCommand({ TableName: TABLE_NAME, Item: updated }));

      return ok({ status: "success" });
    }

    // ══════════════════════════════════════════════════════════════════════
    // DELETE /usuarios/{email}
    // Responde: { status: "success" }
    // Usado por: AdminDashboard.jsx → authService.deleteUser()
    // Comportamiento: borra el usuario Y todos sus carnets/validaciones
    // ══════════════════════════════════════════════════════════════════════
    if (method === "DELETE" && segments[0] === "usuarios" && segments[1]) {
      const email = decodeURIComponent(segments[1]);

      const user = await obtenerUsuario(email);
      if (!user) return err("Usuario no encontrado", 404);
      if (user.id === ADMIN_PROTEGIDO_ID) {
        return err("Protección de sistema: Imposible eliminar cuenta creadora.", 400);
      }

      // Borrar todos los carnets asociados al usuario
      const validaciones = await listarValidaciones();
      const suyas = validaciones.filter((v) => v.userId === user.id);
      if (suyas.length > 0) {
        await Promise.all(suyas.map((v) => eliminarValidacion(v.id)));
      }

      await eliminarUsuario(email);
      return ok({ status: "success" });
    }

    return err(`Ruta no encontrada: ${method} /${segments.join("/")}`, 404);

  } catch (e) {
    console.error("[usuarios] Error inesperado:", e);
    return err(e.message || "Error interno del servidor", 500);
  }
};

// ─── Helper: parsea el body sin explotar si viene vacío o malformado ──────────
function parseBody(raw) {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}
