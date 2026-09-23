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
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="admin-modal-content glass admin-modal-compact"
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

            <div className="admin-modal-actions">
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
