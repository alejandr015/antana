import React, { useState, useEffect } from 'react';
import { getMenuItems, getNeighborhoods, getSettings } from '../services/db';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Utensils, 
  Bike, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  Menu as MenuIcon,
  Home as HomeIcon,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  UserCircle,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import '../admin.css';

import AdminMenuTab from '../components/admin/AdminMenuTab';
import AdminNeighborhoodsTab from '../components/admin/AdminNeighborhoodsTab';
import AdminSettingsTab from '../components/admin/AdminSettingsTab';
import AdminLimitsTab from '../components/admin/AdminLimitsTab';
import AdminProfileTab from '../components/admin/AdminProfileTab';
import AdminAnalyticsTab from '../components/admin/AdminAnalyticsTab';
import AdminSecurityTab from '../components/admin/AdminSecurityTab';
import { useBranding } from '../hooks/useBranding';

function Admin() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  useBranding(); // Asegura que el favicon se actualice incluso estando en la ruta /admin
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({ catalog: true, logistics: true, settings: true });
  
  const toggleGroup = (group) => {
    if (!isCollapsed) {
      setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    } else {
      setIsCollapsed(false);
      setExpandedGroups(prev => ({ ...prev, [group]: true }));
    }
  };
  
  // Estados de datos
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();
  
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

  const categories = settings?.customCategories || [];

  const handleExitToStore = (e) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => {
      navigate('/menu');
    }, 1000); // 1 segundo de loading
  };

  return (
    <>
      {(isLoggingOut || isDataLoading || isExiting) && <LoadingScreen />}
      
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
          
          {/* Logo y Botón de Toggle Retraer/Expandir unificado */}
          <div className="admin-sidebar-top">
            <div 
              className="admin-sidebar-brand" 
              style={{ padding: '0.5rem 0', cursor: 'pointer', display: 'flex', alignItems: 'center', width: '100%', justifyContent: isCollapsed ? 'center' : 'flex-start' }}
              onClick={() => {
                if (window.innerWidth <= 900) {
                  setIsMobileDrawerOpen(false);
                } else {
                  setIsCollapsed(!isCollapsed);
                }
              }}
              title={isCollapsed ? 'Expandir barra lateral' : 'Retraer barra lateral'}
            >
              {!isCollapsed ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 0.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', lineHeight: 1 }}>
                    <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--accent-yellow)', letterSpacing: '2px', fontWeight: 'bold' }}>Panel de</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '0.5px', color: 'var(--accent-yellow)' }}>ADMIN</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Settings size={28} style={{ color: 'var(--accent-yellow)', filter: 'drop-shadow(0 0 8px rgba(229,169,0,0.4))', transition: 'transform 0.3s' }} className="gear-spin-hover" />
                    <ChevronLeft size={20} style={{ color: 'var(--accent-yellow)' }} />
                  </div>
                </div>
              ) : (
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                  <Settings className="admin-brand-icon gear-spin-hover" size={28} style={{ color: 'var(--accent-yellow)', transition: 'transform 0.3s' }} />
                  <ChevronRight size={18} style={{ color: 'var(--accent-yellow)', position: 'absolute', right: '-5px' }} />
                </div>
              )}
            </div>
          </div>

          {/* Menú de Navegación de Pestañas Organizado por Grupos */}
          <div className="admin-sidebar-nav">
            
            {/* BOTÓN PERFIL PRINCIPAL */}
            <button
              onClick={() => { setActiveTab('profile'); setIsMobileDrawerOpen(false); }}
              className={`admin-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              title="Perfil y Marca"
            >
              <UserCircle size={20} className="admin-nav-icon" />
              {!isCollapsed && <span className="admin-nav-label">Perfil y Marca</span>}
            </button>

            {/* GRUPO: CATÁLOGO */}
            <div className="admin-nav-group">
              <button
                onClick={() => toggleGroup('catalog')}
                className={`admin-nav-item ${(activeTab === 'menu_main' || activeTab === 'menu_extras') && isCollapsed ? 'active' : ''}`}
                style={{ justifyContent: isCollapsed ? 'center' : 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Utensils size={20} className="admin-nav-icon" />
                  {!isCollapsed && <span className="admin-nav-label">Menú Digital</span>}
                </div>
                {!isCollapsed && (
                  <ChevronDown size={16} style={{ transform: expandedGroups.catalog ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                )}
              </button>
              
              <div className="admin-subnav-container" style={{ display: expandedGroups.catalog && !isCollapsed ? 'flex' : 'none' }}>
                <button
                  onClick={() => { setActiveTab('menu_main'); setIsMobileDrawerOpen(false); }}
                  className={`admin-subnav-item ${activeTab === 'menu_main' ? 'active' : ''}`}
                >
                  Productos Principales
                </button>
                <button
                  onClick={() => { setActiveTab('menu_extras'); setIsMobileDrawerOpen(false); }}
                  className={`admin-subnav-item ${activeTab === 'menu_extras' ? 'active' : ''}`}
                >
                  Adicionales
                </button>
              </div>
            </div>

            {/* BOTONES DIRECTOS */}
            <button
              onClick={() => { setActiveTab('analytics'); setIsMobileDrawerOpen(false); }}
              className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              title="Estadísticas de Ventas"
            >
              <TrendingUp size={20} className="admin-nav-icon" />
              {!isCollapsed && <span className="admin-nav-label">Estadísticas de Ventas</span>}
            </button>

            <button
              onClick={() => { setActiveTab('neighborhoods'); setIsMobileDrawerOpen(false); }}
              className={`admin-nav-item ${activeTab === 'neighborhoods' ? 'active' : ''}`}
              title="Zonas y Tarifas"
            >
              <Bike size={20} className="admin-nav-icon" />
              {!isCollapsed && <span className="admin-nav-label">Zonas y Tarifas</span>}
            </button>

            <button
              onClick={() => { setActiveTab('settings_alerts'); setIsMobileDrawerOpen(false); }}
              className={`admin-nav-item ${activeTab === 'settings_alerts' ? 'active' : ''}`}
              title="Alertas & Mensajes"
            >
              <MessageSquare size={20} className="admin-nav-icon" />
              {!isCollapsed && <span className="admin-nav-label">Alertas & Mensajes</span>}
            </button>

            <button
              onClick={() => { setActiveTab('settings_limits'); setIsMobileDrawerOpen(false); }}
              className={`admin-nav-item ${activeTab === 'settings_limits' ? 'active' : ''}`}
              title="Límites de Pedido"
            >
              <ShieldAlert size={20} className="admin-nav-icon" />
              {!isCollapsed && <span className="admin-nav-label">Límites de Pedido</span>}
            </button>

            <button
              onClick={() => { setActiveTab('security'); setIsMobileDrawerOpen(false); }}
              className={`admin-nav-item ${activeTab === 'security' ? 'active' : ''}`}
              title="Seguridad y Accesos"
            >
              <ShieldCheck size={20} className="admin-nav-icon" />
              {!isCollapsed && <span className="admin-nav-label">Seguridad y Accesos</span>}
            </button>
          </div>

          {/* Pie de la barra lateral (Acciones) */}
          <div className="admin-sidebar-bottom">
            <button 
              onClick={handleExitToStore}
              className="admin-nav-item secondary"
              title="Ir al Menú Principal de Clientes"
            >
              <HomeIcon size={20} className="admin-nav-icon" />
              {!isCollapsed && <span className="admin-nav-label">Menú Principal</span>}
            </button>

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
          <div className="admin-topbar glass desktop-hidden" style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsMobileDrawerOpen(true)}
              className="admin-mobile-menu-trigger"
              title="Abrir menú"
              style={{ position: 'relative', zIndex: 2, padding: '0.5rem' }}
            >
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '6px' }}>
                <Settings size={26} style={{ color: 'var(--accent-yellow)' }} className="gear-spin-hover" />
                <ChevronRight size={16} style={{ color: 'var(--accent-yellow)', position: 'absolute', right: '-16px' }} />
              </div>
            </button>
            <div className="admin-topbar-title mobile-only" style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '0.5px', color: 'var(--accent-yellow)', textTransform: 'uppercase' }}>Panel de ADMIN</span>
            </div>
          </div>

          {/* Canvas de Contenido según la pestaña activa */}
          <div className="admin-canvas-content">
            {(activeTab === 'menu_main' || activeTab === 'menu_extras') && (
              <AdminMenuTab 
                items={items} 
                setItems={setItems} 
                categories={categories}
                activeMode={activeTab} // 'menu_main' o 'menu_extras'
                settings={settings}
                setSettings={setSettings}
              />
            )}
            
            {activeTab === 'analytics' && (
              <AdminAnalyticsTab />
            )}

            {activeTab === 'neighborhoods' && (
              <AdminNeighborhoodsTab 
                neighborhoods={neighborhoods}
                setNeighborhoods={setNeighborhoods}
              />
            )}

            {activeTab === 'settings_alerts' && (
              <AdminSettingsTab 
                settings={settings}
                setSettings={setSettings}
              />
            )}

            {activeTab === 'settings_limits' && (
              <AdminLimitsTab 
                settings={settings}
                setSettings={setSettings}
              />
            )}

            {activeTab === 'profile' && (
              <AdminProfileTab 
                settings={settings}
                setSettings={setSettings}
              />
            )}

            {activeTab === 'security' && <AdminSecurityTab />}
          </div>
        </main>
      </div>
    </>
  );
}

export default Admin;
