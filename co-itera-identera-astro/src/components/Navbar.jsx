import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { toastService } from './toastService';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    // Cerrar menú móvil al cambiar de ruta
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    toastService.success('Sesión cerrada');
    setTimeout(() => {
      window.location.href = '/';
    }, 800); // Darle tiempo al Toast de ser visto
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img 
            src={isDark ? "/identera-modo-noche.png" : "/identera-modo-dia.png"} 
            alt="Identera Logo" 
            className="navbar-logo"
          />
        </Link>
        
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <nav className={`navbar-links ${isMenuOpen ? 'mobile-open' : ''}`}>
          
          {user ? (
            <>
              {user.role === 'ADMINISTRADOR' && (
                <>
                  <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Gestión de Iterantes</Link>
                  <Link to="/admin-carnets" className={location.pathname === '/admin-carnets' ? 'active' : ''}>Gestión de Carnets</Link>
                  <Link to="/crear" className={location.pathname === '/crear' ? 'active' : ''}>Crear Carnet</Link>
                </>
              )}

              {user.role === 'USUARIO' && (
                <>
                  <Link to="/crear" className={location.pathname === '/crear' ? 'active' : ''}>Mi Carnet</Link>
                </>
              )}

              {user.role === 'SEGURIDAD' && (
                <>
                  <Link to="/validar" className={location.pathname === '/validar' ? 'active' : ''}>Validar</Link>
                  <Link to="/escaneo-masa" className={location.pathname === '/escaneo-masa' ? 'active' : ''}>Escaneo en Masa</Link>
                </>
              )}

              <div className="user-nav">
                <span className="user-name">Hola, {user.name}</span>
                <button onClick={handleLogout} className="btn-link logout-btn">Cerrar Sesión</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={location.pathname === '/login' ? 'active' : 'login-btn-nav'}>Iniciar Sesión</Link>
            </>
          )}

          <button 
            type="button" 
            className="theme-toggle" 
            onClick={() => setIsDark(!isDark)}
            title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </nav>
      </div>
    </header>
  );
}
