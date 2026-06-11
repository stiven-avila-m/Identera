import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { toastService } from '../components/toastService';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await authService.login(email, password);
      toastService.success('¡Bienvenido de nuevo!');
      if (user && user.role === 'USUARIO') {
        navigate('/crear');
      } else {
        navigate('/');
      }
      window.location.reload(); 
    } catch (err) {
      toastService.error(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card glass">
        <div className="login-header">
          <img 
            src="/identera-modo-dia.png" 
            alt="Identera Logo" 
            className="login-logo-img light-logo"
          />
          <img 
            src="/identera-modo-noche.png" 
            alt="Identera Logo" 
            className="login-logo-img dark-logo"
          />
          <p className="login-subtitle">Accede a tu panel</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Correo electrónico</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn primary btn-block" disabled={loading}>
            {loading ? 'Procesando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
