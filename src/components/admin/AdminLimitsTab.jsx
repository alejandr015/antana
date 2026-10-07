import React, { useState } from 'react';
import { ShieldAlert, Save, Minus, Plus } from 'lucide-react';
import { saveSettings } from '../../services/db';
import { toast } from 'sonner';
import AlertModal from '../AlertModal';
import { motion } from 'framer-motion';

function AdminLimitsTab({ settings, setSettings }) {
  const [localLimits, setLocalLimits] = useState(settings.categoryLimits || {});
  const [isSaving, setIsSaving] = useState(false);
  const [categoryToBlock, setCategoryToBlock] = useState(null);

  const handleToggleClick = (category) => {
    const isCurrentlyActive = localLimits[category].active;
    if (isCurrentlyActive) {
      // Quiere desactivar el límite -> Mostrar confirmación
      setCategoryToBlock(category);
    } else {
      // Quiere activar el límite -> Activar directamente
      setLocalLimits(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          active: true
        }
      }));
    }
  };

  const confirmBlock = () => {
    if (categoryToBlock) {
      setLocalLimits(prev => ({
        ...prev,
        [categoryToBlock]: {
          ...prev[categoryToBlock],
          active: false
        }
      }));
      setCategoryToBlock(null);
    }
  };

  const handleLimitChange = (category, value) => {
    const num = parseInt(value) || 0;
    setLocalLimits(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        limit: Math.max(1, num) // minimum 1
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const newSettings = { ...settings, categoryLimits: localLimits };
      await saveSettings(newSettings);
      setSettings(newSettings);
      toast.success('Límites de pedido guardados correctamente');
    } catch (e) {
      toast.error('Error al guardar los límites');
    }
    setIsSaving(false);
  };

  const renderCategoryBlock = (category) => (
    <div key={category} style={{ 
      background: 'rgba(255,255,255,0.02)', 
      border: '1px solid var(--glass-border)', 
      borderRadius: '12px', 
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{category}</h4>
        <div className="admin-stock-toggle-container" style={{ margin: 0 }}>
          <button 
            onClick={() => handleToggleClick(category)} 
            className={`admin-stock-btn ${!localLimits[category].active ? 'out' : 'in'}`}
            title={localLimits[category].active ? 'Desactivar Límite' : 'Activar Límite'}
          >
            <div className={`admin-stock-indicator ${!localLimits[category].active ? 'out' : 'in'}`} />
          </button>
          <span className="admin-stock-label" style={{ minWidth: '80px', textAlign: 'right' }}>
            {localLimits[category].active ? 'Activado' : 'Desactivado'}
          </span>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: localLimits[category].active ? 1 : 0.5, pointerEvents: localLimits[category].active ? 'auto' : 'none' }}>
        <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', flex: 1 }}>Límite Máximo:</label>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: 'rgba(0, 0, 0, 0.2)', 
          borderRadius: '8px', 
          border: '1px solid var(--glass-border)',
          overflow: 'hidden'
        }}>
          <motion.button 
            whileTap={{ scale: 0.85 }}
            onClick={() => handleLimitChange(category, Math.max(1, localLimits[category].limit - 1))}
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--text-primary)', 
              padding: '0.5rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Minus size={16} />
          </motion.button>
          
          <input 
            type="text" 
            inputMode="numeric"
            pattern="[0-9]*"
            value={localLimits[category].limit === 0 ? '' : localLimits[category].limit}
            onChange={(e) => handleLimitChange(category, e.target.value)}
            style={{ 
              width: '50px', padding: '0.5rem 0', textAlign: 'center', margin: 0, 
              border: 'none', background: 'transparent', color: 'var(--text-primary)',
              outline: 'none', fontSize: '1rem', fontWeight: 'bold'
            }}
          />
          
          <motion.button 
            whileTap={{ scale: 0.85 }}
            onClick={() => handleLimitChange(category, localLimits[category].limit + 1)}
            style={{ 
              background: 'var(--accent-yellow)', border: 'none', color: 'black', 
              padding: '0.5rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Plus size={16} />
          </motion.button>
        </div>
        
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', minWidth: '60px' }}>unidades</span>
      </div>
    </div>
  );

  return (
    <div className="admin-tab-content admin-settings-tab">
      <div className="admin-tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', background: 'linear-gradient(90deg, rgba(229, 169, 0, 0.05) 0%, transparent 100%)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--accent-yellow)', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ background: 'rgba(229, 169, 0, 0.1)', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-yellow)', boxShadow: '0 0 20px rgba(229, 169, 0, 0.15)' }}>
            <ShieldAlert size={32} />
          </div>
          <div>
            <h2 className="admin-card-title" style={{ fontSize: '1.8rem', margin: '0 0 0.2rem 0', textShadow: '0 2px 10px rgba(229, 169, 0, 0.2)' }}>Límites de Pedido</h2>
            <p className="admin-card-subtitle" style={{ margin: 0, fontSize: '0.95rem', opacity: 0.8 }}>Establece límites máximos de unidades por producto antes de mostrar alerta</p>
          </div>
        </div>
        <button 
          className="cta-button admin-create-btn" 
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save size={20} />
          <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
        </button>
      </div>

      <div className="admin-settings-form-layout">
        <div className="admin-settings-card glass">
          <div className="admin-card-section-header">
            <ShieldAlert size={24} style={{ color: 'var(--accent-pink)' }} />
            <div>
              <h4>Límites Estrictos (Bloqueo Total)</h4>
              <p>Aplica para salsas e ingredientes. Si el cliente alcanza este tope, no podrá añadir más unidades de ese extra.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', marginBottom: '2rem' }}>
            {Object.keys(localLimits).filter(c => c.startsWith('Extras') || c === 'Adicionales').map(category => renderCategoryBlock(category))}
          </div>

          <div className="admin-card-section-header">
            <ShieldAlert size={24} style={{ color: 'var(--accent-yellow)' }} />
            <div>
              <h4>Límites de Advertencia (Confirmación)</h4>
              <p>Aplica para los productos principales. Si un cliente supera este límite, se le pedirá confirmación para evitar errores de dedo.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {Object.keys(localLimits).filter(c => !c.startsWith('Extras') && c !== 'Adicionales').map(category => renderCategoryBlock(category))}
          </div>
        </div>
      </div>

      <AlertModal 
        isOpen={!!categoryToBlock} 
        title={`¿Desactivar límite para ${categoryToBlock}?`} 
        message={`Estás a punto de eliminar el límite de seguridad para la categoría "${categoryToBlock}". Los clientes podrán pedir unidades infinitas de golpe sin confirmación.`} 
        onClose={() => setCategoryToBlock(null)} 
        onConfirm={confirmBlock}
        confirmText="Sí, desactivar"
      />
    </div>
  );
}

export default AdminLimitsTab;
