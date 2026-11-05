import React from 'react';

/**
 * ISO/IEC 25010 – Fiabilidad (Tolerancia a fallos y Capacidad de recuperación)
 * Captura errores de renderizado o fallos de red al descargar chunks (Lazy Loading)
 * evitando que la aplicación quede en pantalla en blanco.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ISO-25010 ErrorBoundary]:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            minHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            color: 'white'
          }}
        >
          <h2 style={{ color: 'var(--accent-yellow)', marginBottom: '0.8rem' }}>
            Algo salió mal al cargar esta sección
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Puede deberse a un corte momentáneo de conexión. Tus productos en el carrito están seguros.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="cta-button"
            style={{ cursor: 'pointer' }}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

