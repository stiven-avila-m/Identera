import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();
  const user = authService.getCurrentUser();

  return (
    <footer className="footer">
      <div className="footer-inner" style={{ justifyContent: 'center' }}>
        <p className="footer-copy" style={{ margin: 0 }}>© {year} Identera. Carnets con código validador.</p>
      </div>
    </footer>
  );
}
