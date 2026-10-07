import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

function AlertModal({ isOpen, message, title = "Información", onClose, onConfirm, confirmText = "Aceptar y Continuar", cancelText = "Entendido" }) {
  // Función para parsear {link_mapa}
  const renderMessage = () => {
    if (!message) return null;
    const parts = message.split('{link_mapa}');
    if (parts.length === 1) return message;

    return (
      <>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Antana+Hamburgueseria,+Cra.+5a+%2321-54,+Neiva,+Huila" 
                target="_blank" 
                rel="noreferrer"
                style={{ color: 'var(--accent-yellow)', textDecoration: 'underline', fontWeight: 'bold' }}
              >
                Antana Hamburguesería
              </a>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(5px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            {/* MODAL */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="glass"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--accent-yellow)',
                boxShadow: '0 0 30px rgba(229, 169, 0, 0.2)',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '400px',
                width: '100%',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--accent-yellow)' }}>
                <AlertCircle size={48} />
              </div>
              
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                {title}
              </h3>
              
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.5' }}>
                {renderMessage()}
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', flexDirection: onConfirm ? 'row' : 'column' }}>
                <button
                  onClick={onClose}
                  className="cta-button"
                  style={{ 
                    flex: 1, 
                    background: onConfirm ? 'transparent' : 'var(--accent-yellow)', 
                    color: onConfirm ? 'var(--text-secondary)' : 'black',
                    border: onConfirm ? '1px solid var(--glass-border)' : 'none'
                  }}
                >
                  {cancelText}
                </button>
                
                {onConfirm && (
                  <button
                    onClick={() => { onClose(); onConfirm(); }}
                    className="cta-button"
                    style={{ flex: 1 }}
                  >
                    {confirmText}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AlertModal;
