import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { getNeighborhoods, getSettings } from '../services/db';
import AlertModal from './AlertModal';

function CartSidebar() {
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, updateComment, removeFromCart, cartTotal, subTotal, deliveryFee, selectedNeighborhood, setSelectedNeighborhood } = useCart();
  const [address, setAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [alertData, setAlertData] = useState({ isOpen: false, title: '', message: '', onConfirm: null, confirmText: '', cancelText: '' });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    // Verificar en el montaje
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isCartOpen) {
      const loadNb = async () => {
        setNeighborhoods(await getNeighborhoods());
      };
      loadNb();
    }
  }, [isCartOpen]);

  const executeWhatsAppOrder = (settings) => {
    const orderText = cartItems.map(item =>
      `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString('es-CO')}` +
      (item.comment ? ` (Nota: ${item.comment})` : "")
    ).join('\n');

    const isDelayActive = settings.preOrderAlert && settings.preOrderAlert.active && settings.preOrderAlert.allowContinue;
    const tiempoEsperaMsg = isDelayActive
      ? (settings.delayAlert?.message || '')
      : (settings.normalAlert?.message || '');

    let finalMessage = settings.whatsappTemplate
      .replace('{pedido}', orderText)
      .replace('{nombre}', customerName)
      .replace('{celular}', customerPhone)
      .replace('{barrio}', selectedNeighborhood.name)
      .replace('{direccion}', address)
      .replace('{domicilio}', `$${deliveryFee.toLocaleString('es-CO')}`)
      .replace('{metodo_pago}', paymentMethod)
      .replace('{total}', `$${cartTotal.toLocaleString('es-CO')}`)
      .replace('{tiempo_espera}', tiempoEsperaMsg ? `*Tiempo estimado:* ${tiempoEsperaMsg}` : '');

    const url = `https://wa.me/+573204449987?text=${encodeURIComponent(finalMessage)}`;
    window.open(url, '_blank');
  };

  const sendToWhatsApp = async () => {
    if (cartItems.length === 0) return;
    if (!customerName.trim()) {
      setAlertData({ isOpen: true, title: 'Datos Incompletos', message: "Por favor, ingresa el nombre de quien recibe el pedido.", onConfirm: null });
      return;
    }
    if (!customerPhone.trim()) {
      setAlertData({ isOpen: true, title: 'Datos Incompletos', message: "Por favor, ingresa tu número de celular.", onConfirm: null });
      return;
    }
    if (!selectedNeighborhood) {
      setAlertData({ isOpen: true, title: 'Datos Incompletos', message: "Por favor, selecciona tu barrio de la lista para calcular el costo del domicilio antes de hacer el pedido.", onConfirm: null });
      return;
    }
    if (!address.trim()) {
      setAlertData({ isOpen: true, title: 'Datos Incompletos', message: "Por favor, escribe tu dirección exacta para poder entregar tu pedido sin inconvenientes.", onConfirm: null });
      return;
    }

    const settings = await getSettings();

    if (settings.preOrderAlert && settings.preOrderAlert.active) {
      const isAllowed = settings.preOrderAlert.allowContinue;
      const profile = isAllowed
        ? (settings.delayAlert || settings.preOrderAlert)
        : (settings.closedAlert || settings.preOrderAlert);

      setAlertData({
        isOpen: true,
        title: profile.title || 'Información',
        message: profile.message,
        onConfirm: isAllowed ? () => executeWhatsAppOrder(settings) : null,
        confirmText: 'Aceptar y Continuar',
        cancelText: isAllowed ? 'Volver' : 'Entendido'
      });
    } else {
      setAlertData({
        isOpen: true,
        title: settings.normalAlert?.title || 'Confirmación de Pedido',
        message: settings.normalAlert?.message || 'Tu pedido tardará de 25 a 35 minutos aproximadamente.',
        onConfirm: () => executeWhatsAppOrder(settings),
        confirmText: 'Aceptar',
        cancelText: 'Volver'
      });
    }
  };

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
                    <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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

                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.2rem 0' }}>
                            ${item.price.toLocaleString('es-CO')}
                          </p>

                          <button
                            onClick={() => {
                              setAlertData({
                                isOpen: true,
                                title: 'Eliminar Producto',
                                message: `¿Estás seguro que deseas eliminar "${item.name}" de tu pedido?`,
                                onConfirm: () => {
                                  removeFromCart(item.id);
                                  setAlertData(prev => ({ ...prev, isOpen: false }));
                                },
                                confirmText: 'Eliminar',
                                cancelText: 'Atrás'
                              });
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--accent-pink)',
                              fontSize: '0.8rem',
                              padding: 0,
                              cursor: 'pointer',
                              marginTop: '2px'
                            }}
                          >
                            Eliminar
                          </button>
                        </div>

                        {/* CONTROLES */}
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '30px', padding: '4px 8px' }}>
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            style={{ background: 'transparent', border: 'none', color: 'white', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem' }}
                          >−</button>
                          <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            style={{ background: 'transparent', border: 'none', color: 'white', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem' }}
                          >+</button>
                        </div>
                      </div>

                      {/* NOTAS */}
                      <textarea
                        placeholder="Notas (sin cebolla, extra salsa...)"
                        value={item.comment}
                        onChange={(e) => updateComment(item.id, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: 'white',
                          fontSize: '0.8rem',
                          resize: 'none',
                          boxSizing: 'border-box',
                          height: '40px'
                        }}
                      />
                    </div>
                  ))
                )}

                {/* CHECKOUT INFO (DENTRO DEL SCROLL PARA MOVILES) */}
                {cartItems.length > 0 && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {/* NOMBRE Y CELULAR */}
                    <div>
                      <p style={{ fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                        Nombre de quien recibe <span style={{ color: 'var(--accent-pink)' }}>*</span>
                      </p>
                      <input
                        type="text"
                        placeholder="Tu nombre completo"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.7rem',
                          borderRadius: '8px',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'white',
                          fontSize: '0.85rem',
                          boxSizing: 'border-box',
                          marginBottom: '0.8rem'
                        }}
                      />

                      <p style={{ fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                        Número de celular <span style={{ color: 'var(--accent-pink)' }}>*</span>
                      </p>
                      <input
                        type="tel"
                        placeholder="Tu número de contacto"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.7rem',
                          borderRadius: '8px',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'white',
                          fontSize: '0.85rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* BARRIO DROPDOWN */}
                    <div>
                      <p style={{ fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                        Barrio de entrega <span style={{ color: 'var(--accent-pink)' }}>*</span>
                      </p>
                      <select
                        value={selectedNeighborhood ? selectedNeighborhood.id : ''}
                        onChange={(e) => {
                          const nb = neighborhoods.find(n => n.id === e.target.value);
                          setSelectedNeighborhood(nb || null);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.7rem',
                          borderRadius: '8px',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'white',
                          fontSize: '0.85rem',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="">-- Selecciona un barrio --</option>
                        {neighborhoods.map(nb => (
                          <option key={nb.id} value={nb.id}>{nb.name} (+${nb.price.toLocaleString('es-CO')})</option>
                        ))}
                      </select>
                    </div>

                    {/* DIRECCION EXACTA */}
                    <div>
                      <p style={{ fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                        Dirección exacta
                      </p>
                      <input
                        type="text"
                        placeholder="Ej: Cra 16 #34a-10, Gualanday"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.7rem',
                          borderRadius: '8px',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'white',
                          fontSize: '0.85rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* MÉTODO DE PAGO */}
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                        Método de pago
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {["Efectivo", "Transferencia", "Tarjeta"].map(method => (
                          <button
                            key={method}
                            onClick={() => setPaymentMethod(method)}
                            style={{
                              flex: 1,
                              padding: '0.6rem',
                              fontSize: '0.75rem',
                              borderRadius: '8px',
                              background: paymentMethod === method ? 'var(--accent-yellow)' : 'rgba(255,255,255,0.05)',
                              color: paymentMethod === method ? 'black' : 'white',
                              border: '1px solid rgba(255,255,255,0.1)',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer',
                              fontWeight: paymentMethod === method ? 'bold' : 'normal'
                            }}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span>Domicilio:</span>
                    <span>${deliveryFee.toLocaleString('es-CO')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    <span>Total:</span>
                    <span style={{ color: 'white' }}>${cartTotal.toLocaleString('es-CO')}</span>
                  </div>

                  <motion.button
                    onClick={sendToWhatsApp}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      boxShadow: [
                        "0px 0px 0px rgba(229,169,0,0)",
                        "0px 0px 20px rgba(229,169,0,0.4)",
                        "0px 0px 0px rgba(229,169,0,0)"
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
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
                    Confirmar Pedido
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
    </>
  );
}

export default CartSidebar;
