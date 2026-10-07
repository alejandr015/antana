import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu as MenuIcon, X, Settings } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../hooks/useBranding';
import LoadingScreen from './LoadingScreen';

function Navbar() {
  const { cartCount, toggleCart } = useCart();
  const { user, isAdmin } = useAuth();
  const branding = useBranding();
  const [scrolled, setScrolled] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <>
      {isTransitioning && <LoadingScreen />}
      <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
      <div className="container nav-container">
        <Link to="/" className="logo">
          <img src={branding.logoUrl} alt="Logo" className="nav-logo-img" loading="lazy" decoding="async" />
          <span className="logo-text">ANT<span>ANA</span></span>
        </Link>
        <ul className="nav-links">
          <li><Link to="/" className="nav-link">Inicio</Link></li>
          <li><Link to="/menu" className="nav-link">Menú</Link></li>
          {isAdmin && (
            <li>
              <a 
                href="/admin" 
                className="nav-link" 
                onClick={(e) => {
                  e.preventDefault();
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setIsTransitioning(false);
                    navigate('/admin');
                  }, 1200);
                }}
              >
                Admin
              </a>
            </li>
          )}
        </ul>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
        </div>
      </div>
    </nav>
    </>
  );
}

export default Navbar;
