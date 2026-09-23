import React, { useState } from 'react';
import { Pencil, Trash2, Plus, MapPin } from 'lucide-react';
import { saveNeighborhood, deleteNeighborhood } from '../../services/db';
import { toast } from 'sonner';
import AdminNeighborhoodModal from './AdminNeighborhoodModal';

function AdminNeighborhoodsTab({ neighborhoods, setNeighborhoods }) {
  const [editingNeighborhood, setEditingNeighborhood] = useState(null);
  const [neighborhoodData, setNeighborhoodData] = useState({ name: '', price: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenCreateModal = () => {
    setEditingNeighborhood(null);
    setNeighborhoodData({ name: '', price: '' });
    setIsModalOpen(true);
  };

  const handleEditNb = (nb) => {
    setEditingNeighborhood(nb.id);
    setNeighborhoodData({ ...nb });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNeighborhood(null);
  };

  const handleDeleteNb = (id) => {
    toast('¿Eliminar barrio?', {
      description: 'Esta acción no se puede deshacer.',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          setNeighborhoods(await deleteNeighborhood(id));
          toast.success('Barrio eliminado exitosamente');
        }
      }
    });
  };

  const handleSubmitNb = async (e) => {
    e.preventDefault();
    let newNb;
    if (editingNeighborhood) {
      newNb = { ...neighborhoodData, id: editingNeighborhood, price: Number(neighborhoodData.price) };
    } else {
      newNb = { ...neighborhoodData, price: Number(neighborhoodData.price) };
    }
    
    setNeighborhoods(await saveNeighborhood(newNb));
    toast.success(editingNeighborhood ? 'Barrio actualizado' : 'Barrio añadido');
    handleCloseModal();
  };

  const handleChangeNb = (e) => {
    setNeighborhoodData({ ...neighborhoodData, [e.target.name]: e.target.value });
  };

  return (
    <div className="admin-tab-content">
      {/* Barra de cabecera con botón de acción destacado */}
      <div className="admin-action-bar glass">
        <div className="admin-action-bar-info">
          <h3>Tarifas de Domicilios por Barrio</h3>
          <span className="admin-items-count">
            {neighborhoods.length} {neighborhoods.length === 1 ? 'barrio configurado' : 'barrios configurados'}
          </span>
        </div>

        <button 
          onClick={handleOpenCreateModal} 
          className="cta-button admin-create-btn"
        >
          <Plus size={20} />
          <span>Añadir Nuevo Barrio</span>
        </button>
      </div>

      {/* Grid de Barrios */}
      <div className="admin-neighborhoods-grid">
        {neighborhoods.map(nb => (
          <div key={nb.id} className="admin-neighborhood-card glass">
            <div className="admin-nb-info">
              <div className="admin-nb-icon-box">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="admin-nb-title">{nb.name}</h4>
                <span className="admin-nb-price">
                  Envío: ${nb.price.toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>

            <div className="admin-card-actions">
              <button 
                onClick={() => handleEditNb(nb)} 
                className="admin-icon-btn cyan" 
                title="Editar tarifa"
              >
                <Pencil size={18} />
              </button>
              <button 
                onClick={() => handleDeleteNb(nb.id)} 
                className="admin-icon-btn pink" 
                title="Eliminar barrio"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {neighborhoods.length === 0 && (
          <div className="admin-empty-state glass">
            <p>No tienes barrios configurados aún.</p>
            <button onClick={handleOpenCreateModal} className="cta-button" style={{ marginTop: '1rem' }}>
              <Plus size={18} /> Añadir el primero
            </button>
          </div>
        )}
      </div>

      {/* Modal Pantalla Auxiliar */}
      <AdminNeighborhoodModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingNeighborhood={editingNeighborhood}
        neighborhoodData={neighborhoodData}
        handleChangeNb={handleChangeNb}
        handleSubmitNb={handleSubmitNb}
      />
    </div>
  );
}

export default AdminNeighborhoodsTab;
