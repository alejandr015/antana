import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBranding } from '../hooks/useBranding';

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
          <div className="hero-actions reveal active">
            <Link to="/menu" className="cta-button">Ver Menú Completo</Link>
          </div>
        </div>
      </header>

    </>
  );
}

export default Home;
