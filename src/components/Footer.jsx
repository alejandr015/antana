import React from 'react';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';

function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <div>
            <h2 className="logo footer-logo">
              <img src="/logo.webp" alt="Antana Logo" className="nav-logo-img" loading="lazy" decoding="async" />
              <span className="logo-text">ANT<span>ANA</span></span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Neiva, Huila. La mejor hamburguesa de la ciudad.</p>
            <div className="social-links">
              <a href="https://www.instagram.com/antanahamburgueseria/" target="_blank" rel="noreferrer" className="social-icon ig" title="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="social-icon fb" title="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://wa.me/+573204449987" target="_blank" rel="noreferrer" className="social-icon wa" title="WhatsApp">
                <svg viewBox="0 0 448 512" width="20" height="20" fill="currentColor">
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Ubicación</h4>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Antana+Hamburgueseria,+Cra.+5a+%2321-54,+Neiva,+Huila"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'block', textDecoration: 'none', position: 'relative' }}
              title="Abrir en Google Maps"
            >
              <div style={{ width: '100%', height: '200px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)', position: 'relative' }}>
                {/* Capa invisible para capturar el click sobre el iframe */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, cursor: 'pointer' }}></div>
                <iframe
                  src="https://maps.google.com/maps?q=Antana%20Hamburgueseria,%20Neiva,%20Huila&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de Antana"
                ></iframe>
              </div>
              <p style={{ color: 'var(--accent-yellow)', fontSize: '0.9rem', marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📍 Cra. 5a #21-54, Neiva, Huila
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>(Click para abrir mapa)</span>
              </p>
            </a>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Contacto & Horarios</h4>
            <ul style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', padding: 0 }}>
              <li><strong>Martes - Domingo:</strong></li>
              <li>5:20 PM - 10:00 PM</li>
              <li style={{ marginTop: '1rem' }}><strong>Teléfonos:</strong></li>
              <li>320 4449987</li>
              <li>311 2386228</li>
            </ul>
          </div>
        </div>
        <div style={{ marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <p>&copy; {new Date().getFullYear()} Antana Hamburguesería. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
