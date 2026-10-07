import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNeighborhoods, getSettings, saveOrder } from '../services/db';
import AlertModal from './AlertModal';
import { useCart } from '../context/CartContext';
import { X, ChevronDown, Search as SearchIcon } from 'lucide-react';
import { useHardwareBack } from '../hooks/useHardwareBack';
import { useSessionState } from '../hooks/useSessionState';

function CheckoutModal({ isOpen, onClose }) {
  const { cartItems, subTotal, clearCart, setIsCartOpen } = useCart();
  const [address, setAddress] = useSessionState('antana_checkout_address', "");
  const [customerName, setCustomerName] = useSessionState('antana_checkout_name', "");
  const [customerPhone, setCustomerPhone] = useSessionState('antana_checkout_phone', "");
  const [paymentMethod, setPaymentMethod] = useSessionState('antana_checkout_paymentMethod', "Efectivo");
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useSessionState('antana_checkout_selectedNeighborhood', null);
  const [alertData, setAlertData] = useState({ isOpen: false, title: '', message: '', onConfirm: null, confirmText: '', cancelText: '' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [nbSearchTerm, setNbSearchTerm] = useState('');
  const [saveInfo, setSaveInfo] = useSessionState('antana_checkout_saveInfo', true);
  
  useHardwareBack(isOpen, onClose, 'checkoutModal');
  
  const deliveryFee = selectedNeighborhood ? selectedNeighborhood.price : 0;
  const cartTotal = subTotal + deliveryFee;

  useEffect(() => {
    if (isOpen) {
      const loadNb = async () => {
        setNeighborhoods(await getNeighborhoods());
      };
      loadNb();

      // Cargar info guardada si los campos están vacíos
      if (!customerName && !customerPhone && !address) {
        const savedProfileStr = localStorage.getItem('antana_saved_profile');
        if (savedProfileStr) {
          try {
            const profile = JSON.parse(savedProfileStr);
            if (profile.name) setCustomerName(profile.name);
            if (profile.phone) setCustomerPhone(profile.phone);
            if (profile.address) setAddress(profile.address);
          } catch(e) {}
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const executeWhatsAppOrder = async (settings) => {
    const orderData = {
      customer_name: customerName,
      customer_phone: customerPhone,
      neighborhood: selectedNeighborhood.name,
      address: address,
      payment_method: paymentMethod,
      items: cartItems,
      subtotal: subTotal,
      delivery_fee: deliveryFee,
      total: cartTotal
    };

    try {
      await saveOrder(orderData);
    } catch (e) {
      console.error("No se pudo guardar la orden en Supabase", e);
    }

    const orderText = cartItems.map(item => {
      let line = `✅ ${item.quantity} x ${item.name.toUpperCase()}`;
      if (item.extras && item.extras.length > 0) {
        item.extras.forEach(e => {
          const q = e.quantity || 1;
          const extName = q > 1 ? `${q}x ${e.name}` : e.name;
          line += `\n   + ${extName}${e.price > 0 ? ` ($${(e.price * q).toLocaleString('es-CO')})` : ''}`;
        });
      }
      if (item.comment) {
        line += `\n   Nota: ${item.comment}`;
      }
      line += `\n   Subtotal: $${(item.price * item.quantity).toLocaleString('es-CO')}`;
      return line;
    }).join('\n\n');

    const isDelayActive = settings.preOrderAlert && settings.preOrderAlert.active && settings.preOrderAlert.allowContinue;
    const tiempoEsperaMsg = isDelayActive
      ? (settings.delayAlert?.message || '')
      : (settings.normalAlert?.message || '');

    let finalMessage = settings.whatsappTemplate
      .replace('{pedido}', orderText)
      .replace('{nombre}', customerName)
      .replace('{celular}', customerPhone)
      .replace('{barrio}', selectedNeighborhood.name)
      .replace('{direccion}', selectedNeighborhood.isRestricted ? `📍 PUNTO DE ENCUENTRO: ${address}` : address)
      .replace('{domicilio}', `$${deliveryFee.toLocaleString('es-CO')}`)
      .replace('{metodo_pago}', paymentMethod)
      .replace('{total}', `$${cartTotal.toLocaleString('es-CO')}`)
      .replace('{tiempo_espera}', tiempoEsperaMsg ? `*Tiempo estimado:* ${tiempoEsperaMsg}` : '');

    const url = `https://wa.me/+573204449987?text=${encodeURIComponent(finalMessage)}`;
    window.open(url, '_blank');
    
    if (saveInfo) {
      localStorage.setItem('antana_saved_profile', JSON.stringify({
        name: customerName,
        phone: customerPhone,
        address: address
      }));
    } else {
      localStorage.removeItem('antana_saved_profile');
    }

    clearCart();
    onClose();
    setIsCartOpen(false);
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

  const handleSelectNeighborhood = (nb) => {
    setIsDropdownOpen(false);
    
    if (nb.isRestricted) {
      const defaultMsg = `El barrio ${nb.name} es una zona de acceso limitado. Nuestro domiciliario solo podrá entregar tu pedido en el punto de encuentro: ${nb.meetingPointName} (${nb.meetingPointAddress}). ¿Aceptas recoger tu pedido en este punto?`;
      const msg = nb.customAlertMessage || defaultMsg;
      
      setAlertData({
        isOpen: true,
        title: '⚠️ Zona de Acceso Restringido',
        message: msg,
        onConfirm: () => {
          setSelectedNeighborhood(nb);
          setAddress(`${nb.meetingPointName} - ${nb.meetingPointAddress}`);
          setPaymentMethod('Transferencia');
          setAlertData(prev => ({ ...prev, isOpen: false }));
        },
        confirmText: 'Sí, acepto recoger allí',
        cancelText: 'Cancelar'
      });
    } else {
      setSelectedNeighborhood(nb);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div 
          className="product-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ zIndex: 1000 }}
        >
          <motion.div 
            className="product-modal-card"
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            onClick={(e) => e.stopPropagation()} 
            style={{ padding: '2rem', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <button className="product-modal-close-btn" onClick={onClose} style={{ top: '1.5rem', right: '1.5rem' }}>
              <X size={20} />
            </button>

            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', textAlign: 'center' }}>Detalles de Entrega</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Nombre <span style={{ color: 'var(--accent-pink)' }}>*</span>
                </p>
                <input
                  type="text"
                  placeholder="Tu nombre completo"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="search-input"
                  autoComplete="name"
                  style={{ padding: '0.8rem 1rem', width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Celular <span style={{ color: 'var(--accent-pink)' }}>*</span>
                </p>
                <input
                  type="tel"
                  placeholder="Tu número de contacto"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="search-input"
                  autoComplete="tel"
                  style={{ padding: '0.8rem 1rem', width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Barrio <span style={{ color: 'var(--accent-pink)' }}>*</span>
                </p>
                <div style={{ position: 'relative' }}>
                  <div 
                    className="search-input" 
                    style={{ padding: '0.8rem 1rem', width: '100%', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span style={{ color: selectedNeighborhood ? 'white' : 'var(--text-secondary)' }}>
                      {selectedNeighborhood ? `${selectedNeighborhood.name} (+${selectedNeighborhood.price.toLocaleString('es-CO')})` : '-- Selecciona un barrio --'}
                    </span>
                    <ChevronDown size={18} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
                  </div>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: 'var(--bg-secondary)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          marginTop: '8px',
                          maxHeight: '250px',
                          overflowY: 'auto',
                          zIndex: 10,
                          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                        }}
                      >
                        <div style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', padding: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)', zIndex: 11 }}>
                          <div style={{ position: 'relative' }}>
                            <SearchIcon size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                              type="text"
                              placeholder="Escribe para buscar..."
                              value={nbSearchTerm}
                              onChange={(e) => setNbSearchTerm(e.target.value)}
                              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', boxSizing: 'border-box' }}
                              autoFocus
                            />
                          </div>
                        </div>
                        {neighborhoods.filter(nb => nb.name.toLowerCase().includes(nbSearchTerm.toLowerCase())).map(nb => (
                          <div
                            key={nb.id}
                            onClick={() => {
                              handleSelectNeighborhood(nb);
                              setNbSearchTerm('');
                            }}
                            style={{
                              padding: '1rem',
                              borderBottom: '1px solid rgba(255,255,255,0.05)',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              color: selectedNeighborhood?.id === nb.id ? 'var(--accent-yellow)' : 'white',
                              background: selectedNeighborhood?.id === nb.id ? 'rgba(255,255,255,0.05)' : 'transparent'
                            }}
                          >
                            <span>{nb.name}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>+${nb.price.toLocaleString('es-CO')}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Dirección exacta
                </p>
                <input
                  type="text"
                  placeholder="Ej: Cra 16 #34a-10, Gualanday"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="search-input"
                  autoComplete="street-address"
                  style={{ padding: '0.8rem 1rem', width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Método de pago
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {["Efectivo", "Transferencia", "Tarjeta"].map(method => {
                    const isDisabled = selectedNeighborhood?.isRestricted && method !== "Transferencia";
                    return (
                    <button
                      key={method}
                      onClick={() => !isDisabled && setPaymentMethod(method)}
                      disabled={isDisabled}
                      style={{
                        flex: 1,
                        padding: '0.8rem',
                        fontSize: '0.85rem',
                        borderRadius: '8px',
                        background: paymentMethod === method ? 'var(--accent-yellow)' : 'rgba(255,255,255,0.05)',
                        color: paymentMethod === method ? 'black' : (isDisabled ? 'rgba(255,255,255,0.3)' : 'white'),
                        border: '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.2s ease',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        fontWeight: paymentMethod === method ? 'bold' : 'normal',
                        opacity: isDisabled ? 0.5 : 1
                      }}
                    >
                      {method}
                    </button>
                  )})}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal:</span>
                <span>${subTotal.toLocaleString('es-CO')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>
                <span>Domicilio:</span>
                <span>${deliveryFee.toLocaleString('es-CO')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span style={{ color: 'var(--accent-yellow)' }}>${cartTotal.toLocaleString('es-CO')}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }} onClick={() => setSaveInfo(!saveInfo)}>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '4px', 
                  border: `2px solid ${saveInfo ? 'var(--accent-yellow)' : 'rgba(255,255,255,0.3)'}`,
                  background: saveInfo ? 'var(--accent-yellow)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: '0.2s'
                }}>
                  {saveInfo && <span style={{ color: 'black', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Recordar mis datos para el próximo pedido</span>
              </div>

              <motion.button
                onClick={sendToWhatsApp}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                animate={{ boxShadow: ["0px 0px 0px rgba(229,169,0,0)", "0px 0px 15px rgba(229,169,0,0.4)", "0px 0px 0px rgba(229,169,0,0)"] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="customizer-add-btn"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Enviar Pedido por WhatsApp
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
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

export default CheckoutModal;
