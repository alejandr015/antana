import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Plus, Check } from 'lucide-react';

function AdminProductModal({
  isOpen,
  onClose,
  editingItem,
  formData,
  handleChange,
  handleImageChange,
  handleSubmit,
  categories,
  isUploading
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
          className="admin-modal-content glass"
        >
          {/* Cabecera del Modal */}
          <div className="admin-modal-header">
            <div>
              <span className="admin-modal-tag">
                {editingItem ? 'Modo Edición' : 'Nuevo Producto'}
              </span>
              <h3 className="admin-modal-title">
                {editingItem ? 'Editar Plato' : 'Crear Nuevo Plato'}
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
          <form onSubmit={handleSubmit} className="admin-modal-form">
            <div className="admin-form-group">
              <label>Categoría</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="admin-input"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label>Nombre del Plato</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ej. Doble Smash Bacon"
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label>Descripción detallada</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Ingredientes, preparación y detalles del plato..."
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label>Precio ($ COP)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="Ej. 24000"
                className="admin-input"
              />
            </div>

            {/* Subida y optimización de imagen */}
            <div className="admin-form-group">
              <label>Fotografía del Plato</label>
              <div className="admin-image-upload-wrapper">
                {formData.imageUrl ? (
                  <div className="admin-image-preview-container">
                    <img
                      src={formData.imageUrl}
                      alt="Vista previa"
                      className="admin-image-preview"
                    />
                    <span className="admin-image-tag">
                      <Check size={14} /> Lista
                    </span>
                  </div>
                ) : (
                  <div className="admin-image-placeholder">
                    <Upload size={32} />
                    <span>Selecciona una foto desde tu equipo o celular</span>
                  </div>
                )}

                <label className={`cta-button admin-upload-trigger ${isUploading ? 'disabled' : ''}`}>
                  <Upload size={18} />
                  {isUploading ? 'Optimizando imagen...' : (formData.imageUrl ? 'Cambiar Foto' : 'Subir Foto')}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isUploading}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <p className="admin-input-hint">
                💡 Se recorta y optimiza a formato cuadrado WebP automáticamente.
              </p>
            </div>

            {/* Botones de acción */}
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
                disabled={isUploading || !formData.imageUrl}
              >
                {editingItem ? <Check size={18} /> : <Plus size={18} />}
                {editingItem ? 'Guardar Cambios' : 'Añadir al Menú'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AdminProductModal;
