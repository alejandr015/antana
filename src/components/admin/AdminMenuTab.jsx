import React, { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { saveMenuItem, deleteMenuItem, uploadImage } from '../../services/db';
import { resizeAndCropImage } from '../../utils/imageOptimizer';
import { toast } from 'sonner';
import AlertModal from '../AlertModal';
import AdminProductModal from './AdminProductModal';
import ImageCropperModal from './ImageCropperModal';

function AdminMenuTab({ items, setItems, categories }) {
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'Hamburguesas', description: '', price: '', imageUrl: '' });
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [itemToBlock, setItemToBlock] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleDelete = (id) => {
    toast('¿Eliminar plato?', {
      description: 'Esta acción no se puede deshacer.',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          const newItems = await deleteMenuItem(id);
          setItems(newItems);
          toast.success('Plato eliminado exitosamente');
        }
      }
    });
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

  const filteredItems = items.filter(
    item => activeCategory === 'Todos' || item.category === activeCategory
  );

  return (
    <div className="admin-tab-content">
      {/* Barra de cabecera con botón de acción destacado */}
      <div className="admin-action-bar glass">
        <div className="admin-action-bar-info">
          <h3>Gestión de Menú</h3>
          <span className="admin-items-count">
            {filteredItems.length} {filteredItems.length === 1 ? 'producto' : 'productos'} en vista
          </span>
        </div>

        <button 
          onClick={handleOpenCreateModal} 
          className="cta-button admin-create-btn"
        >
          <Plus size={20} />
          <span>Añadir Nuevo Plato</span>
        </button>
      </div>

      {/* Filtro de Categorías */}
      <div className="admin-category-filter-wrapper glass">
        <div className="admin-category-filter">
          {['Todos', ...categories].map(cat => (
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
                  onClick={() => handleDelete(item.id)} 
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

      {/* Modal de Recorte de Imagen */}
      {cropImageSrc && (
        <ImageCropperModal 
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}

export default AdminMenuTab;
