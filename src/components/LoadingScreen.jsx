import React from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';

function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {/* Fondo estético */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        width: '60vw', 
        height: '60vw', 
        background: 'radial-gradient(circle, rgba(229,169,0,0.15) 0%, rgba(0,0,0,0) 70%)', 
        filter: 'blur(40px)', 
        zIndex: 0 
      }} />

      {/* Contenido principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '3.5rem',
          color: 'var(--accent-yellow)',
          margin: '0 0 1rem 0',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          textShadow: '0 0 20px rgba(229, 169, 0, 0.4)'
        }}>
          Antana
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)' }}>
          <Loader size={24} className="spin" style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ fontSize: '1rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Cargando...</span>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1.5s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}

export default LoadingScreen;
