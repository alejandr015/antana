import React, { useState } from 'react';
import { Pencil, Trash2, Plus, Search, X, Utensils } from 'lucide-react';
import { saveMenuItem, deleteMenuItem, uploadImage, saveSettings, updateCategoryInAllItems } from '../../services/db';
import { resizeAndCropImage } from '../../utils/imageOptimizer';
import { toast } from 'sonner';
import AlertModal from '../AlertModal';
import AdminProductModal from './AdminProductModal';
import ImageCropperModal from './ImageCropperModal';
import { normalizeText } from '../../utils/stringUtils';

function AdminMenuTab({ items, setItems, categories, activeMode = 'menu_main', settings, setSettings }) {
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

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({ name: '', category: 'Hamburguesas', description: '', price: '', imageUrl: '' });
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
    toast.success('Plato eliminado exitosamente');
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
    toast.success(editingItem ? 'Plato actualizado' : 'Plato creado exitosamente');
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

  const displayCategories = categories.filter(cat => {
    if (activeMode === 'menu_main') return !cat.startsWith('Extras - ');
    return cat.startsWith('Extras - ');
  });

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
            <h2 className="admin-card-title" style={{ fontSize: '1.8rem', margin: '0 0 0.2rem 0', textShadow: '0 2px 10px rgba(229, 169, 0, 0.2)' }}>Gestión de Menú</h2>
            <p className="admin-card-subtitle" style={{ margin: 0, fontSize: '0.95rem', opacity: 0.8 }}>
              {filteredItems.length} {filteredItems.length === 1 ? 'producto' : 'productos'} en vista
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setIsCategoryModalOpen(true)} 
            className="cta-button admin-create-btn"
            style={{ background: 'transparent', border: '1px solid var(--accent-yellow)', color: 'var(--accent-yellow)' }}
          >
            <Pencil size={20} />
            <span>Gestionar Categorías</span>
          </button>
          <button 
            onClick={handleOpenCreateModal} 
            className="cta-button admin-create-btn"
          >
            <Plus size={20} />
            <span>Añadir Nuevo Plato</span>
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

      {/* Grilla moderna de productos */}
      <div className="admin-products-grid">
        {filteredItems.map(item => (
          <div key={item.id} className="admin-product-card glass">
            <div className="admin-card-media">
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                loading="lazy" 
                decoding="async" 
                className="admin-card-img" 
              />
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

      {/* Modal Pantalla Auxiliar */}
      <AdminProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingItem={editingItem}
        formData={formData}
        handleChange={handleChange}
        handleImageChange={handleImageChange}
        handleSubmit={handleSubmit}
        categories={categories}
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
    </div>
  );
}

export default AdminMenuTab;
