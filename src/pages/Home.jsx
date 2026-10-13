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

          {/* Barra de información esencial: Horario, Ubicación, Redes y Modalidades de Pedido */}
          <div className="hero-quick-bar reveal active">
            {/* Horario */}
            <div className="quick-info-card">
              <div className="quick-info-icon-box">
                <Clock size={20} />
              </div>
              <div className="quick-info-details">
                <span className="quick-info-label">Horario de Atención</span>
                <span className="quick-info-val">Mar a Dom · 5:20 PM - 10:00 PM</span>
              </div>
            </div>

            {/* Ubicación */}
            <a 
              href="https://maps.google.com/maps?q=Antana%20Hamburgueseria,%20Neiva,%20Huila" 
              target="_blank" 
              rel="noreferrer" 
              className="quick-info-card"
              title="Abrir en Google Maps"
            >
              <div className="quick-info-icon-box">
                <MapPin size={20} />
              </div>
              <div className="quick-info-details">
                <span className="quick-info-label">Ubicación</span>
                <span className="quick-info-val">Cra. 5a #21-54, Neiva ↗</span>
              </div>
            </a>

            {/* Modalidad de Pedidos */}
            <div className="quick-info-card" onClick={scrollToMenu} style={{ cursor: 'pointer' }}>
              <div className="quick-info-icon-box">
                <Bike size={20} />
              </div>
              <div className="quick-info-details">
                <span className="quick-info-label">Pedidos Disponibles</span>
                <span className="quick-info-val">🛵 Domicilio & 🛍️ Para Recoger</span>
              </div>
            </div>

            {/* Redes y Contacto */}
            <div className="quick-info-card">
              <div className="quick-info-icon-box" style={{ background: 'rgba(255, 45, 85, 0.12)', color: 'var(--accent-pink)', borderColor: 'rgba(255, 45, 85, 0.2)' }}>
                <Instagram size={20} />
              </div>
              <div className="quick-info-details">
                <span className="quick-info-label">Redes & Contacto</span>
                <div className="quick-social-btns">
                  <a href="https://www.instagram.com/antanahamburgueseria/" target="_blank" rel="noreferrer" className="quick-social-pill" title="Instagram">
                    <Instagram size={15} />
                  </a>
                  <a href="https://wa.me/+573204449987" target="_blank" rel="noreferrer" className="quick-social-pill" title="WhatsApp 320 444 9987">
                    <Phone size={15} />
                  </a>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', marginLeft: '2px' }}>320 444 9987</span>
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
