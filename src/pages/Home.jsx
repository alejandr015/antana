import React, { useEffect } from 'react';
import { useBranding } from '../hooks/useBranding';
import Menu from './Menu.jsx';
import { Clock, MapPin, Bike, Instagram, Phone, ArrowDown } from 'lucide-react';

function Home() {
  const branding = useBranding();
  
  // Función para convertir *palabra* en <span>palabra</span>
  const renderWithHighlights = (text) => {
    if (!text) return { __html: '' };
    // Primero escapamos el HTML para seguridad
    let safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Luego convertimos los asteriscos a spans (amarillo)
    safeText = safeText.replace(/\*(.*?)\*/g, '<span>$1</span>');
    return { __html: safeText };
  };

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.getElementById('navbar');
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToMenu = () => {
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header id="hero">
        <div className="hero-image-bg">
          <img src="/hero-burger.webp" alt="Hamburguesa Gourmet Antana" loading="lazy" decoding="async" />
        </div>
        <div className="container hero-content">
          <span className="hero-badge reveal active">Neiva, Huila</span>
          <h1 className="hero-title reveal active" dangerouslySetInnerHTML={renderWithHighlights(branding.title)}></h1>
          <p className="hero-description reveal active" dangerouslySetInnerHTML={renderWithHighlights(branding.description)}></p>
          
          <div className="hero-actions reveal active" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={scrollToMenu} className="cta-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
              <span>Ver Menú y Pedir</span>
              <ArrowDown size={18} />
            </button>
          </div>

          {/* Barra de información esencial: Horario, Ubicación, Redes y Modalidades de Pedido (2x2) */}
          <div className="hero-quick-bar reveal active">
            {/* Columna 1 - Fila 1: Horario */}
            <div className="quick-info-card card-horario">
              <div className="quick-info-icon-box">
                <Clock size={22} />
              </div>
              <div className="quick-info-details">
                <span className="quick-info-label">Horario de Atención</span>
                <span className="quick-info-val">Mar a Dom · 5:20 PM - 10:00 PM</span>
              </div>
            </div>

            {/* Columna 2 - Fila 1: Ubicación */}
            <a 
              href="https://maps.google.com/maps?q=Antana%20Hamburgueseria,%20Neiva,%20Huila" 
              target="_blank" 
              rel="noreferrer" 
              className="quick-info-card card-ubicacion"
              title="Abrir en Google Maps"
            >
              <div className="quick-info-icon-box">
                <MapPin size={22} />
              </div>
              <div className="quick-info-details">
                <span className="quick-info-label">Ubicación</span>
                <span className="quick-info-val">Cra. 5a #21-54, Neiva ↗</span>
              </div>
            </a>

            {/* Columna 1 - Fila 2: Modalidad de Pedidos */}
            <div className="quick-info-card card-pedidos" onClick={scrollToMenu} style={{ cursor: 'pointer' }}>
              <div className="quick-info-icon-box">
                <Bike size={22} />
              </div>
              <div className="quick-info-details">
                <span className="quick-info-label">Pedidos Disponibles</span>
                <span className="quick-info-val">🛵 Domicilio & 🛍️ Para Recoger</span>
              </div>
            </div>

            {/* Columna 2 - Fila 2: Redes y Contacto Directo */}
            <div className="quick-info-card quick-info-social-card card-redes">
              <div className="quick-info-details" style={{ width: '100%' }}>
                <span className="quick-info-label" style={{ marginBottom: '0.45rem' }}>Redes & Contacto Directo</span>
                <div className="quick-social-btns-row">
                  <a 
                    href="https://www.instagram.com/antanahamburgueseria/" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="brand-social-btn ig-btn"
                    title="Abrir Instagram de Antana"
                  >
                    <Instagram size={22} className="social-btn-icon" />
                    <span>Instagram</span>
                  </a>
                  <a 
                    href="https://wa.me/+573204449987" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="brand-social-btn wa-btn"
                    title="Escribir al WhatsApp de Antana"
                  >
                    <svg viewBox="0 0 448 512" width="22" height="22" fill="currentColor" className="social-btn-icon" style={{ flexShrink: 0 }}>
                      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Menú digital accesible de una vez en la página inicial */}
      <Menu isEmbedded={true} />
    </>
  );
}

export default Home;
