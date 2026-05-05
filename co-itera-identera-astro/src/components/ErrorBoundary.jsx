import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary detectó un error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    // Si el error fue causado por datos corruptos en el navegador, esto lo limpia
    localStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0b1120', color: '#f1f5f9' }}>
          <h1 style={{ color: '#ef4444' }}>Ocurrió un error crítico</h1>
          <p>Un problema con la memoria del navegador interrumpió la aplicación.</p>
          <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', margin: '1rem 0', maxWidth: '800px', overflow: 'auto' }}>
            <code style={{ color: '#f87171' }}>{this.state.error?.toString()}</code>
            <pre style={{ fontSize: '12px', marginTop: '1rem', color: '#94a3b8' }}>{this.state.errorInfo?.componentStack}</pre>
          </div>
          <button 
            onClick={this.handleReset}
            style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Limpiar memoria corrupta y Restaurar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
