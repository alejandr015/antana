import React, { useState, useRef } from 'react';
import { Save, Image as ImageIcon, UserCircle, UploadCloud, Trash2, CheckCircle2 } from 'lucide-react';
import { saveSettings, uploadImage } from '../../services/db';
import { toast } from 'sonner';

function AdminProfileTab({ settings, setSettings }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const branding = settings.branding || {
    logoUrl: '/logo.webp',
    title: 'Sabor <span>Angus</span> Inigualable',
    description: 'Una mezcla perfecta entre lo industrial y lo retro. Disfruta de la mejor carne Angus certificada en el corazón de Neiva.'
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        [name]: value
      }
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen es demasiado pesada. Máximo 5MB.');
      return;
    }

    try {
      setIsUploading(true);
      toast.info('Subiendo logo...');
      const url = await uploadImage(file, `logo_${Date.now()}`);
      
      setSettings(prev => {
        const currentGallery = prev.branding?.logoGallery || [];
        const newGallery = currentGallery.length < 5 && !currentGallery.includes(url) 
          ? [url, ...currentGallery] 
          : currentGallery;

        return {
          ...prev,
          branding: {
            ...prev.branding,
            logoUrl: url,
            logoGallery: newGallery
          }
        };
      });
      toast.success('Logo actualizado correctamente');
    } catch (err) {
      console.error(err);
      toast.error('Hubo un error subiendo la imagen');
    } finally {
      setIsUploading(false);
      // Reset input para permitir subir la misma imagen si fuera necesario
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSelectGalleryLogo = (url) => {
    setSettings(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        logoUrl: url
      }
    }));
    toast.success('Logo seleccionado de la galería');
  };

  const handleDeleteGalleryLogo = (urlToDelete) => {
    setSettings(prev => {
      const newGallery = (prev.branding?.logoGallery || []).filter(url => url !== urlToDelete);
      return {
        ...prev,
        branding: {
          ...prev.branding,
          logoGallery: newGallery
        }
      };
    });
    toast.success('Logo eliminado de la galería');
  };

  const handleResetLogo = () => {
    setSettings(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        logoUrl: '/antana-logo-oficial.png'
      }
    }));
    toast.success('Logo restablecido al por defecto. No olvides Guardar Cambios.');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await saveSettings(settings);
      toast.success('Perfil de marca guardado correctamente.');
    } catch (error) {
      toast.error('Error al guardar los cambios.');
    }
  };

  return (
    <div className="admin-tab-content admin-settings-tab">
      <div className="admin-tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', background: 'linear-gradient(90deg, rgba(229, 169, 0, 0.05) 0%, transparent 100%)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--accent-yellow)', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ background: 'rgba(229, 169, 0, 0.1)', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-yellow)', boxShadow: '0 0 20px rgba(229, 169, 0, 0.15)' }}>
            <UserCircle size={32} />
          </div>
          <div>
            <h2 className="admin-card-title" style={{ fontSize: '1.8rem', margin: '0 0 0.2rem 0', textShadow: '0 2px 10px rgba(229, 169, 0, 0.2)' }}>Perfil y Marca</h2>
            <p className="admin-card-subtitle" style={{ margin: 0, fontSize: '0.95rem', opacity: 0.8 }}>Personaliza el logo y los textos principales que ven tus clientes</p>
          </div>
        </div>
        <button 
          className="cta-button admin-create-btn" 
          onClick={handleSave}
          disabled={isUploading}
        >
          <Save size={20} />
          <span>{isUploading ? 'Guardando...' : 'Guardar Cambios'}</span>
        </button>
      </div>

      <form className="admin-settings-form-layout" onSubmit={handleSave}>
        
        {/* SECCIÓN LOGO */}
        <div className="admin-settings-card glass">
          <div className="admin-card-section-header">
            <ImageIcon className="admin-section-icon yellow" size={24} />
            <div>
              <h4>Logo Principal</h4>
              <p>Este logo aparecerá en la barra superior (Navbar) y en el pie de página (Footer).</p>
            </div>
          </div>
          
          <div className="admin-form-group" style={{ marginTop: '1rem' }}>
            <div className="admin-image-upload-wrapper" style={{ gap: '2rem' }}>
              <div 
                className="admin-image-preview-container" 
                style={{ 
                  width: 120, height: 120, borderRadius: '50%', background: '#111', 
                  border: '3px solid var(--accent-yellow)', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  cursor: 'pointer', transition: 'transform 0.2s',
                  boxShadow: '0 0 15px rgba(229,169,0,0.3)'
                }}
                onClick={() => branding.logoUrl && setIsImageModalOpen(true)}
                title="Click para ver en grande"
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {branding.logoUrl ? (
                  <img src={branding.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserCircle size={48} color="var(--text-muted)" />
                )}
                {isUploading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'white', fontWeight: 'bold' }}>Cargando...</span>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  style={{ display: 'none' }} 
                  onChange={handleImageUpload}
                />
                <button 
                  type="button" 
                  className="cta-button admin-create-btn" 
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  disabled={isUploading}
                >
                  <UploadCloud size={20} />
                  <span>Subir nuevo Logo</span>
                </button>
                <button 
                  type="button" 
                  className="cta-button admin-create-btn" 
                  style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}
                  onClick={handleResetLogo}
                  disabled={isUploading}
                >
                  <span>Restaurar logo original (Planeta)</span>
                </button>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Recomendado: Imagen cuadrada (PNG o JPG), máximo 5MB.</span>
              </div>
            </div>
          </div>

          {/* GALERÍA DE LOGOS */}
          <div className="admin-form-group" style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
            <label className="admin-form-label">Galería de Logos Guardados ({(branding.logoGallery || []).length}/5)</label>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Sube logos temáticos (Navidad, Halloween, etc.) y guárdalos aquí para cambiarlos fácilmente en un clic. Al subir un logo nuevo se guarda automáticamente si hay espacio.</p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {(branding.logoGallery || []).map((url, index) => (
                <div 
                  key={index} 
                  style={{ 
                    position: 'relative', width: '80px', height: '80px', borderRadius: '12px', 
                    border: branding.logoUrl === url ? '2px solid var(--accent-yellow)' : '1px solid var(--glass-border)',
                    overflow: 'hidden', background: '#111', cursor: 'pointer'
                  }}
                  onClick={() => handleSelectGalleryLogo(url)}
                  title="Click para establecer como logo principal"
                >
                  <img src={url} alt={`Gallery ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {branding.logoUrl === url && (
                    <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'var(--background-color)', borderRadius: '50%', padding: '2px' }}>
                      <CheckCircle2 size={16} color="var(--accent-yellow)" />
                    </div>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteGalleryLogo(url); }}
                    style={{ 
                      position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(255,0,0,0.8)', 
                      border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer', color: 'white' 
                    }}
                    title="Eliminar de la galería"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              
              {(branding.logoGallery || []).length < 5 && (
                <div 
                  style={{ 
                    width: '80px', height: '80px', borderRadius: '12px', 
                    border: '1px dashed var(--text-secondary)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.05)'
                  }}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  title="Subir a la galería"
                >
                  <UploadCloud size={24} color="var(--text-secondary)" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Imagen Grande */}
        {isImageModalOpen && (
          <div 
            style={{
              position: 'fixed',
              top: 0, left: 0, width: '100vw', height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.9)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(5px)'
            }}
            onClick={() => setIsImageModalOpen(false)}
          >
            <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
              <img 
                src={branding.logoUrl} 
                alt="Logo en Grande" 
                style={{ width: '100%', height: 'auto', maxHeight: '50vh', maxWidth: '50vw', objectFit: 'contain', borderRadius: '1rem', border: '2px solid var(--accent-yellow)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} 
              />
              <span style={{ 
                position: 'absolute', top: '-40px', right: '0', 
                color: 'white', fontWeight: 'bold', cursor: 'pointer', 
                background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '20px'
              }}>
                Cerrar (x)
              </span>
            </div>
          </div>
        )}

        {/* SECCIÓN ESLOGAN */}
        <div className="admin-settings-card glass">
          <div className="admin-card-section-header">
            <UserCircle className="admin-section-icon yellow" size={24} />
            <div>
              <h4>Textos de Inicio (Eslogan)</h4>
              <p>Esta es la primera impresión de tus clientes cuando abren la página web.</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
            <div className="admin-form-group">
              <label>Título Principal (Hero)</label>
              <textarea
                name="title"
                value={branding.title || ''}
                onChange={handleTextChange}
                rows="2"
                placeholder="Ej: Sabor Angus Inigualable"
                className="admin-input"
                style={{ resize: 'vertical' }}
              />
              <span className="admin-tip-text" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '4px' }}>
                Tip: Si quieres que una palabra resalte en color amarillo brillante, enciérrala entre asteriscos, por ejemplo: <code>*Hamburguesería*</code>
              </span>
            </div>

            <div className="admin-form-group">
              <label>Descripción / Eslogan Corto</label>
              <textarea
                name="description"
                value={branding.description || ''}
                onChange={handleTextChange}
                rows="3"
                placeholder="Ej: La mejor hamburguesa de Neiva..."
                className="admin-input"
              />
              <span className="admin-tip-text" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '4px' }}>
                Tip: También puedes usar los <code>*asteriscos*</code> aquí para resaltar palabras en amarillo.
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AdminProfileTab;
