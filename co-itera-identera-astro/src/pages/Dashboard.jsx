import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    byCargo: {},
    recent: []
  });

  useEffect(() => {
    async function loadStats() {
      const validaciones = await apiService.getValidaciones();
      
      const byCargo = validaciones.reduce((acc, curr) => {
        if (!curr || !curr.data) return acc;
        const cargo = curr.data.cargo || 'Sin cargo';
        acc[cargo] = (acc[cargo] || 0) + 1;
        return acc;
      }, {});

      setStats({
        total: validaciones.length,
        byCargo,
        recent: validaciones.slice(0, 5)
      });
    }
    loadStats();
  }, []);

  return (
    <div className="dashboard-page page-wrap">
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="page-title">Gestión de Identidad</h1>
          <p className="page-desc">Bienvenido a tu panel de control premium.</p>
        </header>

        <div className="stats-grid">
          <div className="stat-card glass">
            <span className="stat-label">Total Carnets</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-card glass highlight">
            <span className="stat-label">Cargos Registrados</span>
            <span className="stat-value">{Object.keys(stats.byCargo).length}</span>
          </div>
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-section card">
            <h2>Distribución por Cargo</h2>
            <div className="cargo-list">
              {Object.entries(stats.byCargo).map(([cargo, count]) => (
                <div key={cargo} className="cargo-item">
                  <span className="cargo-name">{cargo}</span>
                  <div className="cargo-bar-wrap">
                    <div 
                      className="cargo-bar" 
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="cargo-count">{count}</span>
                </div>
              ))}
              {stats.total === 0 && <p className="empty-msg">No hay carnets generados aún.</p>}
            </div>
          </section>

          <section className="dashboard-section card">
            <h2>Acciones Rápidas</h2>
            <div className="quick-actions">
              <Link to="/crear" className="action-btn glass">
                <span className="icon">➕</span>
                Nuevo Carnet
              </Link>
              <Link to="/escaneo-masa" className="action-btn glass">
                <span className="icon">📷</span>
                Escaneo en Masa
              </Link>
              <Link to="/mis-carnets" className="action-btn glass">
                <span className="icon">📇</span>
                Ver Historial
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
