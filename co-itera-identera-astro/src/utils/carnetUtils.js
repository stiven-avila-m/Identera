import { apiService } from '../services/apiService';

/**
 * Genera un código alfanumérico aleatorio de 8 caracteres.
 * Esta función se usa tanto al crear un nuevo QR como al "Regenerar QR".
 */
export const generateCodigoValidador = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  // Si cambias el 8 por un valor mayor (ej 10 o 12), el código será más seguro y largo
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

/**
 * Recibe el contenido en texto plano del QR y lo parsea a un objeto válido.
 * Además, cruza con la base de datos (apiService) para traer la foto si está disponible localmente.
 */
export async function parseCarnetPayload(text) {
  try {
    const data = JSON.parse(text);
    if (data.tipo === 'carnet' && data.codigoValidador) {
      // Cruzar la data para traer la imagen desde BD si existe
      const list = await apiService.getValidaciones();
      const savedMatch = list.find((v) => v.data.codigoValidador === data.codigoValidador);
      
      if (savedMatch && savedMatch.data.foto) {
        data.foto = savedMatch.data.foto;
      }
      return { ok: true, data };
    }
    return { ok: false, error: 'No es un carnet válido de Identera.' };
  } catch {
    return { ok: false, error: 'El QR no contiene un carnet válido.' };
  }
}

/**
 * Formato de fecha legible (DD MMM HH:MM)
 */
export const formatearFecha = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch {
    return iso;
  }
};
