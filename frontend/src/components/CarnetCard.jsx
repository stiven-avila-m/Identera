import { QRCodeSVG } from 'qrcode.react';
import './CarnetCard.css';

/**
 * Este componente es la "Plantilla" visual del carnet.
 * Recibe dos cosas principales (propiedades):
 * 1. datos: Toda la información de la persona (nombre, foto, cédula, etc.)
 * 2. payload: El texto secreto que va dentro del código QR. Si está vacío, asumimos que ya se validó el carnet.
 */
export default function CarnetCard({ datos, payload = null }) {
  // --- PREPARACIÓN DE DATOS ---
  // Aquí usamos "??" (Nullish Coalescing) que básicamente dice: 
  // "Si no me mandaron nombre, pon un guion '—' por defecto"
  const nombre = datos?.nombre ?? '—';
  const cargo = datos?.cargo ?? '—';
  const arl = datos?.arl ?? '—';
  const cedula = datos?.cedula ?? datos?.documento ?? '—';
  const codigoValidador = datos?.codigoValidador ?? '—';
  
  // Corrección dinámica de la URL de la foto para local vs SAM
  let fotoFinal = datos?.foto;
  if (fotoFinal && fotoFinal.includes('localhost:8000')) {
    fotoFinal = fotoFinal.replace('http://localhost:8000', 'http://127.0.0.1:3000');
  }
  
  // Si NO nos mandaron el payload (el código del QR), significa que el carnet
  // no se está creando, sino que ya fue escaneado y "Validado".
  const esValidado = !payload;

  // --- EL DIBUJO DEL CARNET (HTML/JSX) ---
  return (
    // Contenedor principal de toda la tarjeta
    <div className="carnet-card-wrap">
      <div className="carnet carnet-card">
        
        {/* PARTE 1: El Encabezado (Arriba del carnet) */}
        <div className="carnet-header">
          <span className="carnet-logo">Identera</span>
          {/* Si ya fue escaneado dice 'Validado', si se está creando dice 'Itera' */}
          <span className="carnet-badge">{esValidado ? 'Validado' : 'Itera'}</span>
        </div>
        
        {/* PARTE 2: El Cuerpo (Donde va la foto y la info principal) */}
        <div className="carnet-body">
          
          {/* FOTO Y NOMBRE */}
          <div className="carnet-profile">
            {/* Si existe una foto en 'datos', la dibuja. Si no, no muestra nada en ese espacio. */}
            {fotoFinal && (
              <img src={fotoFinal} alt="Perfil" className="carnet-foto" />
            )}
            <div className="carnet-user-info">
              {/* Escribe el nombre en letras grandes (h2) y el cargo abajo */}
              <h2 className="carnet-nombre">{nombre}</h2>
              <p className="carnet-cargo">{cargo}</p>
            </div>
          </div>

          {/* PARTE 3: Detalles y QR (Parte de abajo) */}
          <div className="carnet-details-row">
            
            {/* Columna Izquierda: Los datos escritos */}
            <div className="carnet-meta">
              <div className="carnet-field">
                <span className="carnet-label">Cédula</span>
                <span className="carnet-value">{cedula}</span>
              </div>
              <div className="carnet-field">
                <span className="carnet-label">ARL</span>
                <span className="carnet-value">{arl}</span>
              </div>
              <div className="carnet-field">
                <span className="carnet-label">ID</span>
                {/* Muestra el ID único alfanumérico que generamos */}
                <span className="carnet-value mono">#{codigoValidador}</span>
              </div>
            </div>
            
            {/* Columna Derecha: El Código QR o la marca de validado */}
            <div className="carnet-qr-box">
              {payload ? (
                // Si estamos en modo "creación", usamos la librería QRCodeSVG
                // para transformar el 'payload' en un dibujo de cuadritos.
                <QRCodeSVG
                  value={payload}
                  size={88}
                  level="M"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#0a0a0a"
                  style={{ borderRadius: '4px' }}
                />
              ) : (
                // Si estamos en modo "validación" (no hay payload enviado), 
                // ya no dibujamos el QR, en su lugar dibujamos un Check '✓'.
                <div className="carnet-validado-icon" title="Carnet validado">✓</div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
