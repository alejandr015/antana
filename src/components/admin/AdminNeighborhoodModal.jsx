import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check } from 'lucide-react';

function AdminNeighborhoodModal({
  isOpen,
  onClose,
  editingNeighborhood,
  neighborhoodData,
  handleChangeNb,
  handleSubmitNb
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    if (neighborhoodData.isRestricted) {
      setIsExpanded(true);
    } else {
      const timer = setTimeout(() => setIsExpanded(false), 200); // Wait for exit animation
      return () => clearTimeout(timer);
    }
  }, [neighborhoodData.isRestricted]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="admin-modal-overlay"
      >
        <motion.div
          initial={{ scale: 0.98, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.98, opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className={`admin-modal-content glass admin-modal-compact ${isExpanded ? 'admin-modal-wide' : ''}`}
          style={{ overflowX: 'hidden', overflowY: 'auto' }}
        >
          {/* Cabecera del Modal */}
          <div className="admin-modal-header">
            <div>
              <span className="admin-modal-tag">
                {editingNeighborhood ? 'Modo Edición' : 'Nueva Tarifa'}
              </span>
              <h3 className="admin-modal-title">
                {editingNeighborhood ? 'Editar Barrio' : 'Añadir Nuevo Barrio'}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="admin-modal-close-btn"
              title="Cerrar ventana"
            >
              <X size={22} />
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmitNb} className="admin-modal-form">
            <div className={`admin-neighborhood-split ${isExpanded ? 'is-expanded' : ''}`}>
              <div className="form-side" style={{ minWidth: '280px', flex: 1 }}>
                <div className="admin-form-group">
              <label>Nombre del Barrio / Sector</label>
              <input
                type="text"
                name="name"
                value={neighborhoodData.name}
                onChange={handleChangeNb}
                required
                placeholder="Ej. Quirinal, Ipanema, Prado Alto..."
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label>Costo de Domicilio ($ COP)</label>
              <input
                type="number"
                name="price"
                value={neighborhoodData.price}
                onChange={handleChangeNb}
                required
                placeholder="Ej. 6000"
                className="admin-input"
              />
            </div>

            <div className="admin-form-group" style={{ marginTop: '1rem' }}>
              <label 
                htmlFor="isRestricted"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  background: neighborhoodData.isRestricted ? 'rgba(255, 60, 60, 0.1)' : 'rgba(255,255,255,0.03)',
                  border: neighborhoodData.isRestricted ? '1px solid var(--accent-pink)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ color: neighborhoodData.isRestricted ? 'var(--accent-pink)' : 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                    Zona Restringida / Difícil Acceso
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                    Actívalo para configurar un punto de encuentro.
                  </span>
                </div>
                
                {/* Custom Toggle Switch */}
                <div style={{
                  position: 'relative',
                  width: '46px',
                  height: '24px',
                  background: neighborhoodData.isRestricted ? 'var(--accent-pink)' : 'rgba(255,255,255,0.2)',
                  borderRadius: '24px',
                  transition: 'all 0.3s ease',
                  flexShrink: 0
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: neighborhoodData.isRestricted ? '24px' : '2px',
                    width: '20px',
                    height: '20px',
                    background: 'white',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
                
                {/* Hidden Checkbox */}
                <input
                  type="checkbox"
                  id="isRestricted"
                  name="isRestricted"
                  checked={neighborhoodData.isRestricted || false}
                  onChange={handleChangeNb}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            </div> {/* Fin form-side */}

            <AnimatePresence>
            {neighborhoodData.isRestricted && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1, transition: { duration: 0.2 } }} 
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className="options-side"
                style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', borderLeft: '3px solid var(--accent-pink)', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box' }}
              >
                <div>
                  <div className="admin-form-group">
                  <label>Nombre del Lugar de Encuentro</label>
                  <input
                    type="text"
                    name="meetingPointName"
                    value={neighborhoodData.meetingPointName || ''}
                    onChange={handleChangeNb}
                    placeholder="Ej. Panadería Maxipan"
                    className="admin-input"
                    required={neighborhoodData.isRestricted}
                  />
                </div>
                
                <div className="admin-form-group">
                  <label>Dirección Exacta del Encuentro</label>
                  <input
                    type="text"
                    name="meetingPointAddress"
                    value={neighborhoodData.meetingPointAddress || ''}
                    onChange={handleChangeNb}
                    placeholder="Ej. Carrera 15 # 23-45"
                    className="admin-input"
                    required={neighborhoodData.isRestricted}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Mensaje de Alerta para el Cliente</label>
                  <textarea
                    name="customAlertMessage"
                    value={neighborhoodData.customAlertMessage || ''}
                    onChange={handleChangeNb}
                    placeholder="Ej. Por seguridad de nuestros repartidores, en este barrio solo hacemos entregas en..."
                    className="admin-input"
                    style={{ minHeight: '80px', resize: 'vertical' }}
                  />
                  </div>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
            </div> {/* Fin admin-neighborhood-split */}

            <div className="admin-modal-actions" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                type="button"
                onClick={onClose}
                className="admin-cancel-btn"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="cta-button admin-submit-btn"
              >
                {editingNeighborhood ? <Check size={18} /> : <Plus size={18} />}
                {editingNeighborhood ? 'Guardar Cambios' : 'Añadir Barrio'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AdminNeighborhoodModal;
