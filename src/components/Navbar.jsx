import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Lock, Menu as MenuIcon, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { cartCount, toggleCart } = useCart();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    // Si estamos en /menu, forzar el background oscuro
    if (location.pathname !== '/') {
      setScrolled(true);
      window.removeEventListener('scroll', handleScroll);
    } else {
      window.addEventListener('scroll', handleScroll);
      handleScroll(); // Trigger inicial
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
      <div className="container nav-container">
        <Link to="/" className="logo">
          <img src="/logo.webp" alt="Antana Logo" className="nav-logo-img" loading="lazy" decoding="async" />
          <span className="logo-text">ANT<span>ANA</span></span>
        </Link>
        <ul className="nav-links">
          <li><Link to="/" className="nav-link">Inicio</Link></li>
          <li><Link to="/menu" className="nav-link">Menú</Link></li>
          {user && (
            <li><Link to="/admin" className="nav-link">Admin</Link></li>
          )}
        </ul>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {!user && (
            <Link 
              to="/login" 
              className="cart-icon-btn" 
              style={{ color: 'white', padding: '0.5rem', display: 'flex' }}
              title="Iniciar Sesión Admin"
            >
              <Lock size={20} />
            </Link>
          )}
          <button 
            onClick={toggleCart} 
            className="cart-icon-btn"
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'white', 
              cursor: 'pointer', 
              position: 'relative',
              padding: '0.5rem'
            }}
          >
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: 'var(--accent-pink)',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                transform: 'translate(25%, -25%)'
              }}>
                {cartCount}
              </span>
            )}
          </button>
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-overlay">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
            <li><Link to="/" className="nav-link" style={{ fontSize: '1.5rem' }}>Inicio</Link></li>
            <li><Link to="/menu" className="nav-link" style={{ fontSize: '1.5rem' }}>Menú</Link></li>
            {user && (
              <li><Link to="/admin" className="nav-link" style={{ fontSize: '1.5rem', color: 'var(--accent-yellow)' }}>Admin</Link></li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
