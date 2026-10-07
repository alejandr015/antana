import React from 'react';
import { Instagram, Facebook, MapPin, Clock, Phone, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBranding } from '../hooks/useBranding';

function Footer() {
  const branding = useBranding();

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--glass-border)',
    borderRadius: '20px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  };

  const iconVariants = {
    hover: { scale: 1.15, rotate: 5, color: 'var(--accent-yellow)' },
    tap: { scale: 0.95 }
  };

  return (
    <footer style={{ position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(8, 8, 8, 0.8)' }}>
      {/* Resplandor sutil en el fondo del footer */}
      <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '60%', height: '100%', background: 'radial-gradient(ellipse at center, rgba(229,169,0,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '4rem 1rem 2rem 1rem' }}>
        <div className="footer-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
          
          {/* Columna 1: Branding y Redes */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={cardStyle}
          >
            <h2 className="logo footer-logo" style={{ marginBottom: '1.5rem' }}>
              <img src={branding.logoUrl} alt="Logo" className="nav-logo-img" loading="lazy" decoding="async" />
              <span className="logo-text">ANT<span>ANA</span></span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6', flex: 1 }}>
              {branding.description || 'Neiva, Huila. La mejor hamburguesa de la ciudad. Una mezcla perfecta entre lo industrial y lo retro.'}
            </p>
            <div className="social-links" style={{ display: 'flex', gap: '1rem' }}>
              <motion.a href="https://www.instagram.com/antanahamburgueseria/" target="_blank" rel="noreferrer" 
                className="social-icon ig" title="Instagram"
                variants={iconVariants} whileHover="hover" whileTap="tap"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Instagram size={22} />
              </motion.a>
              <motion.a href="#" className="social-icon fb" title="Facebook"
                variants={iconVariants} whileHover="hover" whileTap="tap"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Facebook size={22} />
              </motion.a>
              <motion.a href="https://wa.me/+573204449987" target="_blank" rel="noreferrer" className="social-icon wa" title="WhatsApp"
                variants={iconVariants} whileHover="hover" whileTap="tap"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <svg viewBox="0 0 448 512" width="22" height="22" fill="currentColor">
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
                </svg>
              </motion.a>
            </div>
          </motion.div>

          {/* Columna 2: Mapa */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={cardStyle}
          >
            <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} color="var(--accent-yellow)" /> Ubicación
            </h4>
            
            <motion.a
              href="https://www.google.com/maps/search/?api=1&query=Antana+Hamburgueseria,+Cra.+5a+%2321-54,+Neiva,+Huila"
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.02, boxShadow: '0 8px 25px rgba(229,169,0,0.15)' }}
              whileTap={{ scale: 0.98 }}
              style={{ display: 'block', textDecoration: 'none', position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flex: 1, minHeight: '180px' }}
              title="Abrir en Google Maps"
            >
              {/* Capa invisible para capturar el click sobre el iframe de forma segura */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, cursor: 'pointer', background: 'rgba(0,0,0,0.1)', transition: 'background 0.3s' }} className="map-overlay">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(18,18,18,0.9)', padding: '0.8rem 1.2rem', borderRadius: '30px', color: '#fff', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--accent-yellow)' }}
                >
                  <Navigation size={16} /> Abrir Mapa
                </motion.div>
              </div>
              <iframe
                src="https://maps.google.com/maps?q=Antana%20Hamburgueseria,%20Neiva,%20Huila&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, pointerEvents: 'none' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Antana"
              ></iframe>
            </motion.a>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
              Cra. 5a #21-54, Neiva, Huila
            </p>
          </motion.div>

          {/* Columna 3: Horarios y Contacto */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={cardStyle}
          >
            <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="var(--accent-yellow)" /> Contacto & Horarios
            </h4>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <motion.div whileHover={{ x: 5 }} style={{ transition: 'transform 0.2s' }}>
                <span style={{ color: 'var(--accent-yellow)', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Días de atención</span>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.3rem', fontSize: '1.05rem' }}>Martes a Domingo</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginTop: '0.2rem' }}>5:20 PM - 10:00 PM</p>
              </motion.div>

              <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>

              <motion.div whileHover={{ x: 5 }} style={{ transition: 'transform 0.2s' }}>
                <span style={{ color: 'var(--accent-yellow)', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Phone size={14} /> Líneas de atención
                </span>
                <a href="tel:+573204449987" style={{ display: 'block', color: 'var(--text-secondary)', marginTop: '0.5rem', textDecoration: 'none', fontSize: '1.05rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>
                  320 444 9987
                </a>
                <a href="tel:+573112386228" style={{ display: 'block', color: 'var(--text-secondary)', marginTop: '0.2rem', textDecoration: 'none', fontSize: '1.05rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>
                  311 238 6228
                </a>
              </motion.div>
            </div>
          </motion.div>

        </div>

        {/* Derechos Reservados */}
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <p>
            <Link to="/login" style={{ color: 'inherit', textDecoration: 'none', cursor: 'default' }} title="">&copy;</Link> {new Date().getFullYear()} Antana Hamburguesería. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
