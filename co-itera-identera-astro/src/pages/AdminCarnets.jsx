import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { toastService } from '../components/toastService';
import './AdminCarnets.css'; // New premium layout CSS

export default function AdminCarnets() {
  const navigate = useNavigate();
  const [carnets, setCarnets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCarnets();
  }, []);

  const loadCarnets = async () => {
    try {
      const data = await apiService.getValidaciones();
      setCarnets(data);
    } catch (err) {
      toastService.error('Error al cargar carnets');
    }
  };

  const handleEdit = (carnet) => {
    navigate(`/crear?userId=${carnet.userId}`);
  };

  const filteredCarnets = carnets.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      (c.data.nombre && c.data.nombre.toLowerCase().includes(term)) ||
      (c.data.cargo && c.data.cargo.toLowerCase().includes(term)) ||
      (c.id && c.id.toLowerCase().includes(term))
    );
  });

  return (
    <div className="admin-dashboard page-wrap">
      <header className="admin-header">
        <div>
          <h1 className="page-title">🔍 Gestión de Carnets</h1>
          <p className="page-desc">Busca, edita y supervisa todos los carnets generados en la plataforma.</p>
        </div>
      </header>

      <section className="admin-search-section">
        <div className="admin-search-wrapper animate-item-1" style={{ maxWidth: '700px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Buscar por nombre, cargo o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="admin-stats-badge animate-item-2">
          Total de Carnets Activos: {carnets.length}
        </div>
      </section>

      <div className="carnets-grid">
        {filteredCarnets.length > 0 ? (
          filteredCarnets.map((carnet, index) => (
            <div 
              key={carnet.id} 
              className="carnet-admin-card animate-item-3" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="admin-card-header">
                <div className="admin-card-name-group">
                  <h3 className="admin-card-name">{carnet.data.nombre || 'Sin Nombre'}</h3>
                  <span className="admin-card-id" title={carnet.data.codigoValidador}>
                    ID: {carnet.data.codigoValidador?.substring(0,8)}...
                  </span>
                </div>
              </div>

              <div className="admin-card-body">
                <div className="admin-card-data">
                  <span className="data-icon">💼</span>
                  <span>{carnet.data.cargo || 'Sin Cargo'}</span>
                </div>
                <div className="admin-card-data">
                  <span className="data-icon">📋</span>
                  <span>{carnet.data.cedula || 'Sin Cédula'}</span>
                </div>
                <div className="admin-card-data" style={{ opacity: 0.6, fontSize: '0.85rem', marginTop: 'auto' }}>
                  <span className="data-icon">📅</span>
                  <span>Creado: {new Date(carnet.fecha).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="admin-card-actions">
                <button className="action-btn-prm edit-btn-prm" onClick={() => handleEdit(carnet)}>
                  ✏️ Editar
                </button>
                <button 
                  className="action-btn-prm delete-btn-prm" 
                  onClick={async () => {
                    if(window.confirm(`¿Seguro que deseas eliminar el carnet de ${carnet.data.nombre}?`)) {
                      await apiService.deleteValidacion(carnet.id);
                      loadCarnets();
                      toastService.success('Carnet eliminado con éxito');
                    }
                  }}>
                  🗑️ Borrar
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state-prm animate-item-2">
            <div className="icon-huge">🔎</div>
            <h3>No hay resultados</h3>
            <p>No se encontraron carnets con tu búsqueda actual.</p>
          </div>
        )}
      </div>

    </div>
  );
}
