import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Marca */}
        <div className="footer-col footer-brand-col">
          <h4 className="footer-logo">ITERA<strong>PROCESS</strong></h4>
          <p className="footer-tagline">
            Transformación digital con propósito humano.
          </p>
          <a href="mailto:info.mx.df@iteraprocess.com" className="footer-email">
            info.mx.df@iteraprocess.com
          </a>
          <div className="footer-social">
            <a href="https://linkedin.com/company/itera-process" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://x.com/itera_process" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://facebook.com/IteraProcess.latam" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://instagram.com/itera.process" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z"/></svg>
            </a>
            <a href="https://youtube.com/channel/UCI1pId21btcbTVK8NYVUZYg" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a href="https://open.spotify.com/show/XXXXXXXXXX" target="_blank" rel="noopener noreferrer" aria-label="Spotify">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 6.82 8.16 3.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
            </a>
          </div>
        </div>

        {/* Nosotros */}
        <div className="footer-col">
          <h5 className="footer-heading">Nosotros</h5>
          <ul className="footer-links">
            <li><a href="https://iteraprocess.com/es_la/" target="_blank" rel="noopener noreferrer">Sobre nosotros</a></li>
            <li><a href="https://iteraprocess.com/es_la/" target="_blank" rel="noopener noreferrer">FAQs ITERA</a></li>
            <li><a href="https://iteraprocess.com/es_la/" target="_blank" rel="noopener noreferrer">Contáctanos</a></li>
            <li><a href="https://iteraprocess.com/es_la/" target="_blank" rel="noopener noreferrer">Orgullosamente Iterante</a></li>
            <li><a href="https://es.it-institute.org" target="_blank" rel="noopener noreferrer">IT Institute</a></li>
            <li><a href="https://iteraprocess.com/es_la/" target="_blank" rel="noopener noreferrer">Únete al equipo</a></li>
          </ul>
        </div>

        {/* Soporte */}
        <div className="footer-col">
          <h5 className="footer-heading">Soporte</h5>
          <ul className="footer-links">
            <li><a href="https://iteraprocess.com/es_la/" target="_blank" rel="noopener noreferrer">Buzón de escucha Itera</a></li>
            <li><a href="https://iteraprocess.com/es_la/" target="_blank" rel="noopener noreferrer">Realizar una denuncia</a></li>
            <li><a href="https://iteraprocess.com/es_la/" target="_blank" rel="noopener noreferrer">Aviso de privacidad LATAM</a></li>
            <li><a href="https://iteraprocess.com/es_la/" target="_blank" rel="noopener noreferrer">Aviso de privacidad España</a></li>
            <li><a href="https://iteraprocess.com/es_la/" target="_blank" rel="noopener noreferrer">Aviso Legal España</a></li>
          </ul>
        </div>

        {/* Políticas */}
        <div className="footer-col">
          <h5 className="footer-heading">Políticas</h5>
          <ul className="footer-links">
            <li><a href="https://iteraprocess.com/es_la/" target="_blank" rel="noopener noreferrer">SGI para Iterantes</a></li>
            <li><a href="https://iteraprocess.com/es_la/" target="_blank" rel="noopener noreferrer">SGI para proveedores</a></li>
            <li><a href="https://iteraprocess.com/es_la/" target="_blank" rel="noopener noreferrer">Esquema Nacional de Seguridad</a></li>
          </ul>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="footer-bottom">
        <p>© {year} Itera Process. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
