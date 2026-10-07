import React, { useState } from 'react';
import { Pencil, Trash2, Plus, MapPin, Search, X } from 'lucide-react';
import { saveNeighborhood, deleteNeighborhood } from '../../services/db';
import { toast } from 'sonner';
import AdminNeighborhoodModal from './AdminNeighborhoodModal';
import { normalizeText } from '../../utils/stringUtils';

function AdminNeighborhoodsTab({ neighborhoods, setNeighborhoods }) {
  const [editingNeighborhood, setEditingNeighborhood] = useState(null);
  const [neighborhoodData, setNeighborhoodData] = useState({ 
    name: '', 
    price: '',
    isRestricted: false,
    meetingPointName: '',
    meetingPointAddress: '',
    customAlertMessage: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenCreateModal = () => {
    setEditingNeighborhood(null);
    setNeighborhoodData({ 
      name: '', 
      price: '',
      isRestricted: false,
      meetingPointName: '',
      meetingPointAddress: '',
      customAlertMessage: ''
    });
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
    const { name, value, type, checked } = e.target;
    setNeighborhoodData({ ...neighborhoodData, [name]: type === 'checkbox' ? checked : value });
  };

  const filteredNeighborhoods = neighborhoods.filter(nb => 
    normalizeText(nb.name).includes(normalizeText(searchTerm))
  );

  return (
    <div className="admin-tab-content">
      {/* Barra de cabecera con botón de acción destacado */}
      <div className="admin-tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', background: 'linear-gradient(90deg, rgba(229, 169, 0, 0.05) 0%, transparent 100%)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--accent-yellow)', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ background: 'rgba(229, 169, 0, 0.1)', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-yellow)', boxShadow: '0 0 20px rgba(229, 169, 0, 0.15)' }}>
            <MapPin size={32} />
          </div>
          <div>
            <h2 className="admin-card-title" style={{ fontSize: '1.8rem', margin: '0 0 0.2rem 0', textShadow: '0 2px 10px rgba(229, 169, 0, 0.2)' }}>Tarifas de Domicilios por Barrio</h2>
            <p className="admin-card-subtitle" style={{ margin: 0, fontSize: '0.95rem', opacity: 0.8 }}>
              {neighborhoods.length} {neighborhoods.length === 1 ? 'barrio configurado' : 'barrios configurados'}
            </p>
          </div>
        </div>

        <button 
          onClick={handleOpenCreateModal} 
          className="cta-button admin-create-btn"
        >
          <Plus size={20} />
          <span>Añadir Nuevo Barrio</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="search-input-wrapper admin-search glass" style={{ marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          className="search-input" 
          placeholder="Buscar barrio por nombre..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="search-clear-btn" onClick={() => setSearchTerm('')}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Grid de Barrios */}
      <div className="admin-neighborhoods-grid">
        {filteredNeighborhoods.map(nb => (
          <div key={nb.id} className="admin-neighborhood-card glass" style={{ border: nb.isRestricted ? '1px solid var(--accent-pink)' : '' }}>
            <div className="admin-nb-info">
              <div className="admin-nb-icon-box" style={{ background: nb.isRestricted ? 'rgba(255, 60, 60, 0.1)' : '' }}>
                <MapPin size={20} style={{ color: nb.isRestricted ? 'var(--accent-pink)' : '' }} />
              </div>
              <div>
                <h4 className="admin-nb-title">{nb.name} {nb.isRestricted && <span style={{ fontSize: '0.7rem', background: 'var(--accent-pink)', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', verticalAlign: 'middle' }}>Restringido</span>}</h4>
                <span className="admin-nb-price">
                  Envío: ${nb.price.toLocaleString('es-CO')} COP
                </span>
                {nb.isRestricted && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '6px' }}>
                    <p style={{ margin: '0 0 0.2rem 0' }}><strong>📍 Punto:</strong> {nb.meetingPointName} ({nb.meetingPointAddress})</p>
                    <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.8rem' }}>"{nb.customAlertMessage || 'Mensaje por defecto...'}"</p>
                  </div>
                )}
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

        {filteredNeighborhoods.length === 0 && (
          <div className="admin-empty-state glass">
            <p>{searchTerm ? 'No se encontraron barrios con esa búsqueda.' : 'No tienes barrios configurados aún.'}</p>
            {!searchTerm && (
              <button onClick={handleOpenCreateModal} className="cta-button" style={{ marginTop: '1rem' }}>
                <Plus size={18} /> Añadir el primero
              </button>
            )}
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
