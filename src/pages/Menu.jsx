import React, { useState, useEffect } from 'react';
import { getMenuItems, getSettings } from '../services/db';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Plus, Minus, ShoppingCart, Menu as MenuIcon, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AlertModal from '../components/AlertModal';
import LoadingScreen from '../components/LoadingScreen';
import ProductCustomizerModal from '../components/ProductCustomizerModal';
import { normalizeText } from '../utils/stringUtils';
import { useSessionState } from '../hooks/useSessionState';
import { useBranding } from '../hooks/useBranding';


function Menu() {
  const branding = useBranding();
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useSessionState('antana_activeCategory', 'Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useSessionState('antana_selectedProduct', null);
  const [modalInitialStep, setModalInitialStep] = useSessionState('antana_modalInitialStep', 'info');
  const [outOfStockItem, setOutOfStockItem] = useState(null);
  const { cartItems, addToCart, updateQuantity, setIsCartOpen, cartCount } = useCart();
  const [flyingStar, setFlyingStar] = useState(false);
  const [bumpCart, setBumpCart] = useState(false);

  const handleProductClick = (item, e) => {
    if (e) e.stopPropagation();
    if (item.isOutofStock) {
      setOutOfStockItem(item);
    } else {
      setModalInitialStep('info');
      setSelectedProduct(item);
    }
  };

  const handleAddToCartClick = (item, e) => {
    if (e) e.stopPropagation();
    if (item.isOutofStock) {
      setOutOfStockItem(item);
    } else {
      setModalInitialStep('customize');
      setSelectedProduct(item);
    }
  };

  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoading(true);
      const items = await getMenuItems();
      const stngs = await getSettings();
      setMenuItems(items);
      setSettings(stngs);
      setIsLoading(false);
    };
    fetchMenu();
  }, []);

  const allCats = settings?.customCategories || [];
  const categories = ['Todos', ...allCats.filter(c => !c.startsWith('Extras - '))];

  const displayedCategories = activeCategory === 'Todos' 
    ? categories.filter(c => c !== 'Todos') 
    : [activeCategory];

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <section id="menu" style={{ paddingTop: '130px', paddingBottom: '40px' }}>
        <div className="container">
          <div className="section-header reveal active" style={{ marginBottom: '1rem', marginTop: '0' }}>
            <span className="section-subtitle">Nuestra Carta</span>
            <h2 className="section-title">El Menú Antana</h2>
          </div>

          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="¿Qué se te antoja hoy?" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="search-clear-btn" onClick={() => setSearchTerm('')}>
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className="sidebar-layout">
            
            <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(true)}>
              <MenuIcon size={20} /> Categorías
            </button>

            <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

            {/* Sidebar Categories */}
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
              <div className="sidebar-header-mobile">
                <h3 style={{ margin: 0 }}>Categorías</h3>
                <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white' }}>
                  <X size={24} />
                </button>
              </div>
              
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setActiveCategory(category);
                    setIsSidebarOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`sidebar-category-btn ${activeCategory === category ? 'active' : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          
            {/* Main Content */}
            <div>
              {menuItems.filter(item => normalizeText(item.name).includes(normalizeText(searchTerm))).length === 0 && (
                <div className="empty-search-state glass">
                  <p>No encontramos productos que coincidan con "{searchTerm}"</p>
                  <button className="cta-button" onClick={() => setSearchTerm('')}>Ver todo el menú</button>
                </div>
              )}
              <AnimatePresence mode="popLayout">
            {displayedCategories.map(category => {
              const itemsInCategory = menuItems.filter(item => 
                item.category === category &&
                normalizeText(item.name).includes(normalizeText(searchTerm))
              );
              if (itemsInCategory.length === 0) return null;
              
              return (
                <motion.div 
                  key={category} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ marginBottom: '4rem' }}
                >
                  <h3 style={{ fontSize: '2rem', marginBottom: '2rem', borderBottom: '2px solid var(--accent-yellow)', paddingBottom: '0.5rem', display: 'inline-block' }}>
                    {category}
                  </h3>
                  <div className="burger-grid">
                    {itemsInCategory.map(item => {
                      return (
                        <div key={item.id} className="burger-card glass" style={{ opacity: item.isOutofStock ? 0.6 : 1, position: 'relative' }}>
                          {item.isOutofStock && (
                            <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--accent-pink)', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem', zIndex: 10 }}>
                              AGOTADO
                            </div>
                          )}
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            loading="lazy" 
                            decoding="async" 
                            className="burger-img" 
                            onClick={(e) => handleProductClick(item, e)}
                          />
                          <div className="burger-card-body">
                            <div className="burger-price-top">${item.price.toLocaleString('es-CO')}</div>
                            <h4 className="burger-name">{item.name}</h4>
                            <p className="burger-description-truncated">{item.description}</p>
                            <span className="burger-ver-mas" onClick={(e) => handleProductClick(item, e)}>Ver más</span>
                          </div>
                          
                          <div className="burger-card-footer">
                            <span className="burger-price-bottom">${item.price.toLocaleString('es-CO')}</span>
                            <button 
                              onClick={(e) => handleAddToCartClick(item, e)}
                              className="burger-add-btn-full"
                            >
                              <ShoppingCart size={16} /> Agregar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <AlertModal 
        isOpen={!!outOfStockItem} 
        title="¡Producto Agotado!" 
        message={`Lo sentimos, en este momento "${outOfStockItem?.name}" se encuentra agotado.`} 
        onClose={() => setOutOfStockItem(null)} 
        cancelText="Seguir con tu pedido"
      />

      {/* Product Image Modal */}
      <ProductCustomizerModal
        isOpen={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(product, qty, extras, comment) => {
          addToCart(product, qty, extras, comment);
          setFlyingStar(true);
        }}
        allMenuItems={menuItems}
        initialStep={modalInitialStep}
      />

      {/* Floating Cart Button (Mobile) */}
      <AnimatePresence>
        {cartItems.length > 0 && (
          <motion.button
            onClick={() => setIsCartOpen(true)}
            initial={{ y: 100, opacity: 0, x: '-50%' }}
            animate={{ 
              y: 0, 
              opacity: 1, 
              x: '-50%',
              scale: bumpCart ? 1.1 : 1
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            exit={{ y: 100, opacity: 0, x: '-50%' }}
            style={{
              position: 'fixed',
              bottom: '20px',
              left: '50%',
              width: '90%',
              maxWidth: '400px',
              backgroundColor: 'var(--accent-yellow)',
              color: 'black',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '30px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.8rem',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              zIndex: 990,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              cursor: 'pointer'
            }}
          >
            <ShoppingCart size={24} /> Mi pedido ({cartCount})
          </motion.button>
        )}
      </AnimatePresence>

      {/* Flying Star Animation - Phase 2 */}
      <AnimatePresence>
        {flyingStar && (
          <motion.div
            initial={{ top: '50%', left: '50%', scale: 1, opacity: 1, x: '-50%', y: '-50%' }}
            animate={{ 
              top: ['50%', '30%', '90%'], 
              left: ['50%', '75%', '50%'], 
              scale: [1.0, 1.5, 0.5], 
              opacity: [1, 1, 1],
              rotate: [0, 45, 0] 
            }}
            transition={{ 
              duration: 1.8, 
              delay: 0,
              times: [0, 0.4, 1],
              ease: "easeInOut" 
            }}
            onAnimationComplete={() => {
              setFlyingStar(false);
              setBumpCart(true);
              setTimeout(() => setBumpCart(false), 300);
            }}
            style={{
              position: 'fixed',
              width: '80px',
              height: '80px',
              zIndex: 9999,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              willChange: 'transform, top, left, opacity'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '10%', left: '10%', right: '10%', bottom: '10%',
              borderRadius: '50%',
              background: 'var(--accent-yellow)',
              filter: 'blur(30px)',
              opacity: 0.8,
              willChange: 'transform, opacity'
            }} />
            <img src="/anim_planet.png" alt="Planeta Antana" style={{ width: '100%', height: '100%', objectFit: 'contain', zIndex: 1, position: 'relative', willChange: 'transform', filter: 'drop-shadow(0 0 2px var(--accent-yellow)) brightness(1.5) contrast(1.2)' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Menu;
