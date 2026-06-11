import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CarnetCard from '../components/CarnetCard';
import { apiService } from '../services/apiService';
import { useScanner } from '../hooks/useScanner';
import './Validar.css';

const MAX_GUARDADOS = 50;

function ResultadoCarnet({ resultado }) {
  if (!resultado) return null;
  const { ok, error } = resultado;
  if (!ok) {
    return (
      <div className="resultado-card resultado-invalido" style={{
        backgroundColor: '#fee2e2', border: '2px solid #ef4444', 
        padding: '2rem', borderRadius: '12px', textAlign: 'center',
        marginTop: '1rem', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)'
      }}>
        <div className="resultado-icon" style={{
          backgroundColor: '#ef4444', color: 'white', width: '60px', height: '60px',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', margin: '0 auto 1rem auto'
        }}>✕</div>
        <h2 style={{ color: '#b91c1c', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Carnet No Válido</h2>
        <p style={{ color: '#7f1d1d', fontSize: '1.1rem', fontWeight: '500' }}>{error}</p>
      </div>
    );
  }
  return null;
}

export default function Validar() {
  const [resultado, setResultado] = useState(null);
  const [validacionesGuardadas, setValidacionesGuardadas] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    apiService.getValidaciones().then(setValidacionesGuardadas);
  }, []);
  
  const readerId = 'qr-reader';

  const { 
    escaneando, 
    errorCamara, 
    tooltipText, 
    iniciarCamara, 
    detenerCamara, 
    escanearImagen 
  } = useScanner(readerId);

  const onScanSuccess = useCallback(async (decodedText) => {
    try {
      const payload = JSON.parse(decodedText);
      if (payload.tipo !== 'carnet' || !payload.codigoValidador) {
        setResultado({ ok: false, error: 'No es un carnet válido de Identera.' });
        return;
      }
      const validations = await apiService.getValidaciones();
      const carnetReal = validations.find(c => c?.data?.codigoValidador === payload.codigoValidador);
      if (carnetReal && carnetReal.data.nombre) {
        setResultado({ ok: true, data: carnetReal.data });
        detenerCamara();
      } else {
        setResultado({ ok: false, error: `Carnet #${payload.codigoValidador} no encontrado en registros validos locales.` });
      }
    } catch {
      setResultado({ ok: false, error: 'El QR no contiene un formato reconocido.' });
    }
  }, [detenerCamara]);

  const handleStartCamera = () => {
    setResultado(null);
    iniciarCamara(onScanSuccess);
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResultado(null);
    
    await escanearImagen(
      file, 
      (text) => onScanSuccess(text),
      (err) => setResultado({ ok: false, error: err.message || 'No se encontró un código QR en la imagen.' })
    );

    e.target.value = '';
  };

  const guardarValidacion = async () => {
    if (!resultado?.ok || !resultado?.data) return;
    const next = await apiService.saveValidacion(resultado.data);
    setValidacionesGuardadas(next);
  };

  const formatearFecha = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  const borrarValidaciones = async () => {
    await apiService.clearValidaciones();
    setValidacionesGuardadas([]);
  };

  return (
    <div className="validar page-wrap">
      <div className="validar-inner">
        <h1 className="page-title">Validar carnet</h1>
        <p className="page-desc">
          Escanea el QR con la cámara o sube una imagen del código para verificar el carnet y su código validador.
        </p>

        <div className="validar-tabs">
          <button
            type="button"
            className="active"
          >
            Validar
          </button>
          <button
            type="button"
            className=""
            onClick={() => { detenerCamara(); navigate('/escaneo-masa'); }}
          >
            Validar Masivo
          </button>
        </div>

        {resultado && !resultado.ok && (
          <ResultadoCarnet resultado={resultado} />
        )}

        {resultado?.ok && resultado?.data && (
          <section className="resultado-valido-section card">
            <h3 className="resultado-valido-title">Carnet válido</h3>
            <CarnetCard datos={resultado.data} />
            <p className="resultado-guardar-hint">Puedes guardar esta validación en este dispositivo para verla después.</p>
            <button type="button" className="btn primary" onClick={guardarValidacion}>
              Guardar en este dispositivo
            </button>
          </section>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2rem' }}>
          <section className="validar-camara card">
            <div className="qr-scanner-wrapper">
              <div id={readerId} className="qr-reader-container" />
              {escaneando && (
                <div className="scanner-overlay">
                  <div className="scanner-tooltip">{tooltipText}</div>
                </div>
              )}
            </div>

            {!escaneando ? (
              <div className="qr-reader-placeholder">
                <p>Activa la cámara para escanear el carnet de forma individual.</p>
                <button className="btn primary" onClick={handleStartCamera}>Activar Cámara</button>
              </div>
            ) : (
              <button className="btn btn-stop" onClick={detenerCamara}>Detener Cámara</button>
            )}
            {errorCamara && <p className="error-msg">{errorCamara}</p>}
          </section>

          <section className="validar-imagen card">
            <label className="upload-zone">
              <input type="file" accept="image/*" onChange={handleFile} className="upload-input" />
              <span className="upload-text">Arrastra una imagen aquí o haz clic para seleccionar</span>
              <span className="upload-hint">PNG, JPG o WebP con un código QR</span>
            </label>
          </section>
        </div>

        {/* Los resultados se movieron arriba para mayor visibilidad */}

        {validacionesGuardadas.length > 0 && (
          <section className="validaciones-guardadas card">
            <div className="validaciones-header">
              <h3>Validaciones guardadas</h3>
              <button type="button" className="btn-icon" onClick={borrarValidaciones} title="Borrar todas">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
            <p className="validaciones-hint">Se guardan solo en este navegador. Últimas {MAX_GUARDADOS}.</p>
            <ul className="validaciones-lista">
              {validacionesGuardadas.map((v) => {
                if (!v || !v.data) return null;
                return (
                  <li key={v.id} className="validacion-item">
                    <div className="validacion-item-header">
                      <strong>{v.data.nombre ?? '—'}</strong>
                      <span className="validacion-fecha">{formatearFecha(v.fecha)}</span>
                    </div>
                    <div className="validacion-item-carnet">
                      <CarnetCard datos={v.data} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
