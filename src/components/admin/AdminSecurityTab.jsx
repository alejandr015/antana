import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Trash2, UserPlus, ShieldAlert, KeyRound, ShieldCheck } from 'lucide-react';
import { getAdminUsers, addAdminUser, deleteAdminUser } from '../../services/db';
import { supabase } from '../../services/supabaseClient';
import AlertModal from '../AlertModal';

function AdminSecurityTab() {
  const [adminUsers, setAdminUsers] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Estado para el modal de confirmación premium
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: '',
    cancelText: 'Cancelar'
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers();
      setAdminUsers(data);
    } catch (error) {
      toast.error('Error al cargar la lista de administradores');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      await addAdminUser(newEmail);
      toast.success('Correo autorizado exitosamente');
      setNewEmail('');
      loadAdmins();
    } catch (error) {
      toast.error('No se pudo autorizar el correo. Verifica que no esté ya en la lista.');
    }
  };

  const handleDeleteAdmin = (id, email) => {
    setModalConfig({
      isOpen: true,
      title: 'Revocar Acceso',
      message: `¿Estás seguro de revocar el acceso a ${email}? No podrá volver a entrar al panel.`,
      confirmText: 'Sí, Revocar Acceso',
      onConfirm: async () => {
        closeModal();
        try {
          await deleteAdminUser(id);
          toast.success(`Acceso revocado para ${email}`);
          loadAdmins();
        } catch (error) {
          toast.error('Error al revocar el acceso');
        }
      }
    });
  };

  const handleSendPasswordReset = (email) => {
    setModalConfig({
      isOpen: true,
      title: 'Recuperar Clave',
      message: `¿Deseas enviar un enlace de recuperación de contraseña a ${email}?`,
      confirmText: 'Enviar Enlace',
      onConfirm: async () => {
        closeModal();
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
          toast.error('Hubo un error al enviar el correo. Dile al usuario que lo haga desde el Login.');
        } else {
          toast.success(`Enlace enviado a ${email}`);
        }
      }
    });
  };

  return (
    <div className="admin-content-card">
      <div className="admin-tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', background: 'linear-gradient(90deg, rgba(229, 169, 0, 0.05) 0%, transparent 100%)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--accent-yellow)' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ background: 'rgba(229, 169, 0, 0.1)', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-yellow)', boxShadow: '0 0 20px rgba(229, 169, 0, 0.15)' }}>
            <ShieldCheck size={32} />
          </div>
          <div className="admin-tab-title-group">
            <h2 className="admin-card-title" style={{ fontSize: '1.8rem', marginBottom: '0.2rem', textShadow: '0 2px 10px rgba(229, 169, 0, 0.2)' }}>Seguridad y Accesos VIP</h2>
            <p className="admin-card-subtitle" style={{ fontSize: '0.95rem', opacity: 0.8 }}>Centro de control absoluto. Decide quién entra y quién se queda fuera del panel.</p>
          </div>
        </div>
      </div>

      <div className="admin-settings-form-layout">
        
        <div className="admin-settings-card glass">
          <div className="admin-card-section-header">
            <ShieldAlert className="admin-section-icon pink" size={24} />
            <div>
              <h4>Lista de Correos Autorizados (VIP)</h4>
              <p>Si un usuario no está en esta lista, será rechazado aunque sepa la contraseña.</p>
            </div>
          </div>

          <form onSubmit={handleAddAdmin} className="admin-inline-form">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="ejemplo@antana.com"
              className="admin-input"
              style={{ flex: 1, padding: '1rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontSize: '1rem' }}
              required
            />
            <button type="submit" className="cta-button" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '1rem 2rem', justifyContent: 'center' }}>
              <UserPlus size={20} />
              <span>Autorizar Correo</span>
            </button>
          </form>

          <div className="admin-table-container">
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                  <th style={{ padding: '1.2rem 1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Correo Electrónico</th>
                  <th style={{ padding: '1.2rem 1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Fecha de Autorización</th>
                  <th style={{ padding: '1.2rem 1rem', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Cargando lista VIP...</td>
                  </tr>
                ) : adminUsers.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No hay administradores registrados
                    </td>
                  </tr>
                ) : (
                  adminUsers.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '1.2rem 1rem', fontWeight: '500', color: 'var(--text-primary)' }}>{user.email}</td>
                      <td style={{ padding: '1.2rem 1rem', color: 'var(--text-muted)' }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1.2rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleSendPasswordReset(user.email)}
                            className="admin-btn-icon"
                            style={{ padding: '0.6rem 1rem', borderRadius: '6px', background: 'rgba(229, 169, 0, 0.1)', color: 'var(--accent-yellow)', border: '1px solid rgba(229, 169, 0, 0.2)', display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                            title="Enviar enlace para cambiar contraseña"
                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(229, 169, 0, 0.2)' }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(229, 169, 0, 0.1)' }}
                          >
                            <KeyRound size={16} /> <span className="mobile-hidden" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Recuperar</span>
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(user.id, user.email)}
                            className="admin-btn-icon"
                            style={{ padding: '0.6rem 1rem', borderRadius: '6px', background: 'rgba(255, 45, 85, 0.1)', color: 'var(--accent-pink)', border: '1px solid rgba(255, 45, 85, 0.2)', display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                            title="Revocar acceso"
                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 45, 85, 0.2)' }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 45, 85, 0.1)' }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      <AlertModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
      />
    </div>
  );
}

export default AdminSecurityTab;
