import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Search, X, Utensils, Sparkles, Check } from 'lucide-react';
import { saveMenuItem, deleteMenuItem, uploadImage, saveSettings, updateCategoryInAllItems } from '../../services/db';
import { resizeAndCropImage } from '../../utils/imageOptimizer';
import { toast } from 'sonner';
import AlertModal from '../AlertModal';
import AdminProductModal from './AdminProductModal';
import ImageCropperModal from './ImageCropperModal';
import { normalizeText } from '../../utils/stringUtils';
import { getRecommendationTitleForCategory, SAUCE_PREFERENCE_OPTIONS } from '../../utils/orderUtils';

function AdminMenuTab({ items, setItems, categories, activeMode = 'menu_main', settings, setSettings, onOpenRecommendations }) {
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'Hamburguesas', description: '', price: '', imageUrl: '' });
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemToBlock, setItemToBlock] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal Gestionar Categorías states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCategoryCreateMode, setIsCategoryCreateMode] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Modal Gestionar Recomendaciones (Ej. Salsas aparte, Sin salsas, etc.)
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [selectedRecCategory, setSelectedRecCategory] = useState('Hamburguesas');
  const [newRecText, setNewRecText] = useState('');
  const [editingRecIndex, setEditingRecIndex] = useState(null);
  const [editingRecText, setEditingRecText] = useState('');

  useEffect(() => {
    setActiveCategory('Todos');
  }, [activeMode]);

  const mainCategories = categories.filter(cat => !cat.startsWith('Extras - '));

  const getCategoryRecommendations = (cat) => {
    const map = settings?.productRecommendations || {};
    if (Array.isArray(map[cat])) return map[cat];
    return cat !== 'Bebidas' ? [...SAUCE_PREFERENCE_OPTIONS] : [];
  };

  const handleSaveRecommendationsForCategory = async (cat, updatedList, successMsg) => {
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
      toast.success(successMsg);
    } catch (e) {
      toast.error('Error al guardar recomendaciones');
    }
  };

  const handleAddRecommendation = async () => {
    const clean = newRecText.trim();
    if (!clean) {
      toast.error('Escribe una recomendación válida');
      return;
    }
    const currentList = getCategoryRecommendations(selectedRecCategory);
    if (currentList.some(r => r.toLowerCase() === clean.toLowerCase())) {
      toast.error('Esa recomendación ya existe en esta categoría');
      return;
    }
    await handleSaveRecommendationsForCategory(
      selectedRecCategory,
      [...currentList, clean],
      'Recomendación agregada'
    );
    setNewRecText('');
  };

  const handleSaveEditRecommendation = async (index) => {
    const clean = editingRecText.trim();
    if (!clean) {
      toast.error('El texto no puede estar vacío');
      return;
    }
    const currentList = getCategoryRecommendations(selectedRecCategory);
    if (currentList.some((r, idx) => idx !== index && r.toLowerCase() === clean.toLowerCase())) {
      toast.error('Ya existe otra recomendación con ese nombre');
      return;
    }
    const updatedList = currentList.map((item, idx) => (idx === index ? clean : item));
    await handleSaveRecommendationsForCategory(
      selectedRecCategory,
      updatedList,
      'Recomendación actualizada'
    );
    setEditingRecIndex(null);
    setEditingRecText('');
  };

  const handleDeleteRecommendation = async (index) => {
    const currentList = getCategoryRecommendations(selectedRecCategory);
    const updatedList = currentList.filter((_, idx) => idx !== index);
    await handleSaveRecommendationsForCategory(
      selectedRecCategory,
      updatedList,
      'Recomendación eliminada'
    );
    if (editingRecIndex === index) {
      setEditingRecIndex(null);
      setEditingRecText('');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }
    if (categories.includes(newCategoryName.trim())) {
      toast.error('La categoría ya existe');
      return;
    }
    try {
      const updatedSettings = {
        ...settings,
        customCategories: [...(settings.customCategories || []), newCategoryName.trim()]
      };
      await saveSettings(updatedSettings);
      setSettings(updatedSettings);
      toast.success('Categoría creada exitosamente');
      setNewCategoryName('');
      setIsCategoryCreateMode(false);
    } catch (e) {
      toast.error('Error al crear categoría');
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      const updatedCustomCats = (settings.customCategories || []).filter(cat => cat !== categoryToDelete);
      const updatedSettings = {
        ...settings,
        customCategories: updatedCustomCats
      };
      await saveSettings(updatedSettings);
      setSettings(updatedSettings);
      toast.success('Categoría eliminada');
      if (activeCategory === categoryToDelete) {
        setActiveCategory('Todos');
      }
      setCategoryToDelete(null);
    } catch (e) {
      toast.error('Error al eliminar categoría');
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategoryName.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }
    if (categories.includes(editingCategoryName.trim()) && editingCategoryName.trim() !== categoryToEdit) {
      toast.error('Ya existe otra categoría con ese nombre');
      return;
    }
    try {
      toast.info('Actualizando productos...', { id: 'updateCat' });
      const updatedCustomCats = (settings.customCategories || []).map(cat => 
        cat === categoryToEdit ? editingCategoryName.trim() : cat
      );
      const updatedSettings = {
        ...settings,
        customCategories: updatedCustomCats
      };
      await saveSettings(updatedSettings);
      setSettings(updatedSettings);
      
      const newItems = await updateCategoryInAllItems(categoryToEdit, editingCategoryName.trim());
      setItems(newItems);
      
      toast.success('Categoría actualizada exitosamente', { id: 'updateCat' });
      if (activeCategory === categoryToEdit) {
        setActiveCategory(editingCategoryName.trim());
      }
      setCategoryToEdit(null);
      setEditingCategoryName('');
    } catch (e) {
      toast.error('Error al editar categoría', { id: 'updateCat' });
    }
  };

  const displayCategories = categories.filter(cat => {
    if (activeMode === 'menu_main') return !cat.startsWith('Extras - ');
    return cat.startsWith('Extras - ');
  });

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    const defaultCategory = activeCategory !== 'Todos'
      ? activeCategory
      : (displayCategories[0] || (activeMode === 'menu_extras' ? 'Extras - Ingredientes Hamburguesas' : 'Hamburguesas'));
    setFormData({ name: '', category: defaultCategory, description: '', price: '', imageUrl: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item.id);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const newItems = await deleteMenuItem(itemToDelete.id);
    setItems(newItems);
    toast.success(activeMode === 'menu_extras' ? 'Adicional eliminado exitosamente' : 'Plato eliminado exitosamente');
    setItemToDelete(null);
  };

  const handleToggleStock = async (item) => {
    if (!item.isOutofStock) {
      setItemToBlock(item);
    } else {
      const updatedItem = { ...item, isOutofStock: false };
      setItems(await saveMenuItem(updatedItem));
      toast.success('Producto marcado como DISPONIBLE');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newItem = { ...formData, price: Number(formData.price) };
    if (editingItem) newItem.id = editingItem;
    
    setItems(await saveMenuItem(newItem));
    const isExtra = Boolean(formData.category && formData.category.startsWith('Extras - '));
    toast.success(
      editingItem
        ? (isExtra ? 'Adicional actualizado' : 'Plato actualizado')
        : (isExtra ? 'Adicional creado exitosamente' : 'Plato creado exitosamente')
    );
    handleCloseModal();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [pendingImageFile, setPendingImageFile] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Generar URL temporal para el recortador
    const imageUrl = URL.createObjectURL(file);
    setCropImageSrc(imageUrl);
    setPendingImageFile(file);
  };

  const handleCropComplete = async (croppedAreaPixels) => {
    if (!pendingImageFile) return;

    try {
      setIsUploading(true);
      setCropImageSrc(null); // Cerrar el modal de recorte inmediatamente
      toast.info('Recortando y optimizando imagen...');
      
      const optimizedBlob = await resizeAndCropImage(pendingImageFile, 500, croppedAreaPixels);
      const fileName = pendingImageFile.name || 'foto.webp';
      
      const publicUrl = await uploadImage(optimizedBlob, fileName);
      setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
      toast.success('¡Imagen procesada y lista!');
    } catch (error) {
      toast.error('Error al procesar imagen: ' + error.message);
    } finally {
      setIsUploading(false);
      setPendingImageFile(null);
    }
  };

  const handleCropCancel = () => {
    setCropImageSrc(null);
    setPendingImageFile(null);
  };

  const filteredItems = items.filter(item => {
    const isCategoryMatch = activeCategory === 'Todos' 
      ? displayCategories.includes(item.category) 
      : item.category === activeCategory;
    const isSearchMatch = normalizeText(item.name).includes(normalizeText(searchTerm));
    return isCategoryMatch && isSearchMatch;
  });

  return (
    <div className="admin-tab-content">
      {/* Barra de cabecera con botón de acción destacado */}
      <div className="admin-tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', background: 'linear-gradient(90deg, rgba(229, 169, 0, 0.05) 0%, transparent 100%)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--accent-yellow)', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ background: 'rgba(229, 169, 0, 0.1)', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-yellow)', boxShadow: '0 0 20px rgba(229, 169, 0, 0.15)' }}>
            <Utensils size={32} />
          </div>
          <div>
            <h2 className="admin-card-title" style={{ fontSize: '1.8rem', margin: '0 0 0.2rem 0', textShadow: '0 2px 10px rgba(229, 169, 0, 0.2)' }}>
              {activeMode === 'menu_extras' ? 'Gestión de Adicionales' : 'Gestión de Menú'}
            </h2>
            <p className="admin-card-subtitle" style={{ margin: 0, fontSize: '0.95rem', opacity: 0.8 }}>
              {filteredItems.length} {activeMode === 'menu_extras' ? (filteredItems.length === 1 ? 'adicional' : 'adicionales') : (filteredItems.length === 1 ? 'producto' : 'productos')} en vista
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => {
              if (onOpenRecommendations) {
                onOpenRecommendations();
                return;
              }
              setSelectedRecCategory(mainCategories[0] || 'Hamburguesas');
              setEditingRecIndex(null);
              setNewRecText('');
              setIsRecModalOpen(true);
            }} 
            className="cta-button admin-create-btn"
            style={{ background: 'rgba(229, 169, 0, 0.12)', border: '1px solid var(--accent-yellow)', color: 'var(--accent-yellow)' }}
          >
            <Sparkles size={18} />
            <span>Gestionar Recomendaciones</span>
          </button>
          <button 
            onClick={() => setIsCategoryModalOpen(true)} 
            className="cta-button admin-create-btn"
            style={{ background: 'transparent', border: '1px solid var(--accent-yellow)', color: 'var(--accent-yellow)' }}
          >
            <Pencil size={18} />
            <span>Gestionar Categorías</span>
          </button>
          <button 
            onClick={handleOpenCreateModal} 
            className="cta-button admin-create-btn"
          >
            <Plus size={20} />
            <span>{activeMode === 'menu_extras' ? 'Añadir Nuevo Adicional' : 'Añadir Nuevo Plato'}</span>
          </button>
        </div>
      </div>

      {/* Filtro de Categorías y Buscador */}
      <div className="admin-category-filter-wrapper glass" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', alignItems: 'stretch' }}>
        <div className="search-input-wrapper admin-search">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Buscar producto por nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear-btn" onClick={() => setSearchTerm('')}>
              <X size={16} />
            </button>
          )}
        </div>
        <div className="admin-category-filter">
          {['Todos', ...displayCategories].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`admin-filter-btn ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grilla de productos (Compacta sin imagen para Salsas/Adicionales, completa con imagen para Platos Principales) */}
      {activeMode === 'menu_extras' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '0.85rem'
          }}
        >
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="glass"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
                padding: '0.95rem 1.15rem',
                borderRadius: '14px',
                border: item.isOutofStock
                  ? '1px solid rgba(255, 45, 85, 0.35)'
                  : '1px solid var(--glass-border)',
                background: item.isOutofStock
                  ? 'rgba(255, 45, 85, 0.04)'
                  : 'rgba(255, 255, 255, 0.03)',
                opacity: item.isOutofStock ? 0.75 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {/* Fila superior: Nombre, Categoría corta y Precio */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--text-secondary)',
                      fontWeight: '600'
                    }}
                  >
                    {item.category.replace('Extras - ', '')}
                  </span>
                  <h4 style={{ margin: 0, fontSize: '1.02rem', fontWeight: '700', color: '#fff' }}>
                    {item.name}
                  </h4>
                </div>

                <span
                  style={{
                    background: 'rgba(229, 169, 0, 0.14)',
                    color: 'var(--accent-yellow)',
                    border: '1px solid rgba(229, 169, 0, 0.3)',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '20px',
                    fontWeight: '800',
                    fontSize: '0.88rem',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {item.price === 0 ? 'Gratis ($0)' : `+$${item.price.toLocaleString('es-CO')}`}
                </span>
              </div>

              {/* Fila inferior: Estado Disponible/Agotado + Editar / Eliminar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.6rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div className="admin-stock-toggle-container" style={{ gap: '0.5rem' }}>
                  <button
                    onClick={() => handleToggleStock(item)}
                    className={`admin-stock-btn ${item.isOutofStock ? 'out' : 'in'}`}
                    title={item.isOutofStock ? 'Desbloquear (Disponible)' : 'Bloquear (Agotado)'}
                  >
                    <div className={`admin-stock-indicator ${item.isOutofStock ? 'out' : 'in'}`} />
                  </button>
                  <span className="admin-stock-label" style={{ fontSize: '0.82rem' }}>
                    {item.isOutofStock ? 'Agotado' : 'Disponible'}
                  </span>
                </div>

                <div className="admin-card-actions" style={{ gap: '0.45rem' }}>
                  <button
                    onClick={() => handleEdit(item)}
                    className="admin-icon-btn cyan"
                    title="Editar adicional / salsa"
                    style={{ width: '32px', height: '32px' }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="admin-icon-btn pink"
                    title="Eliminar adicional / salsa"
                    style={{ width: '32px', height: '32px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="admin-empty-state glass" style={{ gridColumn: '1 / -1' }}>
              <p>No se encontraron salsas ni adicionales en esta categoría.</p>
              <button onClick={handleOpenCreateModal} className="cta-button" style={{ marginTop: '1rem' }}>
                <Plus size={18} /> Crear el primero
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="admin-products-grid">
          {filteredItems.map(item => (
            <div key={item.id} className="admin-product-card glass">
              <div className="admin-card-media">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    loading="lazy" 
                    decoding="async" 
                    className="admin-card-img" 
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'radial-gradient(circle, rgba(229,169,0,0.14) 0%, rgba(15,15,20,0.95) 100%)',
                    color: 'var(--accent-yellow)'
                  }}>
                    <Utensils size={42} style={{ opacity: 0.7 }} />
                  </div>
                )}
                <span className="admin-badge-category">{item.category}</span>
                {item.isOutofStock && (
                  <span className="admin-badge-outofstock">AGOTADO</span>
                )}
              </div>

              <div className="admin-card-content">
                <div className="admin-card-title-row">
                  <h4>{item.name}</h4>
                  <span className="admin-price-highlight">${item.price.toLocaleString('es-CO')}</span>
                </div>
                <p className="admin-card-desc">{item.description}</p>
              </div>

              <div className="admin-card-footer">
                {/* Toggle de Stock */}
                <div className="admin-stock-toggle-container">
                  <button 
                    onClick={() => handleToggleStock(item)} 
                    className={`admin-stock-btn ${item.isOutofStock ? 'out' : 'in'}`}
                    title={item.isOutofStock ? 'Desbloquear (Disponible)' : 'Bloquear (Agotado)'}
                  >
                    <div className={`admin-stock-indicator ${item.isOutofStock ? 'out' : 'in'}`} />
                  </button>
                  <span className="admin-stock-label">
                    {item.isOutofStock ? 'Agotado' : 'Disponible'}
                  </span>
                </div>

                {/* Botones de Editar y Eliminar */}
                <div className="admin-card-actions">
                  <button 
                    onClick={() => handleEdit(item)} 
                    className="admin-icon-btn cyan" 
                    title="Editar plato"
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(item)} 
                    className="admin-icon-btn pink" 
                    title="Eliminar plato"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="admin-empty-state glass">
              <p>No se encontraron productos en esta categoría.</p>
              <button onClick={handleOpenCreateModal} className="cta-button" style={{ marginTop: '1rem' }}>
                <Plus size={18} /> Crear el primero
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Pantalla Auxiliar */}
      <AdminProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingItem={editingItem}
        formData={formData}
        handleChange={handleChange}
        handleImageChange={handleImageChange}
        handleSubmit={handleSubmit}
        categories={displayCategories.length > 0 ? displayCategories : categories}
        isUploading={isUploading}
      />

      {/* Modal de confirmación de bloqueo */}
      <AlertModal 
        isOpen={!!itemToBlock} 
        title="¿Bloquear producto?" 
        message={`Estás a punto de marcar "${itemToBlock?.name}" como agotado. Los clientes no podrán agregarlo al carrito.`} 
        onClose={() => setItemToBlock(null)} 
        onConfirm={async () => {
          const updatedItem = { ...itemToBlock, isOutofStock: true };
          setItems(await saveMenuItem(updatedItem));
          toast.success('Producto marcado como AGOTADO');
          setItemToBlock(null);
        }}
        confirmText="Bloquear"
        cancelText="Cancelar"
      />

      {/* Modal de confirmación de eliminación */}
      <AlertModal 
        isOpen={!!itemToDelete}
        title="Eliminar Plato"
        message={`¿Estás seguro que deseas eliminar "${itemToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onClose={() => setItemToDelete(null)}
      />

      {/* Modal de Recorte de Imagen */}
      {cropImageSrc && (
        <ImageCropperModal 
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {/* Modal de Confirmación para borrar categoría */}
      <AlertModal 
        isOpen={!!categoryToDelete}
        title="Eliminar Categoría"
        message={`¿Estás seguro que deseas eliminar "${categoryToDelete}"? Si eliminas esta categoría, los productos dentro de ella podrían dejar de mostrarse correctamente.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteCategory}
        onClose={() => setCategoryToDelete(null)}
      />

      {/* Modal Gestionar Categorías Multipantalla */}
      {isCategoryModalOpen && (
        <div className="product-modal-backdrop" onClick={() => setIsCategoryModalOpen(false)}>
          <div className="product-modal-card info-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="product-modal-close-btn" onClick={() => setIsCategoryModalOpen(false)}>
              <X size={20} />
            </button>
            
            {categoryToEdit ? (
              // Pantalla de EDICIÓN
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--accent-yellow)' }}>Editar Categoría</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Atención: Modificar el nombre actualizará automáticamente todos los platos que estén dentro de esta categoría.
                </p>
                <input 
                  type="text" 
                  className="admin-input" 
                  placeholder="Nuevo nombre de la categoría" 
                  value={editingCategoryName}
                  onChange={e => setEditingCategoryName(e.target.value)}
                  style={{ width: '100%', marginBottom: '1.5rem' }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setCategoryToEdit(null)} className="admin-cancel-btn" style={{ flex: 1 }}>
                    Volver
                  </button>
                  <button onClick={handleEditCategory} className="cta-button" style={{ flex: 1 }} disabled={!editingCategoryName.trim()}>
                    Guardar Cambios
                  </button>
                </div>
              </div>
            ) : isCategoryCreateMode ? (
              // Pantalla de CREACIÓN
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--accent-yellow)' }}>Añadir Nueva Categoría</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Escribe el nombre de la nueva categoría. Aparecerá automáticamente en el menú.
                </p>
                <input 
                  type="text" 
                  className="admin-input" 
                  placeholder="Ej. Combos Especiales" 
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  style={{ width: '100%', marginBottom: '1.5rem' }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setIsCategoryCreateMode(false)} className="admin-cancel-btn" style={{ flex: 1 }}>
                    Volver
                  </button>
                  <button onClick={handleCreateCategory} className="cta-button" style={{ flex: 1 }} disabled={!newCategoryName.trim()}>
                    Guardar Categoría
                  </button>
                </div>
              </div>
            ) : (
              // Pantalla LISTADO
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: 'var(--accent-yellow)' }}>Gestionar Categorías</h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Administra las categorías de tu menú. Todas las categorías son modificables.
                </p>

                <button 
                  onClick={() => {
                    setNewCategoryName('');
                    setIsCategoryCreateMode(true);
                  }}
                  className="cta-button" 
                  style={{ width: '100%', marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Plus size={20} /> Añadir Categoría
                </button>

                <div style={{ marginBottom: '1rem' }}>
                  {(!settings?.customCategories || settings.customCategories.length === 0) ? (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Cargando categorías...</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {settings.customCategories.map(cat => (
                        <li key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                          <span style={{ fontWeight: '500' }}>{cat}</span>
                          <div style={{ display: 'flex', gap: '0.8rem' }}>
                            <button 
                              onClick={() => {
                                setCategoryToEdit(cat);
                                setEditingCategoryName(cat);
                              }}
                              style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              title="Editar categoría"
                            >
                              <Pencil size={18} />
                            </button>
                            <button 
                              onClick={() => setCategoryToDelete(cat)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--accent-pink)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              title="Eliminar categoría"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Gestionar Recomendaciones por Categoría (Ej. Salsas aparte, Sin salsas, etc.) */}
      {isRecModalOpen && (
        <div className="product-modal-backdrop" onClick={() => setIsRecModalOpen(false)}>
          <div
            className="product-modal-card info-modal"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '540px', width: '95%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <button className="product-modal-close-btn" onClick={() => setIsRecModalOpen(false)}>
              <X size={20} />
            </button>

            <h3 style={{ margin: '0 0 0.4rem 0', color: 'var(--accent-yellow)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} /> Gestionar Recomendaciones
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
              Crea, edita o elimina las opciones rápidas (como <strong>Salsas aparte</strong> o <strong>Sin salsas</strong>) que aparecen al personalizar cada tipo de producto. A medida que agregues más, se irá abriendo espacio automáticamente en el pedido.
            </p>

            {/* Selector de Categoría */}
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: '600' }}>
                Selecciona la categoría del menú:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {mainCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedRecCategory(cat);
                      setEditingRecIndex(null);
                      setEditingRecText('');
                    }}
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: '20px',
                      border: selectedRecCategory === cat ? '1px solid var(--accent-yellow)' : '1px solid rgba(255,255,255,0.15)',
                      background: selectedRecCategory === cat ? 'var(--accent-yellow)' : 'rgba(255,255,255,0.05)',
                      color: selectedRecCategory === cat ? '#000' : '#fff',
                      fontWeight: selectedRecCategory === cat ? 'bold' : '500',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Vista previa del título dinámico */}
            <div style={{
              background: 'rgba(229, 169, 0, 0.08)',
              border: '1px solid rgba(229, 169, 0, 0.25)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              marginBottom: '1.2rem'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                Título que verá el cliente en esta categoría:
              </span>
              <strong style={{ color: 'var(--accent-yellow)', fontSize: '0.92rem' }}>
                {getRecommendationTitleForCategory(selectedRecCategory)}
              </strong>
            </div>

            {/* Formulario para agregar nueva recomendación */}
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.4rem' }}>
              <input
                type="text"
                className="admin-input"
                placeholder="Nueva recomendación (Ej. Salsas aparte, Sin cebolla...)"
                value={newRecText}
                onChange={e => setNewRecText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRecommendation();
                  }
                }}
                style={{ flex: 1, margin: 0 }}
              />
              <button
                type="button"
                onClick={handleAddRecommendation}
                className="cta-button"
                style={{ padding: '0 1.1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}
              >
                <Plus size={18} /> Añadir
              </button>
            </div>

            {/* Lista de recomendaciones actuales */}
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.6rem' }}>
                Opciones activas en <strong>{selectedRecCategory}</strong> ({getCategoryRecommendations(selectedRecCategory).length}):
              </span>

              {getCategoryRecommendations(selectedRecCategory).length === 0 ? (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  No hay recomendaciones configuradas para esta categoría.
                </p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {getCategoryRecommendations(selectedRecCategory).map((rec, idx) => (
                    <li
                      key={`${rec}-${idx}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.6rem',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '0.65rem 0.9rem',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)'
                      }}
                    >
                      {editingRecIndex === idx ? (
                        <>
                          <input
                            type="text"
                            className="admin-input"
                            value={editingRecText}
                            onChange={e => setEditingRecText(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveEditRecommendation(idx);
                              }
                            }}
                            style={{ flex: 1, margin: 0, padding: '0.4rem 0.7rem' }}
                            autoFocus
                          />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={() => handleSaveEditRecommendation(idx)}
                              style={{ background: 'var(--accent-yellow)', border: 'none', color: '#000', borderRadius: '6px', padding: '0.35rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              title="Guardar"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRecIndex(null);
                                setEditingRecText('');
                              }}
                              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.35rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              title="Cancelar"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span style={{ fontWeight: '500', fontSize: '0.92rem' }}>{rec}</span>
                          <div style={{ display: 'flex', gap: '0.7rem' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRecIndex(idx);
                                setEditingRecText(rec);
                              }}
                              style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              title="Editar recomendación"
                            >
                              <Pencil size={17} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRecommendation(idx)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--accent-pink)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              title="Eliminar recomendación"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMenuTab;
