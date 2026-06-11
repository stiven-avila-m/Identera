/**
 * Servicio de notificaciones Toast.
 * Exporta la función toast() para usar en cualquier parte del código.
 */

export const listeners = new Set();
let nextId = 1;

export function toast(message, type = 'info', duration = 3000) {
  const id = nextId++;
  listeners.forEach((fn) => fn({ id, message, type, duration }));
}

export const toastService = {
  info: (msg, dur) => toast(msg, 'info', dur),
  success: (msg, dur) => toast(msg, 'success', dur),
  error: (msg, dur) => toast(msg, 'error', dur),
};
