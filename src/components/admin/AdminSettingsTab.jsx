import React, { useState } from 'react';
import { Save, Bell, AlertTriangle, XCircle, CheckCircle2, MessageSquare, Info, Settings } from 'lucide-react';
import { saveSettings } from '../../services/db';
import { toast } from 'sonner';

function AdminSettingsTab({ settings, setSettings }) {
  const [activeAlertMode, setActiveAlertMode] = useState(
    !settings.preOrderAlert?.active
      ? 'normal'
      : settings.preOrderAlert?.allowContinue
        ? 'delay'
        : 'closed'
  );

  const handleSettingsChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const setMode = (mode) => {
    setActiveAlertMode(mode);
    if (mode === 'normal') {
      setSettings(prev => ({
        ...prev,
        preOrderAlert: {
          ...prev.preOrderAlert,
          active: false
        }
      }));
    } else if (mode === 'delay') {
      setSettings(prev => ({
        ...prev,
        preOrderAlert: {
          ...prev.preOrderAlert,
          active: true,
          allowContinue: true
        }
      }));
    } else if (mode === 'closed') {
      setSettings(prev => ({
        ...prev,
        preOrderAlert: {
          ...prev.preOrderAlert,
          active: true,
          allowContinue: false
        }
      }));
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    await saveSettings(settings);
    toast.success('Configuración y mensajes guardados correctamente.');
  };

  const handleInsertVariable = (varName) => {
    const current = settings.whatsappTemplate || '';
    setSettings(prev => ({
      ...prev,
      whatsappTemplate: current + ` ${varName} `
    }));
    toast.info(`Variable añadida: ${varName}`);
  };

  let profileName = 'normalAlert';
  if (activeAlertMode === 'delay') profileName = 'delayAlert';
  if (activeAlertMode === 'closed') profileName = 'closedAlert';
  
  const profileData = settings[profileName] || {};

  return (
    <div className="admin-tab-content admin-settings-tab">
      <div className="admin-tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', background: 'linear-gradient(90deg, rgba(229, 169, 0, 0.05) 0%, transparent 100%)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--accent-yellow)', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ background: 'rgba(229, 169, 0, 0.1)', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-yellow)', boxShadow: '0 0 20px rgba(229, 169, 0, 0.15)' }}>
            <MessageSquare size={32} />
          </div>
          <div>
            <h2 className="admin-card-title" style={{ fontSize: '1.8rem', margin: '0 0 0.2rem 0', textShadow: '0 2px 10px rgba(229, 169, 0, 0.2)' }}>Configuración de Mensajes</h2>
            <p className="admin-card-subtitle" style={{ margin: 0, fontSize: '0.95rem', opacity: 0.8 }}>Controla alertas previas y la plantilla automática enviada a WhatsApp</p>
          </div>
        </div>
        <button 
          className="cta-button admin-create-btn" 
          onClick={handleSaveSettings}
        >
          <Save size={20} />
          <span>Guardar Configuración</span>
        </button>
      </div>

      <form className="admin-settings-form-layout">
        
        {/* SECCIÓN 1: ESTADO DEL LOCAL Y ALERTAS PREVIAS */}
        <div className="admin-settings-card glass">
          <div className="admin-card-section-header">
            <Bell className="admin-section-icon yellow" size={24} />
            <div>
              <h4>Estado Operativo del Local (Alerta al Cliente)</h4>
              <p>Selecciona cómo se encuentra tu negocio en este momento para tus clientes.</p>
            </div>
          </div>

          {/* Selector visual de Modo en 3 pastillas */}
          <div className="admin-status-selector-grid">
            {/* Opción 1: Operación Normal */}
            <div
              onClick={() => setMode('normal')}
              className={`admin-status-option ${activeAlertMode === 'normal' ? 'selected green' : ''}`}
            >
              <div className="admin-status-icon-row">
                <CheckCircle2 size={24} className="icon-green" />
                <span className="admin-status-badge green">Recomendado</span>
              </div>
              <h5>Operación Normal</h5>
              <p>Sin alertas previas. El cliente selecciona productos y pasa directo a WhatsApp sin interrupciones.</p>
            </div>

            {/* Opción 2: Demoras / Tiempos de espera */}
            <div
              onClick={() => setMode('delay')}
              className={`admin-status-option ${activeAlertMode === 'delay' ? 'selected cyan' : ''}`}
            >
              <div className="admin-status-icon-row">
                <AlertTriangle size={24} className="icon-cyan" />
                <span className="admin-status-badge cyan">Informativo</span>
              </div>
              <h5>Demoras / Espera</h5>
              <p>Muestra aviso de tiempo de espera (ej. alta demanda), pero <strong>permite al cliente continuar</strong> su pedido.</p>
            </div>

            {/* Opción 3: Cerrado / Sin Domicilios */}
            <div
              onClick={() => setMode('closed')}
              className={`admin-status-option ${activeAlertMode === 'closed' ? 'selected pink' : ''}`}
            >
              <div className="admin-status-icon-row">
                <XCircle size={24} className="icon-pink" />
                <span className="admin-status-badge pink">Bloqueo Total</span>
              </div>
              <h5>Local Cerrado / Sin Domicilios</h5>
              <p>Muestra aviso y <strong>bloquea el paso</strong> a WhatsApp. Ideal para cierres de turno o lluvia extrema.</p>
            </div>
          </div>

          {/* Formulario de personalización del mensaje si hay alerta activa */}
          <div className={`admin-alert-customizer-box ${activeAlertMode === 'delay' ? 'cyan-border' : activeAlertMode === 'closed' ? 'pink-border' : 'green-border'}`}>
            <div className="admin-customizer-header">
              <Info size={20} />
              <span>
                {activeAlertMode === 'delay' 
                  ? 'Personalizando Alerta Informativa (Demoras)' 
                  : activeAlertMode === 'closed'
                  ? 'Personalizando Alerta de Bloqueo (Local Cerrado)'
                  : 'Personalizando Confirmación (Operación Normal)'}
              </span>
            </div>

            <div className="admin-form-group">
              <label>Título de la Alerta (Grande y Claro)</label>
              <input
                type="text"
                name="title"
                value={profileData.title || ''}
                onChange={(e) => {
                  setSettings({
                    ...settings,
                    [profileName]: { ...(settings[profileName] || {}), title: e.target.value }
                  });
                }}
                placeholder={activeAlertMode === 'delay' ? "Ej: ¡Tenemos alta demanda hoy!" : activeAlertMode === 'closed' ? "Ej: Estamos fuera de servicio" : "Ej: Confirmación de Pedido"}
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label>Mensaje detallado para el cliente</label>
              <textarea
                name="message"
                value={profileData.message || ''}
                onChange={(e) => {
                  setSettings({
                    ...settings,
                    [profileName]: { ...(settings[profileName] || {}), message: e.target.value }
                  });
                }}
                rows="3"
                placeholder={activeAlertMode === 'delay' ? "Ej: El tiempo estimado de entrega actual es de 45 a 60 minutos." : activeAlertMode === 'closed' ? "Ej: En este momento no contamos con servicio a domicilio. Te esperamos en nuestro local." : "Ej: Tu pedido tardará de 25 a 35 minutos."}
                className="admin-input"
              />
              <span className="admin-tip-text">
                Tip: Si escribes <code>{'{link_mapa}'}</code>, la app convertirá ese texto en un enlace automático a Google Maps.
              </span>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: PLANTILLA DE WHATSAPP */}
        <div className="admin-settings-card glass">
          <div className="admin-card-section-header">
            <MessageSquare className="admin-section-icon yellow" size={24} />
            <div>
              <h4>Plantilla de Mensaje para WhatsApp</h4>
              <p>Define la estructura del mensaje que se autocompletará en el chat cuando el cliente confirme su carrito.</p>
            </div>
          </div>

          {/* Chips de variables clicables */}
          <div className="admin-variables-panel">
            <span className="admin-variables-title">Variables rápidas (Haz clic para insertar):</span>
            <div className="admin-chips-container">
              {[
                { key: '{nombre}', label: '👤 Nombre' },
                { key: '{celular}', label: '📱 Celular' },
                { key: '{pedido}', label: '📦 Lista de Productos' },
                { key: '{barrio}', label: '📍 Barrio' },
                { key: '{direccion}', label: '🏠 Dirección' },
                { key: '{domicilio}', label: '🛵 Precio Envío' },
                { key: '{metodo_pago}', label: '💳 Método de Pago' },
                { key: '{total}', label: '💰 Total a Pagar' },
                { key: '{tiempo_espera}', label: '⏳ Alerta de Espera' },
              ].map(chip => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => handleInsertVariable(chip.key)}
                  className="admin-variable-chip"
                >
                  {chip.label} <code>{chip.key}</code>
                </button>
              ))}
            </div>
          </div>

          <div className="admin-form-group">
            <textarea
              name="whatsappTemplate"
              value={settings.whatsappTemplate || ''}
              onChange={handleSettingsChange}
              required
              rows="10"
              className="admin-input monospace"
              placeholder="Hola Antana, quiero realizar este pedido:&#10;{pedido}&#10;Barrio: {barrio}..."
            />
          </div>
        </div>

      </form>
    </div>
  );
}

export default AdminSettingsTab;
