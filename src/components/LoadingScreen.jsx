import React from 'react';
import { motion } from 'framer-motion';

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
      {/* Esfera de luz de fondo (blur) acelerada por hardware */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.3, 0.15]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          width: '50vw', 
          height: '50vw',
          maxWidth: '400px',
          maxHeight: '400px',
          background: 'var(--accent-yellow)', 
          filter: 'blur(60px)', 
          borderRadius: '50%',
          zIndex: 0 
        }} 
      />

      {/* Contenedor principal */}
      <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Ícono del Planeta Animado */}
        <motion.img 
          src="/anim_planet.png" 
          alt="Antana Icon"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, -12, 0] // Efecto de levitación
          }}
          transition={{ 
            opacity: { duration: 0.5 },
            scale: { duration: 0.5, type: 'spring', stiffness: 200 },
            y: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
          }}
          style={{ 
            width: '160px', 
            height: '160px', 
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 10px rgba(229, 169, 0, 0.6)) brightness(1.2)',
            marginBottom: '-1.5rem',
            position: 'relative',
            zIndex: 2
          }}
        />

        {/* Nombre de la Marca con Diseño Original */}
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            fontFamily: "'Audiowide', cursive",
            fontSize: '2.5rem',
            fontWeight: 'normal',
            color: 'white',
            margin: '0 0 1.2rem 0',
            letterSpacing: '5px',
            textTransform: 'uppercase',
            textShadow: '0 4px 15px rgba(0,0,0,0.5)',
            transform: 'scaleX(1.1)' /* Ensancha sutilmente la letra para igualar la proporción original */
          }}
        >
          <span style={{ color: 'var(--accent-yellow)' }}>ANT</span>ANA
        </motion.h1>
        
        {/* Barra de Carga Moderna */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ 
            width: '150px', 
            height: '3px', 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '4px',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <motion.div 
            animate={{ 
              x: ['-100%', '150%'] 
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '60%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, var(--accent-yellow), transparent)',
              borderRadius: '4px'
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default LoadingScreen;
