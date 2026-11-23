import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSettings, saveOrder } from '../services/db';
import AlertModal from './AlertModal';
import { useCart } from '../context/CartContext';
import { X } from 'lucide-react';
import { useHardwareBack } from '../hooks/useHardwareBack';
import { useSessionState } from '../hooks/useSessionState';
import {
  sanitizeInputText,
  formatStructuredDeliveryAddress,
  validateCheckoutForm,
  calculateExtrasTotal
} from '../utils/orderUtils';

function CheckoutModal({ isOpen, onClose }) {
  const { cartItems, subTotal, clearCart, setIsCartOpen } = useCart();
  const [orderType, setOrderType] = useSessionState('antana_checkout_orderType', 'delivery'); // 'delivery' | 'pickup'
  const [neighborhoodName, setNeighborhoodName] = useSessionState('antana_checkout_neighborhoodName', '');
  const [address, setAddress] = useSessionState('antana_checkout_address', '');
  const [customerName, setCustomerName] = useSessionState('antana_checkout_name', '');
  const [customerPhone, setCustomerPhone] = useSessionState('antana_checkout_phone', '');
  const [paymentMethod, setPaymentMethod] = useSessionState('antana_checkout_paymentMethod', 'Efectivo');
  const [alertData, setAlertData] = useState({ isOpen: false, title: '', message: '', onConfirm: null, confirmText: '', cancelText: '' });
  const [saveInfo, setSaveInfo] = useSessionState('antana_checkout_saveInfo', true);

  useHardwareBack(isOpen, onClose, 'checkoutModal');

  // El costo de domicilio ahora lo asigna directamente el asesor por WhatsApp según la dirección
  const deliveryFee = 0;
  const cartTotal = subTotal;

  useEffect(() => {
    if (isOpen) {
      if (!customerName && !customerPhone && !address) {
        const savedProfileStr = localStorage.getItem('antana_saved_profile');
        if (savedProfileStr) {
          try {
            const profile = JSON.parse(savedProfileStr);
            if (profile.name) setCustomerName(profile.name);
            if (profile.phone) setCustomerPhone(String(profile.phone).replace(/\D/g, '').slice(-10));

            // Compatibilidad con perfiles anteriores que guardaban conjunto/torre/apto por separado
            const savedNb = [profile.neighborhoodName, profile.complexName].filter(Boolean).join(' - ');
            if (savedNb) setNeighborhoodName(sanitizeInputText(savedNb, 80));

            const extraUnit = [profile.towerOrBlock, profile.unitNumber].filter(Boolean).join(' ');
            const savedAddr = [profile.address, extraUnit].filter(Boolean).join(', ');
            if (savedAddr) setAddress(sanitizeInputText(savedAddr, 120));
          } catch (e) {}
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const executeWhatsAppOrder = async (settings) => {
    const structured = formatStructuredDeliveryAddress({
      locationType: 'unificado',
      neighborhoodName,
      address
    });

    const fullAddress = orderType === 'delivery'
      ? structured.fullAddress
      : 'Punto de Venta Antana (Cra. 5a #21-54, Neiva)';

    const formattedNeighborhood = orderType === 'delivery'
      ? structured.formattedNeighborhood
      : 'Recoger en el local';

    const orderData = {
      customer_name: customerName,
      customer_phone: customerPhone,
      order_type: orderType,
      neighborhood: formattedNeighborhood,
      address: fullAddress,
      payment_method: paymentMethod,
      items: cartItems,
      subtotal: subTotal,
      delivery_fee: deliveryFee,
      total: cartTotal
    };

    const orderText = cartItems.map(item => {
      let line = `✅ ${item.quantity} x ${item.name.toUpperCase()}`;
      if (item.extras && item.extras.length > 0) {
        item.extras.forEach(e => {
          const q = e.quantity || 1;
          const extName = q > 1 ? `${q}x ${e.name}` : e.name;
          const extraCost = calculateExtrasTotal([e]);
          line += `\n   + ${extName}${extraCost > 0 ? ` ($${extraCost.toLocaleString('es-CO')})` : ''}`;
        });
      }
      if (item.comment) {
        line += `\n   Nota: ${item.comment}`;
      }
      line += `\n   Subtotal: $${(item.price * item.quantity).toLocaleString('es-CO')}`;
      return line;
    }).join('\n\n');

    const orderTypeTitle = orderType === 'delivery'
      ? '🛵 *TIPO: PEDIDO A DOMICILIO*'
      : '🛍️ *TIPO: RECOGER EN EL LOCAL (Cra. 5a #21-54)*';

    const isDelayActive = settings.preOrderAlert && settings.preOrderAlert.active && settings.preOrderAlert.allowContinue;
    const tiempoEsperaMsg = isDelayActive
      ? (settings.delayAlert?.message || '')
      : '';

    let finalMessage = settings.whatsappTemplate
      .replace('{pedido}', `${orderTypeTitle}\n\n${orderText}`)
      .replace('{nombre}', customerName)
      .replace('{celular}', customerPhone)
      .replace('{barrio}', formattedNeighborhood)
      .replace('{direccion}', orderType === 'delivery' ? fullAddress : 'Cra. 5a #21-54, Neiva')
      .replace('{domicilio}', orderType === 'delivery' ? 'Por confirmar según ubicación' : '$0 (Para Recoger)')
      .replace('{metodo_pago}', paymentMethod)
      .replace(
        '{total}',
        orderType === 'delivery'
          ? `$${cartTotal.toLocaleString('es-CO')} (+ domicilio por confirmar)`
          : `$${cartTotal.toLocaleString('es-CO')}`
      )
      .replace('{tiempo_espera}', tiempoEsperaMsg ? `*Aviso:* ${tiempoEsperaMsg}` : '');

    const url = `https://wa.me/+573204449987?text=${encodeURIComponent(finalMessage)}`;
    window.open(url, '_blank');

    if (saveInfo) {
      localStorage.setItem('antana_saved_profile', JSON.stringify({
        name: customerName,
        phone: customerPhone,
        neighborhoodName,
        address
      }));
    } else {
      localStorage.removeItem('antana_saved_profile');
    }

    // Guardar el pedido solo después de abrir WhatsApp y confirmar envío para evitar pedidos fantasma
    setAlertData({
      isOpen: true,
      title: '¿Enviaste tu pedido por WhatsApp?',
      message: 'Confirma cuando hayas enviado el mensaje en WhatsApp para registrar tu pedido y vaciar el carrito.',
      onConfirm: async () => {
        try {
          await saveOrder(orderData);
        } catch (e) {
          console.error("No se pudo guardar la orden en Supabase", e);
        }
        setAlertData(prev => ({ ...prev, isOpen: false }));
        clearCart();
        onClose();
        setIsCartOpen(false);
      },
      confirmText: 'Sí, ya envié el pedido',
      cancelText: 'Aún no / Volver'
    });
  };

  const sendToWhatsApp = async () => {
    if (cartItems.length === 0) return;

    const validation = validateCheckoutForm({
      customerName,
      customerPhone,
      orderType,
      locationType: 'unificado',
      neighborhoodName,
      address
    });

    if (!validation.valid) {
      setAlertData({
        isOpen: true,
        title: 'Datos Incompletos',
        message: validation.error,
        onConfirm: null
      });
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
    } else if (settings.normalAlert?.message?.trim()) {
      setAlertData({
        isOpen: true,
        title: settings.normalAlert.title || 'Confirmación de Pedido',
        message: settings.normalAlert.message,
        onConfirm: () => executeWhatsAppOrder(settings),
        confirmText: 'Entendido, enviar pedido',
        cancelText: 'Volver'
      });
    } else {
      executeWhatsAppOrder(settings);
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
            style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', maxHeight: '92vh', maxWidth: '480px', overflowY: 'auto' }}
          >
            <button className="product-modal-close-btn" onClick={onClose} aria-label="Cerrar ventana de pedido" style={{ top: '1.2rem', right: '1.2rem' }}>
              <X size={20} />
            </button>

            <h2 style={{ margin: '0 0 1.2rem 0', fontSize: '1.45rem', textAlign: 'center' }}>Detalles de tu Pedido</h2>

            {/* Selector de Modalidad: A Domicilio vs. Recoger en Local */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.2rem', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                style={{
                  flex: 1,
                  padding: '0.75rem 0.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: orderType === 'delivery' ? 'var(--accent-yellow)' : 'transparent',
                  color: orderType === 'delivery' ? 'black' : 'white',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>🛵 A Domicilio</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                style={{
                  flex: 1,
                  padding: '0.75rem 0.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: orderType === 'pickup' ? 'var(--accent-yellow)' : 'transparent',
                  color: orderType === 'pickup' ? 'black' : 'white',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>🛍️ Recoger en Local</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {/* Nombre y Celular */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <p style={{ fontSize: '0.84rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Nombre <span style={{ color: 'var(--accent-pink)' }}>*</span>
                  </p>
                  <input
                    type="text"
                    maxLength={80}
                    placeholder="Quién recibe"
                    value={customerName}
                    onChange={(e) => setCustomerName(sanitizeInputText(e.target.value, 80))}
                    className="search-input"
                    autoComplete="name"
                    style={{ padding: '0.75rem 0.9rem', width: '100%', boxSizing: 'border-box', fontSize: '0.92rem' }}
                  />
                </div>

                <div>
                  <p style={{ fontSize: '0.84rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Celular <span style={{ color: 'var(--accent-pink)' }}>*</span>
                  </p>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    placeholder="Ej: 3204449987"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="search-input"
                    autoComplete="tel-national"
                    style={{ padding: '0.75rem 0.9rem', width: '100%', boxSizing: 'border-box', fontSize: '0.92rem' }}
                  />
                </div>
              </div>

              {/* Si es para recoger, mostramos tarjeta informativa de la sede */}
              {orderType === 'pickup' ? (
                <div style={{ background: 'rgba(229,169,0,0.08)', border: '1px solid var(--accent-yellow)', borderRadius: '12px', padding: '1.1rem', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 0.3rem 0', fontWeight: 'bold', color: 'var(--accent-yellow)', fontSize: '1rem' }}>
                    📍 Retiro en el Punto de Venta
                  </p>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'white', fontWeight: 500 }}>
                    Cra. 5a #21-54, Neiva (Antana Hamburguesería)
                  </p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Te avisaremos por WhatsApp en cuanto tu pedido esté empacado y listo para retirar.
                  </p>
                </div>
              ) : (
                /* Si es a domicilio: Formulario Ultra-Rápido (Opción A) */
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}
                >
                  {/* 1. Barrio o Conjunto */}
                  <div>
                    <p style={{ fontSize: '0.84rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                      Barrio o Conjunto <span style={{ color: 'var(--accent-pink)' }}>*</span>
                    </p>
                    <input
                      type="text"
                      maxLength={80}
                      placeholder="Ej: Las Granjas, Conjunto Ipanema, El Vergel..."
                      value={neighborhoodName}
                      onChange={(e) => setNeighborhoodName(sanitizeInputText(e.target.value, 80))}
                      className="search-input"
                      style={{ padding: '0.75rem 0.9rem', width: '100%', boxSizing: 'border-box', fontSize: '0.92rem' }}
                    />
                  </div>

                  {/* 2. Dirección exacta o Torre y Apto */}
                  <div>
                    <p style={{ fontSize: '0.84rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                      Dirección exacta o Torre y Apto <span style={{ color: 'var(--accent-pink)' }}>*</span>
                    </p>
                    <input
                      type="text"
                      maxLength={120}
                      placeholder="Ej: Cra 16 # 34a - 10, Torre 3 Apto 402"
                      value={address}
                      onChange={(e) => setAddress(sanitizeInputText(e.target.value, 120))}
                      className="search-input"
                      autoComplete="street-address"
                      style={{ padding: '0.75rem 0.9rem', width: '100%', boxSizing: 'border-box', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>
              )}

              <div>
                <p style={{ fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Método de pago
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Efectivo', 'Transferencia'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        fontSize: '0.85rem',
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

            <div style={{ marginTop: '1.3rem', paddingTop: '1.1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal productos:</span>
                <span>${subTotal.toLocaleString('es-CO')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                <span>{orderType === 'delivery' ? 'Domicilio:' : 'Modalidad de entrega:'}</span>
                <span style={{ color: orderType === 'pickup' ? 'var(--accent-cyan)' : 'var(--accent-yellow)', fontWeight: '600', fontSize: '0.88rem' }}>
                  {orderType === 'delivery' ? 'Por confirmar en WhatsApp' : 'Gratis (Recoger en local)'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: orderType === 'delivery' ? '0.4rem' : '1.1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                <span>{orderType === 'delivery' ? 'Total productos:' : 'Total:'}</span>
                <span style={{ color: 'var(--accent-yellow)' }}>${cartTotal.toLocaleString('es-CO')}</span>
              </div>

              {orderType === 'delivery' && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0', background: 'rgba(229, 169, 0, 0.08)', border: '1px solid rgba(229, 169, 0, 0.25)', padding: '0.55rem 0.75rem', borderRadius: '8px', lineHeight: 1.35 }}>
                  🛵 Un asesor revisará tu dirección en WhatsApp y te confirmará el valor del domicilio según tu ubicación.
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', cursor: 'pointer' }} onClick={() => setSaveInfo(!saveInfo)}>
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
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Recordar mis datos para el próximo pedido</span>
              </div>

              <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', margin: '0 0 0.9rem 0', lineHeight: 1.35 }}>
                🔒 Tus datos personales se usan únicamente para gestionar y entregar tu pedido (Ley 1581 de 2012 / ISO 27701).
              </p>

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
