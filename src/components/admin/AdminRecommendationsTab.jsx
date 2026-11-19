import React, { useState } from 'react';
import { Sparkles, Plus, Pencil, Trash2, Check, X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { saveSettings } from '../../services/db';
import { getRecommendationTitleForCategory, SAUCE_PREFERENCE_OPTIONS } from '../../utils/orderUtils';
import AlertModal from '../AlertModal';

function AdminRecommendationsTab({ categories = [], settings, setSettings }) {
  const mainCategories = categories.filter(cat => !cat.startsWith('Extras - '));
  const [activeCategory, setActiveCategory] = useState(mainCategories[0] || 'Hamburguesas');
  const [newRecText, setNewRecText] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [recToDelete, setRecToDelete] = useState(null);
  const [previewSelected, setPreviewSelected] = useState([]);

  const getCategoryRecommendations = (cat) => {
    const map = settings?.productRecommendations || {};
    if (Array.isArray(map[cat])) return map[cat];
    return cat !== 'Bebidas' ? [...SAUCE_PREFERENCE_OPTIONS] : [];
  };

  const currentList = getCategoryRecommendations(activeCategory);

  const persistCategoryRecommendations = async (cat, updatedList, successMessage) => {
    try {
      const currentMap = settings?.productRecommendations || {};
      const updatedSettings = {
        ...settings,
        productRecommendations: {
          ...currentMap,
          [cat]: updatedList
        }
      };
      await saveSettings(updatedSettings);
      setSettings(updatedSettings);
      toast.success(successMessage);
    } catch (err) {
      toast.error('Error al guardar las recomendaciones');
    }
  };

  const handleCreate = async (e) => {
    if (e) e.preventDefault();
    const clean = newRecText.trim();
    if (!clean) {
      toast.error('Escribe el nombre de la recomendación');
      return;
    }
    if (currentList.some(r => r.toLowerCase() === clean.toLowerCase())) {
      toast.error('Esta recomendación ya existe en ' + activeCategory);
      return;
    }
    await persistCategoryRecommendations(
      activeCategory,
      [...currentList, clean],
      `Recomendación "${clean}" creada en ${activeCategory}`
    );
    setNewRecText('');
  };

  const handleStartEdit = (idx, text) => {
    setEditingIndex(idx);
    setEditingText(text);
  };

  const handleSaveEdit = async (idx) => {
    const clean = editingText.trim();
    if (!clean) {
      toast.error('El nombre de la recomendación no puede estar vacío');
      return;
    }
    if (currentList.some((r, i) => i !== idx && r.toLowerCase() === clean.toLowerCase())) {
      toast.error('Ya existe otra recomendación con ese nombre en ' + activeCategory);
      return;
    }
    const updatedList = currentList.map((item, i) => (i === idx ? clean : item));
    await persistCategoryRecommendations(
      activeCategory,
      updatedList,
      'Recomendación actualizada exitosamente'
    );
    setEditingIndex(null);
    setEditingText('');
  };

  const confirmDelete = async () => {
    if (recToDelete === null) return;
    const removedName = currentList[recToDelete];
    const updatedList = currentList.filter((_, i) => i !== recToDelete);
    await persistCategoryRecommendations(
      activeCategory,
      updatedList,
      `Recomendación "${removedName}" eliminada`
    );
    setRecToDelete(null);
    if (editingIndex === recToDelete) {
      setEditingIndex(null);
      setEditingText('');
    }
  };

  const handleRestoreDefaults = async () => {
    const defaults = activeCategory !== 'Bebidas' ? [...SAUCE_PREFERENCE_OPTIONS] : [];
    await persistCategoryRecommendations(
      activeCategory,
      defaults,
      `Recomendaciones predeterminadas restauradas en ${activeCategory}`
    );
  };

  const togglePreviewChip = (option) => {
    setPreviewSelected(prev =>
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    );
  };

  return (
    <div className="admin-tab-content">
      {/* Cabecera */}
      <div
        className="admin-tab-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          background: 'linear-gradient(90deg, rgba(229, 169, 0, 0.05) 0%, transparent 100%)',
          padding: '1.5rem',
          borderRadius: '12px',
          borderLeft: '4px solid var(--accent-yellow)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
          <div
            style={{
              background: 'rgba(229, 169, 0, 0.1)',
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-yellow)',
              boxShadow: '0 0 20px rgba(229, 169, 0, 0.15)'
            }}
          >
            <Sparkles size={30} />
          </div>
          <div>
            <h2
              className="admin-card-title"
              style={{ fontSize: '1.75rem', margin: '0 0 0.25rem 0', textShadow: '0 2px 10px rgba(229, 169, 0, 0.2)' }}
            >
              Recomendaciones por Categoría
            </h2>
            <p className="admin-card-subtitle" style={{ margin: 0, fontSize: '0.95rem', opacity: 0.85 }}>
              Crea, edita o elimina las opciones rápidas (ej. <em>Salsas aparte</em>, <em>Sin salsas</em>) para cada tipo de producto
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRestoreDefaults}
          className="cta-button admin-create-btn"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'var(--text-secondary)',
            fontSize: '0.88rem'
          }}
          title="Restaurar Salsas aparte y Sin salsas en esta categoría"
        >
          <RotateCcw size={17} />
          <span>Restaurar Predeterminadas</span>
        </button>
      </div>

      {/* Selector de Categorías */}
      <div className="admin-category-filter-wrapper glass" style={{ marginBottom: '1.8rem', padding: '1.25rem' }}>
        <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: '600' }}>
          1. Selecciona la categoría que deseas configurar:
        </span>
        <div className="admin-category-filter" style={{ paddingBottom: 0 }}>
          {mainCategories.map(cat => {
            const count = getCategoryRecommendations(cat).length;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setEditingIndex(null);
                  setEditingText('');
                  setPreviewSelected([]);
                }}
                className={`admin-filter-btn ${isActive ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>{cat}</span>
                <span
                  style={{
                    background: isActive ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.1)',
                    color: isActive ? '#000' : 'var(--accent-yellow)',
                    padding: '0.1rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.78rem',
                    fontWeight: 'bold'
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grilla de 2 columnas: Gestión CRUD + Vista Previa en Vivo */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}
      >
        {/* Columna Izquierda: Crear, Editar y Eliminar */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.2rem', color: 'var(--accent-yellow)' }}>
            2. Gestionar opciones de {activeCategory}
          </h3>
          <p style={{ margin: '0 0 1.2rem 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Añade nuevas recomendaciones o edita las existentes. Todas se verán reflejadas en el Carrito y en el mensaje de WhatsApp.
          </p>

          {/* Formulario Crear */}
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="admin-input"
              placeholder={`Nueva recomendación para ${activeCategory.toLowerCase()}...`}
              value={newRecText}
              onChange={e => setNewRecText(e.target.value)}
              maxLength={60}
              style={{ flex: '1 1 200px', margin: 0 }}
            />
            <button
              type="submit"
              className="cta-button"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.2rem', flexShrink: 0 }}
            >
              <Plus size={18} />
              <span>Crear</span>
            </button>
          </form>

          {/* Lista CRUD */}
          {currentList.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '12px',
                border: '1px dashed rgba(255,255,255,0.12)'
              }}
            >
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Esta categoría no tiene recomendaciones activas.
              </p>
              <p style={{ margin: '0.4rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Usa el campo de arriba para crear la primera opción.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {currentList.map((rec, idx) => (
                <div
                  key={`${rec}-${idx}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    background: editingIndex === idx ? 'rgba(229, 169, 0, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                    border: editingIndex === idx ? '1px solid var(--accent-yellow)' : '1px solid var(--glass-border)'
                  }}
                >
                  {editingIndex === idx ? (
                    <>
                      <input
                        type="text"
                        className="admin-input"
                        value={editingText}
                        onChange={e => setEditingText(e.target.value)}
                        maxLength={60}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveEdit(idx);
                          } else if (e.key === 'Escape') {
                            setEditingIndex(null);
                            setEditingText('');
                          }
                        }}
                        style={{ flex: 1, margin: 0, padding: '0.45rem 0.75rem' }}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: '0.45rem', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(idx)}
                          className="admin-icon-btn"
                          style={{ background: 'var(--accent-yellow)', color: '#000', border: 'none', borderRadius: '8px', padding: '0.45rem 0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold' }}
                          title="Guardar cambios"
                        >
                          <Check size={16} /> Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingIndex(null);
                            setEditingText('');
                          }}
                          className="admin-icon-btn"
                          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.45rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Cancelar edición"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            background: 'rgba(229, 169, 0, 0.15)',
                            color: 'var(--accent-yellow)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.78rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {idx + 1}
                        </span>
                        <span style={{ fontWeight: '600', fontSize: '0.96rem' }}>{rec}</span>
                      </div>

                      <div className="admin-card-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(idx, rec)}
                          className="admin-icon-btn cyan"
                          title="Editar recomendación"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecToDelete(idx)}
                          className="admin-icon-btn pink"
                          title="Eliminar recomendación"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Vista Previa en Vivo del Modal del Cliente */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.2rem', color: 'var(--accent-yellow)' }}>
            3. Vista Previa en el Pedido
          </h3>
          <p style={{ margin: '0 0 1.2rem 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Así se verá exactamente en el modal de personalización cuando el cliente pida en <strong>{activeCategory}</strong>:
          </p>

          <div
            style={{
              background: 'rgba(10, 10, 12, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '1.1rem'
            }}
          >
            {currentList.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', padding: '1rem 0' }}>
                (No se mostrará sección de recomendaciones en {activeCategory})
              </p>
            ) : (
              <>
                <p
                  style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '0.84rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {getRecommendationTitleForCategory(activeCategory)}
                </p>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {currentList.map(option => {
                    const isActive = previewSelected.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => togglePreviewChip(option)}
                        style={{
                          flex: '1 1 calc(50% - 8px)',
                          minWidth: '130px',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '10px',
                          border: isActive ? '1px solid var(--accent-yellow)' : '1px solid rgba(255,255,255,0.12)',
                          background: isActive ? 'rgba(229, 169, 0, 0.18)' : 'rgba(255,255,255,0.03)',
                          color: isActive ? 'var(--accent-yellow)' : 'var(--text-secondary)',
                          fontWeight: isActive ? 'bold' : '500',
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '4px',
                            border: isActive ? '1px solid var(--accent-yellow)' : '1px solid rgba(255,255,255,0.35)',
                            background: isActive ? 'var(--accent-yellow)' : 'transparent',
                            color: 'black',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            flexShrink: 0
                          }}
                        >
                          {isActive ? '✓' : ''}
                        </span>
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-muted)',
                fontSize: '0.82rem'
              }}
            >
              Instrucciones especiales (Ej. Sin cebolla)...
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <AlertModal
        isOpen={recToDelete !== null}
        title="Eliminar Recomendación"
        message={`¿Estás seguro que deseas eliminar "${recToDelete !== null ? currentList[recToDelete] : ''}" de la categoría ${activeCategory}?`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onClose={() => setRecToDelete(null)}
      />
    </div>
  );
}

export default AdminRecommendationsTab;

