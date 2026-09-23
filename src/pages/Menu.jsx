import React, { useState, useEffect } from 'react';
import { getMenuItems } from '../services/db';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Plus, Minus, ShoppingCart, Menu as MenuIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AlertModal from '../components/AlertModal';
import LoadingScreen from '../components/LoadingScreen';


function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [outOfStockItem, setOutOfStockItem] = useState(null);
  const { cartItems, addToCart, updateQuantity } = useCart();

  const handleProductClick = (item, e) => {
    if (e) e.stopPropagation();
    if (item.isOutofStock) {
      setOutOfStockItem(item);
    } else {
      setSelectedProduct(item);
    }
  };

  const handleAddToCartClick = (item, e) => {
    if (e) e.stopPropagation();
    if (item.isOutofStock) {
      setOutOfStockItem(item);
    } else {
      addToCart(item);
    }
  };

  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoading(true);
      const items = await getMenuItems();
      setMenuItems(items);
      setIsLoading(false);
    };
    fetchMenu();
  }, []);

  const categories = ['Todos', 'Hamburguesas', 'Salchipapas', 'Perros Calientes', 'Bebidas', 'Adicionales'];

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
              <AnimatePresence mode="popLayout">
            {displayedCategories.map(category => {
              const itemsInCategory = menuItems.filter(item => item.category === category);
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
                      const cartItem = cartItems.find(i => i.id === item.id);
                      const quantity = cartItem ? cartItem.quantity : 0;

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
                            {quantity > 0 ? (
                              <div className="burger-quantity-controls">
                                <button onClick={() => updateQuantity(item.id, -1)} style={{ background: 'var(--accent-pink)', border: 'none', color: 'white', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Minus size={16} /></button>
                                <span style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '0.9rem', width: '20px' }}>{quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} style={{ background: 'var(--accent-cyan)', border: 'none', color: 'black', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={16} /></button>
                              </div>
                            ) : (
                              <button 
                                onClick={(e) => handleAddToCartClick(item, e)}
                                className="burger-add-btn-full"
                              >
                                <ShoppingCart size={16} /> Agregar
                              </button>
                            )}
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
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            className="product-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div 
              className="product-modal-card"
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside card
            >
              <button 
                className="product-modal-close-btn" 
                onClick={() => setSelectedProduct(null)}
              >
                <X size={20} />
              </button>

              <div className="product-modal-img-container">
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} />
              </div>

              <div className="product-modal-details">
                <h2 className="product-modal-title">{selectedProduct.name}</h2>
                <p className="product-modal-desc">{selectedProduct.description}</p>
                
                <div className="product-modal-footer">
                  <span className="product-modal-price">${selectedProduct.price.toLocaleString('es-CO')}</span>
                  
                  {(() => {
                    const cartItem = cartItems.find(i => i.id === selectedProduct.id);
                    const quantity = cartItem ? cartItem.quantity : 0;
                    
                    return quantity > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '0.5rem' }}>
                        <button onClick={() => updateQuantity(selectedProduct.id, -1)} style={{ background: 'var(--accent-pink)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Minus size={16} /></button>
                        <span style={{ fontWeight: 'bold', width: '24px', textAlign: 'center' }}>{quantity}</span>
                        <button onClick={() => updateQuantity(selectedProduct.id, 1)} style={{ background: 'var(--accent-cyan)', border: 'none', color: 'black', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={16} /></button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => addToCart(selectedProduct)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-yellow)', color: 'black', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}
                      >
                        <ShoppingCart size={20} /> Agregar
                      </button>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Menu;
