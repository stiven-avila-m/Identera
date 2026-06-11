import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>404</h1>
      <p style={{ color: 'var(--muted)', margin: 0, fontSize: '1.1rem' }}>
        Esta página no existe. Puede que te hayas equivocado de ruta.
      </p>
      <Link to="/" className="btn primary" style={{ marginTop: '0.5rem' }}>
        Volver al inicio
      </Link>
    </div>
  );
}
