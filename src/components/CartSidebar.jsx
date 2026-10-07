import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import AlertModal from './AlertModal';
import CheckoutModal from './CheckoutModal';
import ProductCustomizerModal from './ProductCustomizerModal';
import { Trash2, Edit2 } from 'lucide-react';
import { getMenuItems, getSettings } from '../services/db';
import { useHardwareBack } from '../hooks/useHardwareBack';
import { useSessionState } from '../hooks/useSessionState';

function CartSidebar() {
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeFromCart, updateCartItemFull, subTotal } = useCart();
  const [alertData, setAlertData] = useState({ isOpen: false, title: '', message: '', onConfirm: null, confirmText: '', cancelText: '' });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [confirmedLargeOrders, setConfirmedLargeOrders] = useState({});
  const [categoryLimits, setCategoryLimits] = useState({});

  // Cierra el carrito si presionan atrás en el celular
  useHardwareBack(isCartOpen, () => setIsCartOpen(false), 'cartSidebar');

  useEffect(() => {
    getMenuItems().then(data => setMenuItems(data));
    getSettings().then(s => {
      if (s && s.categoryLimits) setCategoryLimits(s.categoryLimits);
    });
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mobileStyles = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    maxHeight: '90vh',
    height: 'auto',
    zIndex: 999,
    padding: '0 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-secondary)',
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
    borderTop: '1px solid var(--glass-border)',
  };

  const desktopStyles = {
    position: 'fixed',
    right: 0,
    top: 0,
    width: '400px',
    maxWidth: '100%',
    height: '100vh',
    zIndex: 999,
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '1px solid var(--glass-border)',
    background: 'var(--bg-secondary)',
    borderRadius: '0'
  };

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* OVERLAY */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 998
              }}
            />

            {/* SIDEBAR / BOTTOM SHEET */}
            <motion.div
              initial={isMobile ? { y: '100%' } : { x: '100%' }}
              animate={isMobile ? { y: 0 } : { x: 0 }}
              exit={isMobile ? { y: '100%' } : { x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              drag={isMobile ? "y" : false}
              dragConstraints={{ top: 0, bottom: 500 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (isMobile && info.offset.y > 100) {
                  setIsCartOpen(false);
                }
              }}
              style={isMobile ? mobileStyles : desktopStyles}
            >
              {isMobile && (
                <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '12px auto', cursor: 'grab' }} />
              )}

              {/* HEADER */}
              <div style={{ marginBottom: '1.5rem', textAlign: isMobile ? 'center' : 'left', paddingTop: isMobile ? '0' : '0' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>
                  Mi <span style={{ color: 'var(--accent-yellow)' }}>pedido</span>
                </h2>
              </div>

              {/* ITEMS */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.2rem', paddingBottom: '1rem', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                {cartItems.length === 0 ? (
                  <p style={{ opacity: 0.6, textAlign: 'center', marginTop: '2rem' }}>Tu carrito está vacío 🍔</p>
                ) : (
                  cartItems.map(item => (
                    <div key={item.cartItemId} style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        {/* IMAGE */}
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          style={{
                            width: '65px',
                            height: '65px',
                            objectFit: 'cover',
                            borderRadius: '10px'
                          }}
                        />

                        {/* INFO */}
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {item.name}
                          </p>

                          {/* Mostrar Extras */}
                          {item.extras && item.extras.length > 0 && (
                            <div style={{ marginTop: '4px', marginBottom: '4px' }}>
                              {item.extras.map(e => {
                                const q = e.quantity || 1;
                                return (
                                  <div key={e.id} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    + {q > 1 ? `${q}x ` : ''}{e.name} (${(e.price * q).toLocaleString('es-CO')})
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Mostrar Nota */}
                          {item.comment && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontStyle: 'italic', marginTop: '4px' }}>
                              Nota: {item.comment}
                            </div>
                          )}

                          <p style={{ color: 'var(--accent-yellow)', fontSize: '0.9rem', margin: '0.4rem 0', fontWeight: 'bold' }}>
                            ${item.price.toLocaleString('es-CO')} c/u
                          </p>
                        </div>

                        {/* CONTROLES */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.8rem' }}>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => {
                                console.log("Clic en editar. Item:", item);
                                setEditingItem(item);
                              }}
                              style={{ background: 'transparent', border: 'none', color: 'var(--accent-yellow)', cursor: 'pointer', padding: '6px' }}
                              title="Editar producto"
                            >
                              <Edit2 size={20} />
                            </button>
                            <button
                              onClick={() => {
                                setAlertData({
                                  isOpen: true,
                                  title: 'Eliminar Producto',
                                  message: `¿Estás seguro que deseas eliminar este producto de tu pedido?`,
                                  onConfirm: () => {
                                    removeFromCart(item.cartItemId);
                                    setAlertData(prev => ({ ...prev, isOpen: false }));
                                  },
                                  confirmText: 'Eliminar',
                                  cancelText: 'Atrás'
                                });
                              }}
                              style={{ background: 'transparent', border: 'none', color: 'var(--accent-pink)', cursor: 'pointer', padding: '6px' }}
                              title="Eliminar producto"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '30px', padding: '2px 6px' }}>
                            <button
                              onClick={() => {
                                updateQuantity(item.cartItemId, -1);
                                const catLimit = categoryLimits[item.category];
                                const maxLimit = catLimit ? catLimit.limit : 10;
                                if (item.quantity - 1 <= maxLimit) {
                                  setConfirmedLargeOrders(prev => ({ ...prev, [item.cartItemId]: false }));
                                }
                              }}
                              style={{ background: 'transparent', border: 'none', color: 'white', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem' }}
                            >−</button>
                            <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                            <button
                              onClick={() => {
                                const catLimit = categoryLimits[item.category];
                                const isActive = catLimit ? catLimit.active : true;
                                const maxLimit = catLimit ? catLimit.limit : 10;

                                if (isActive && item.quantity >= maxLimit && !confirmedLargeOrders[item.cartItemId]) {
                                  setAlertData({
                                    isOpen: true,
                                    title: 'Aviso de Cantidad',
                                    message: `¿Estás seguro que deseas ordenar más de ${maxLimit} unidades de ${item.name}?`,
                                    onConfirm: () => {
                                      setConfirmedLargeOrders(prev => ({ ...prev, [item.cartItemId]: true }));
                                      updateQuantity(item.cartItemId, 1);
                                      setAlertData(prev => ({ ...prev, isOpen: false }));
                                    },
                                    confirmText: 'Aceptar',
                                    cancelText: 'Cancelar'
                                  });
                                  return;
                                }
                                updateQuantity(item.cartItemId, 1);
                              }}
                              style={{ background: 'transparent', border: 'none', color: 'white', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem' }}
                            >+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* FOOTER (FIJO AL FONDO) */}
              {cartItems.length > 0 && (
                <div style={{
                  marginTop: 'auto',
                  paddingTop: '1rem',
                  paddingBottom: isMobile ? '1.5rem' : '1rem',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  background: 'var(--bg-secondary)',
                  flexShrink: 0
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    <span>Subtotal:</span>
                    <span style={{ color: 'white' }}>${subTotal.toLocaleString('es-CO')}</span>
                  </div>

                  <motion.button
                    onClick={() => setIsCheckoutOpen(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      width: '100%',
                      display: 'block',
                      textAlign: 'center',
                      padding: '1rem',
                      background: 'var(--accent-yellow)',
                      color: 'black',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    Terminar Pedido
                  </motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AlertModal
        isOpen={alertData.isOpen}
        title={alertData.title}
        message={alertData.message}
        onClose={() => setAlertData({ ...alertData, isOpen: false })}
        onConfirm={alertData.onConfirm}
        confirmText={alertData.confirmText}
        cancelText={alertData.cancelText}
      />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      
      <ProductCustomizerModal
        isOpen={!!editingItem}
        product={editingItem ? (menuItems.find(p => p.id === editingItem.id) || editingItem) : null}
        onClose={() => {
          console.log("CartSidebar: onClose de ProductCustomizerModal fue llamado!");
          setEditingItem(null);
        }}
        onAddToCart={(product, qty, extras, comment) => {
          const basePrice = menuItems.find(p => p.id === editingItem.id)?.price || editingItem.price;
          updateCartItemFull(editingItem.cartItemId, qty, extras, comment, basePrice);
          setEditingItem(null);
        }}
        allMenuItems={menuItems}
        initialStep="customize"
        initialQuantity={editingItem ? editingItem.quantity : 1}
        initialExtras={editingItem ? (editingItem.extras || []) : []}
        initialComment={editingItem ? (editingItem.comment || '') : ''}
      />
    </>
  );
}

export default CartSidebar;
