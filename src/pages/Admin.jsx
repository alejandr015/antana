import React, { useState, useEffect } from 'react';
import { getMenuItems, getNeighborhoods, getSettings } from '../services/db';
import { Link } from 'react-router-dom';
import { 
  LogOut, 
  Utensils, 
  Bike, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  Menu as MenuIcon,
  Home as HomeIcon,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import '../admin.css';

// Admin Tabs
import AdminMenuTab from '../components/admin/AdminMenuTab';
import AdminNeighborhoodsTab from '../components/admin/AdminNeighborhoodsTab';
import AdminSettingsTab from '../components/admin/AdminSettingsTab';

function Admin() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('menu');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  
  // Estados de datos
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [items, setItems] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [settings, setSettings] = useState({ 
    preOrderAlert: { active: false, title: '', message: '', allowContinue: true }, 
    whatsappTemplate: '' 
  });

  useEffect(() => {
    const loadData = async () => {
      setIsDataLoading(true);
      const [fetchedItems, fetchedNbs, fetchedSettings] = await Promise.all([
        getMenuItems(),
        getNeighborhoods(),
        getSettings()
      ]);
      setItems(fetchedItems);
      setNeighborhoods(fetchedNbs);
      if (fetchedSettings) setSettings(fetchedSettings);
      setIsDataLoading(false);
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    await signOut();
  };

  const categories = ['Hamburguesas', 'Salchipapas', 'Perros Calientes', 'Bebidas', 'Adicionales'];

  return (
    <>
      {(isLoggingOut || isDataLoading) && <LoadingScreen />}
      
      <div className={`admin-app-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        
        {/* OVERLAY PARA MÓVIL */}
        {isMobileDrawerOpen && (
          <div 
            className="admin-mobile-overlay" 
            onClick={() => setIsMobileDrawerOpen(false)}
          />
        )}

        {/* SIDEBAR RETRAÍBLE A LA IZQUIERDA */}
        <aside className={`admin-collapsible-sidebar glass ${isMobileDrawerOpen ? 'mobile-open' : ''}`}>
          
          {/* Logo y Botón de Toggle Retraer/Expandir */}
          <div className="admin-sidebar-top">
            <div className="admin-sidebar-brand" style={{ padding: '0.5rem 0' }}>
              {!isCollapsed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Settings size={28} style={{ color: 'var(--accent-yellow)', filter: 'drop-shadow(0 0 8px rgba(229,169,0,0.4))' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', lineHeight: 1 }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-yellow)', letterSpacing: '2px', fontWeight: 'bold' }}>Panel de</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '0.5px', color: 'var(--accent-yellow)' }}>ADMIN</span>
                  </div>
                </div>
              ) : (
                <Settings className="admin-brand-icon" size={28} style={{ color: 'var(--accent-yellow)' }} />
              )}
            </div>

            <button 
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="admin-toggle-collapse-btn desktop-only"
              title={isCollapsed ? 'Expandir barra lateral' : 'Retraer barra lateral'}
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Menú de Navegación de Pestañas */}
          <div className="admin-sidebar-nav">
            <button
              onClick={() => { setActiveTab('menu'); setIsMobileDrawerOpen(false); }}
              className={`admin-nav-item ${activeTab === 'menu' ? 'active' : ''}`}
              title="Gestionar Menú de Productos"
            >
              <Utensils size={20} className="admin-nav-icon" />
              {!isCollapsed && <span className="admin-nav-label">Gestionar Menú</span>}
            </button>

            <button
              onClick={() => { setActiveTab('neighborhoods'); setIsMobileDrawerOpen(false); }}
              className={`admin-nav-item ${activeTab === 'neighborhoods' ? 'active' : ''}`}
              title="Gestionar Tarifas de Domicilios"
            >
              <Bike size={20} className="admin-nav-icon" />
              {!isCollapsed && <span className="admin-nav-label">Domicilios & Barrios</span>}
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setIsMobileDrawerOpen(false); }}
              className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              title="Configuración de Mensajes y Alertas"
            >
              <MessageSquare size={20} className="admin-nav-icon" />
              {!isCollapsed && <span className="admin-nav-label">Mensajes & Alertas</span>}
            </button>
          </div>

          {/* Pie de la barra lateral (Acciones) */}
          <div className="admin-sidebar-bottom">
            <Link 
              to="/menu" 
              className="admin-nav-item secondary"
              title="Ir al Menú Principal de Clientes"
            >
              <HomeIcon size={20} className="admin-nav-icon" />
              {!isCollapsed && <span className="admin-nav-label">Menú Principal</span>}
            </Link>

            <button 
              onClick={handleLogout} 
              className="admin-nav-item logout"
              title="Cerrar Sesión de Administrador"
            >
              <LogOut size={20} className="admin-nav-icon" />
              {!isCollapsed && <span className="admin-nav-label">Cerrar Sesión</span>}
            </button>
          </div>
        </aside>

        {/* CONTENEDOR PRINCIPAL */}
        <main className="admin-main-canvas">
          
          {/* Cabecera Móvil y barra superior */}
          <div className="admin-topbar glass desktop-hidden">
            <button 
              onClick={() => setIsMobileDrawerOpen(true)}
              className="admin-mobile-menu-trigger"
              title="Abrir menú"
            >
              <MenuIcon size={24} />
            </button>
            <div className="admin-topbar-title mobile-only">
              <h2>Panel de Administración</h2>
            </div>
          </div>

          {/* Canvas de Contenido según la pestaña activa */}
          <div className="admin-canvas-content">
            {activeTab === 'menu' && (
              <AdminMenuTab 
                items={items} 
                setItems={setItems} 
                categories={categories}
              />
            )}
            
            {activeTab === 'neighborhoods' && (
              <AdminNeighborhoodsTab 
                neighborhoods={neighborhoods}
                setNeighborhoods={setNeighborhoods}
              />
            )}

            {activeTab === 'settings' && (
              <AdminSettingsTab 
                settings={settings}
                setSettings={setSettings}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default Admin;
