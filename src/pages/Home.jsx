import React, { useState, useEffect } from 'react';
import { getMenuItems } from '../services/db';
import { Link } from 'react-router-dom';

function Home() {
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

  const categories = ['Hamburguesas', 'Salchipapas', 'Perros Calientes', 'Bebidas', 'Adicionales'];

  return (
    <>
      <header id="hero">
        <div className="hero-image-bg">
          <img src="/hero-burger.webp" alt="Hamburguesa Gourmet Antana" loading="lazy" decoding="async" />
        </div>
        <div className="container hero-content">
          <span className="hero-badge reveal active">Neiva, Huila</span>
          <h1 className="hero-title reveal active">Sabor <span>Angus</span> Inigualable</h1>
          <p className="hero-description reveal active">Una mezcla perfecta entre lo industrial y lo retro. Disfruta de la mejor carne Angus certificada en el corazón de Neiva.</p>
          <div className="hero-actions reveal active">
            <Link to="/menu" className="cta-button">Ver Menú Completo</Link>
          </div>
        </div>
      </header>

    </>
  );
}

export default Home;
