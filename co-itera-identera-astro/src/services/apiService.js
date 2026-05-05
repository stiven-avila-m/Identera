/**
 * Servicio de Carnets 100% INTEGRADO con FastAPI (Backend)
 * La información de tus carnets vive oficialmente en AWS/Python.
 */

import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api';

export const apiService = {
  
  async getValidaciones(userId = null) {
    let url = `${API_URL}/validaciones`;
    if (userId) {
      url += `?userId=${encodeURIComponent(userId)}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error("Fallo al conectarse al Backend (Python)");

    return res.json();
  },

  async saveValidacion(data, userId, role) {
    const payload = {
      id: crypto.randomUUID(),
      userId,
      fecha: new Date().toISOString(),
      data
    };

    const res = await fetch(`${API_URL}/validaciones?role=${role}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Error al guardar el carnet en Python');

    return res.json();
  },

  async deleteValidacion(id) {
    const res = await fetch(`${API_URL}/validaciones/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) throw new Error('Fallo al borrar validación');

    return res.json();
  },

  async clearValidaciones() {
    const res = await fetch(`${API_URL}/validaciones/all/clear`, {
      method: 'DELETE'
    });

    if (!res.ok) throw new Error('Error limpiando validaciones');
  },

  async regenerarQR() {
    const user = authService.getCurrentUser();

    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    const res = await fetch(`${API_URL}/qr/regenerar`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: user.id })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Error regenerando QR');
    }

    return res.json();
  },

  async editarCarnet(carnetId, data) {
    if (!carnetId) {
      throw new Error('Falta el ID del carnet');
    }

    const res = await fetch(`${API_URL}/carnets/${carnetId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Error editando carnet');
    }

    return res.json();
  },

  async crearCarnet(data) {
    const user = authService.getCurrentUser();

    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    const payload = {
      id: crypto.randomUUID(),
      userId: user.id,
      fechaCreacion: new Date().toISOString(),
      ...data
    };

    const res = await fetch(`${API_URL}/carnets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Error creando carnet');
    }

    return res.json();
  }

};