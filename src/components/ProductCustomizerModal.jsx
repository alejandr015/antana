import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useHardwareBack } from '../hooks/useHardwareBack';
import { getSettings } from '../services/db';
import AlertModal from './AlertModal';
import { useBranding } from '../hooks/useBranding';
import { SAUCE_PREFERENCE_OPTIONS, getRecommendationTitleForCategory, parseRecommendations, buildFinalComment, sanitizeInputText } from '../utils/orderUtils';

function ProductCustomizerModal({ isOpen, product, onClose, onAddToCart, allMenuItems, initialStep = 'info', initialQuantity = 1, initialExtras = [], initialComment = '' }) {
  const branding = useBranding();
  const [step, setStep] = useState(initialStep); 
  const [activeTab, setActiveTab] = useState('ingredientes'); 
  
  const [quantity, setQuantity] = useState(initialQuantity);
  const [selectedRecommendations, setSelectedRecommendations] = useState([]);
  const [recommendationsMap, setRecommendationsMap] = useState({});
  const [comment, setComment] = useState(initialComment);
  const [selectedExtras, setSelectedExtras] = useState(initialExtras);
  const [activeProduct, setActiveProduct] = useState(product);
  const [isTransforming, setIsTransforming] = useState(false);
  const [alertData, setAlertData] = useState({ isOpen: false, title: '', message: '', onConfirm: null, confirmText: '', cancelText: '' });
  const [hasConfirmedLargeOrder, setHasConfirmedLargeOrder] = useState(false);
  const [confirmedExtras, setConfirmedExtras] = useState({});
  const [confirmedFreeSauces, setConfirmedFreeSauces] = useState({});
  const [categoryLimits, setCategoryLimits] = useState({});

  // Cerrar el modal con el botón de atrás del celular
  useHardwareBack(isOpen, onClose, 'productModal');

  useEffect(() => {
    const loadSettings = async () => {
      const s = await getSettings();
      if (s) {
        if (s.categoryLimits) setCategoryLimits(s.categoryLimits);
        if (s.productRecommendations) setRecommendationsMap(s.productRecommendations);
      }
    };
    loadSettings();
    window.addEventListener('settingsUpdated', loadSettings);
    return () => window.removeEventListener('settingsUpdated', loadSettings);
  }, [isOpen]);

  useEffect(() => {
    if (product) setActiveProduct(product);
  }, [product]);

  const currentProduct = product || activeProduct;

  // Determine tabs and available categories based on product type
  let tabs = [];
  let extrasCategories = {};

  if (currentProduct) {
    if (currentProduct.category === 'Bebidas') {
      tabs = [{ id: 'opciones_bebidas', label: '+ Opciones' }];
      extrasCategories = {
        'opciones_bebidas': 'Extras - Opciones Bebidas'
      };
    } else if (currentProduct.category === 'Hamburguesas') {
      tabs = [
        { id: 'ingredientes', label: '+ Ingredientes' },
        { id: 'salsas', label: '+ Salsas' }
      ];
      extrasCategories = {
        'ingredientes': 'Extras - Ingredientes Hamburguesas',
        'salsas': 'Extras - Salsas'
      };
    } else if (currentProduct.category === 'Perros Calientes') {
      tabs = [
        { id: 'ingredientes', label: '+ Ingredientes' },
        { id: 'salsas', label: '+ Salsas' }
      ];
      extrasCategories = {
        'ingredientes': 'Extras - Ingredientes Perros',
        'salsas': 'Extras - Salsas'
      };
    } else if (currentProduct.category === 'Salchipapas') {
      tabs = [
        { id: 'ingredientes', label: '+ Ingredientes' },
        { id: 'salsas', label: '+ Salsas' }
      ];
      extrasCategories = {
        'ingredientes': 'Extras - Ingredientes Salchipapas',
        'salsas': 'Extras - Salsas'
      };
    } else {
      // Default fallback
      tabs = [
        { id: 'ingredientes', label: '+ Ingredientes' },
        { id: 'salsas', label: '+ Salsas' }
      ];
      extrasCategories = {
        'ingredientes': 'Extras - Ingredientes',
        'salsas': 'Extras - Salsas'
      };
    }
  }

  const currentRecommendations = currentProduct
    ? (recommendationsMap[currentProduct.category] ?? (currentProduct.category !== 'Bebidas' ? SAUCE_PREFERENCE_OPTIONS : []))
    : [];

  // Effect to reset state when opened, including setting the correct active tab
  useEffect(() => {
    if (isOpen) {
      const availableRecs = currentProduct
        ? (recommendationsMap[currentProduct.category] ?? (currentProduct.category !== 'Bebidas' ? SAUCE_PREFERENCE_OPTIONS : []))
        : SAUCE_PREFERENCE_OPTIONS;
      const parsed = parseRecommendations(initialComment, availableRecs);
      setStep(initialStep);
      setActiveTab(tabs[0]?.id || 'ingredientes');
      setQuantity(initialQuantity);
      setSelectedRecommendations(parsed.selectedRecommendations);
      setComment(parsed.customComment);
      setSelectedExtras(initialExtras);
      setIsTransforming(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!currentProduct) return null;

  // Get extras for current tab
  const currentCategoryStr = extrasCategories[activeTab];
  let currentExtrasList = allMenuItems.filter(item => item.category === currentCategoryStr && !item.isOutofStock);

  // Inyectar "Sin hielo" automáticamente para las bebidas
  if (activeTab === 'opciones_bebidas') {
    const hasSinHielo = currentExtrasList.some(e => e.name.toLowerCase() === 'sin hielo');
    if (!hasSinHielo) {
      currentExtrasList.unshift({
        id: 'default_sin_hielo',
        name: 'Sin hielo',
        price: 0,
        category: 'Extras - Opciones Bebidas'
      });
    }
  }

  const handleToggleExtra = (extra) => {
    // Si el usuario agrega una salsa en la pestaña + Salsas y tenía marcado "Sin salsas", quitamos "Sin salsas"
    if (extra.category === 'Extras - Salsas' && selectedRecommendations.includes('Sin salsas')) {
      setSelectedRecommendations(prev => prev.filter(r => r !== 'Sin salsas'));
    }
    setSelectedExtras(prev => {
      const exists = prev.find(e => e.id === extra.id);
      if (exists) {
        // Al desmarcar, reiniciamos los estados de confirmación
        setConfirmedExtras(c => { const nc = {...c}; delete nc[extra.id]; return nc; });
        setConfirmedFreeSauces(c => { const nc = {...c}; delete nc[extra.id]; return nc; });
        return prev.filter(e => e.id !== extra.id);
      }
      return [...prev, { ...extra, quantity: 1 }];
    });
  };

  const handleToggleRecommendation = (option) => {
    setSelectedRecommendations(prev => {
      const isSelected = prev.includes(option);
      if (isSelected) {
        return prev.filter(r => r !== option);
      }
      let next = [...prev, option];
      // Mantener exclusividad mutua entre "Sin salsas" y "Salsas aparte"
      if (option === 'Sin salsas') {
        next = next.filter(r => r !== 'Salsas aparte');
        setSelectedExtras(curr => curr.filter(e => e.category !== 'Extras - Salsas'));
      } else if (option === 'Salsas aparte') {
        next = next.filter(r => r !== 'Sin salsas');
      }
      return next;
    });
  };

  const handleUpdateExtraQuantity = (extra, change) => {
    const currentQ = selectedExtras.find(e => e.id === extra.id)?.quantity || 1;
    
    if (change > 0) {
      const catLimit = categoryLimits[extra.category];
      const maxLimit = (catLimit && catLimit.active) ? catLimit.limit : 999;

      if (currentQ >= maxLimit) {
        const message = `Esta es la máxima cantidad de ${extra.name} que podrás pedir por este producto.`;
          
        setAlertData({
          isOpen: true,
          title: 'Límite alcanzado',
          message: message,
          onConfirm: null,
          confirmText: '',
          cancelText: 'Entendido'
        });
        return;
      }

      // Alerta para salsas gratuitas (>2)
      if (extra.price === 0 && currentQ >= 2 && !confirmedFreeSauces[extra.id]) {
        setAlertData({
          isOpen: true,
          title: 'Cobro Adicional de Salsas',
          message: `Recuerda que solo las primeras 2 unidades de ${extra.name} son gratis. A partir de ahora, cada paquete de 2 salsas extra tendrá un costo de $1.000. ¿Deseas continuar?`,
          onConfirm: () => {
            setConfirmedFreeSauces(prev => ({ ...prev, [extra.id]: true }));
            setSelectedExtras(prev => prev.map(e => e.id === extra.id ? { ...e, quantity: currentQ + 1 } : e));
            setAlertData(prev => ({ ...prev, isOpen: false }));
          },
          confirmText: 'Sí, continuar',
          cancelText: 'Cancelar'
        });
        return;
      }
    }
    if (change < 0) {
      if (extra.price === 0 && currentQ - 1 <= 2) {
        setConfirmedFreeSauces(prev => ({ ...prev, [extra.id]: false }));
      }
    }

    setSelectedExtras(prev => prev.map(e => {
      if (e.id === extra.id) {
        const newQ = e.quantity + change;
        if (newQ > 0) return { ...e, quantity: newQ };
        return e;
      }
      return e;
    }));
  };

  const extrasTotal = selectedExtras.reduce((sum, ext) => {
    if (ext.price === 0 && ext.quantity > 2) {
      const extraPackages = Math.ceil((ext.quantity - 2) / 2);
      return sum + (extraPackages * 1000);
    }
    return sum + (ext.price * ext.quantity);
  }, 0);
  const finalPrice = currentProduct.price + extrasTotal;
  const totalPrice = finalPrice * quantity;

  const handleAddToCart = () => {
    const finalComment = buildFinalComment(
      currentRecommendations.length > 0 ? selectedRecommendations : [],
      comment
    );
    toast.success(`${quantity}x ${currentProduct.name} agregado al carrito`);
    onClose();
    onAddToCart(currentProduct, quantity, selectedExtras, finalComment);
  };

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="product-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isTransforming ? null : onClose}
        >
          <motion.div 
            className={`product-modal-card ${step === 'customize' ? 'customizer-modal-wide' : 'info-modal'}`}
            initial={{ scale: 0.9, y: 50, opacity: 0, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}
            animate={
              isTransforming 
                ? { 
                    y: 0, 
                    scale: 0.2, 
                    opacity: 1, 
                    backgroundColor: 'transparent',
                    borderColor: 'transparent',
                    backdropFilter: 'blur(0px)',
                    boxShadow: 'none',
                    color: 'transparent'
                  }
                : { scale: 1, y: 0, opacity: 1, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)', borderColor: 'var(--glass-border)', backdropFilter: 'blur(16px)' }
            }
            exit={{ opacity: 0, scale: 0 }}
            transition={isTransforming ? { duration: 0.8, ease: "easeInOut" } : { duration: 0.2, type: 'tween' }}
            onClick={(e) => e.stopPropagation()} 
            style={isTransforming ? { overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' } : {}}
          >
            {isTransforming ? (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: [0, 20, -20, 0] }}
                transition={{ duration: 0.5 }}
                style={{ 
                  width: '400px', 
                  height: '400px', 
                  position: 'relative',
                  willChange: 'transform, opacity'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '20%', left: '20%', right: '20%', bottom: '20%',
                  borderRadius: '50%',
                  background: 'var(--accent-yellow)',
                  filter: 'blur(50px)',
                  opacity: 0.6,
                  willChange: 'transform, opacity'
                }} />
                <img src="/anim_planet.png" alt="Planeta Antana" style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain', 
                  position: 'relative',
                  zIndex: 1,
                  willChange: 'transform',
                  filter: 'drop-shadow(0 0 2px var(--accent-yellow)) brightness(1.5) contrast(1.2)' 
                }} />
              </motion.div>
            ) : step === 'info' ? (
            // --- PASO 1: INFORMACIÓN DEL PRODUCTO ---
            <>
              <button className="product-modal-close-btn" onClick={onClose}>
                <X size={20} />
              </button>

              <div className="product-modal-img-container">
                <img src={currentProduct.imageUrl} alt={currentProduct.name} />
              </div>

              <div className="product-modal-details">
                <h2 className="product-modal-title">{currentProduct.name}</h2>
                <p className="product-modal-desc">{currentProduct.description}</p>
                <div className="product-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                  <span className="product-modal-price" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-yellow)' }}>${currentProduct.price.toLocaleString('es-CO')}</span>
                  <button 
                    onClick={() => setStep('customize')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--accent-yellow)', color: 'black', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem', flexShrink: 0 }}
                  >
                    <ShoppingCart size={18} /> Personalizar y Agregar
                  </button>
                </div>
              </div>
            </>
          ) : (
            // --- PASO 2: MINI MENÚ DE PERSONALIZACIÓN ---
            <div className="customizer-step-container">
              <div className="customizer-header">
                <button className="customizer-back-btn" onClick={() => setStep('info')}>
                  <ArrowLeft size={20} />
                </button>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Personaliza tu pedido</h3>
                <button className="product-modal-close-btn" onClick={onClose} style={{ position: 'relative', top: 0, right: 0 }}>
                  <X size={20} />
                </button>
              </div>

              {/* Layout como en el boceto: Imagen izq, Titulo/Desc der (con slot fijo para que al desplegarse con el cursor no empuje los botones de abajo) */}
              <div className="customizer-product-summary-slot">
                <div className="customizer-product-summary">
                  <img src={currentProduct.imageUrl} alt={currentProduct.name} className="customizer-small-img" />
                  <div className="customizer-summary-text">
                    <h2 className="customizer-small-title">{currentProduct.name}</h2>
                    <p className="customizer-small-desc">{currentProduct.description}</p>
                  </div>
                </div>
              </div>

              {/* TABS Dinámicos */}
              <div className="customizer-tabs">
                {tabs.map(tab => (
                  <button 
                    key={tab.id}
                    className={`customizer-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Lista de Extras */}
              <div className="customizer-extras-list">
                {currentExtrasList.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>
                    No hay opciones disponibles en esta categoría.
                  </p>
                ) : (
                  currentExtrasList.map(extra => {
                    const extraData = selectedExtras.find(e => e.id === extra.id);
                    const isSelected = !!extraData;
                    return (
                      <div key={extra.id} className="customizer-extra-item-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label 
                          className={`customizer-extra-item ${isSelected ? 'selected' : ''}`}
                          style={{ flex: 1, margin: 0, height: '100%' }}
                        >
                          <div className="extra-info">
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => handleToggleExtra(extra)}
                            />
                            <span className="extra-name">{extra.name}</span>
                          </div>
                          {(() => {
                            let displayPrice = extra.price;
                            if (extraData) {
                              if (extra.price === 0 && extraData.quantity > 2) {
                                displayPrice = Math.ceil((extraData.quantity - 2) / 2) * 1000;
                              } else {
                                displayPrice = extra.price * extraData.quantity;
                              }
                            }
                            return (
                              <span className="extra-price">+${displayPrice.toLocaleString('es-CO')}</span>
                            );
                          })()}
                        </label>
                        
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div 
                              initial={{ width: 0, opacity: 0, scale: 0.8 }}
                              animate={{ width: 'auto', opacity: 1, scale: 1 }}
                              exit={{ width: 0, opacity: 0, scale: 0.8 }}
                              style={{ overflow: 'hidden', flexShrink: 0 }}
                            >
                              <div className="extra-quantity-counter" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.05)', padding: '5px 8px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', height: '42px' }}>
                                <button 
                                  onClick={(e) => { e.preventDefault(); handleUpdateExtraQuantity(extra, -1); }}
                                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px' }}
                                >
                                  <Minus size={14} />
                                </button>
                                <span style={{ fontSize: '0.98rem', fontWeight: 'bold', lineHeight: '1', minWidth: '18px', textAlign: 'center' }}>{extraData.quantity}</span>
                                <button 
                                  onClick={(e) => { e.preventDefault(); handleUpdateExtraQuantity(extra, 1); }}
                                  style={{ background: 'var(--accent-yellow)', border: 'none', color: 'black', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px' }}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Recomendaciones dinámicas por categoría (Ej. Salsas aparte, Sin salsas, y las que agregue el Admin) */}
              {currentRecommendations.length > 0 && (
                <div style={{ marginTop: '0.25rem', marginBottom: '0.45rem' }}>
                  <p style={{
                    margin: '0 0 0.35rem 0',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.02em'
                  }}>
                    {getRecommendationTitleForCategory(currentProduct.category)}
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {currentRecommendations.map(option => {
                      const isActive = selectedRecommendations.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleToggleRecommendation(option)}
                          style={{
                            flex: '1 1 calc(50% - 6px)',
                            minWidth: '125px',
                            padding: '0.45rem 0.7rem',
                            borderRadius: '10px',
                            border: isActive ? '1px solid var(--accent-yellow)' : '1px solid rgba(255,255,255,0.12)',
                            background: isActive ? 'rgba(229, 169, 0, 0.18)' : 'rgba(255,255,255,0.03)',
                            color: isActive ? 'var(--accent-yellow)' : 'var(--text-secondary)',
                            fontWeight: isActive ? 'bold' : '500',
                            fontSize: '0.83rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '4px',
                            border: isActive ? '1px solid var(--accent-yellow)' : '1px solid rgba(255,255,255,0.35)',
                            background: isActive ? 'var(--accent-yellow)' : 'transparent',
                            color: 'black',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            flexShrink: 0
                          }}>
                            {isActive ? '✓' : ''}
                          </span>
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notas */}
              <div className="customizer-notes-section">
                <textarea 
                  placeholder="Instrucciones especiales (Ej. Sin cebolla)..."
                  value={comment}
                  maxLength={160}
                  onChange={(e) => setComment(sanitizeInputText(e.target.value, 160))}
                  className="customizer-textarea"
                  rows="1"
                ></textarea>
              </div>
              
              {/* Footer with Quantity & Add Button */}
              <div className="customizer-footer">
                <div className="customizer-quantity">
                  <button onClick={() => {
                    const newQ = Math.max(1, quantity - 1);
                    setQuantity(newQ);
                    const catLimit = categoryLimits[currentProduct.category];
                    const maxLimit = catLimit ? catLimit.limit : 10;
                    if (newQ <= maxLimit) {
                      setHasConfirmedLargeOrder(false);
                    }
                  }}><Minus size={16} /></button>
                  <span>{quantity}</span>
                  <button onClick={() => {
                    const catLimit = categoryLimits[currentProduct.category];
                    // Si no hay configuración para la categoría o no hay catLimit, asumimos límite 10 por defecto
                    const isActive = catLimit ? catLimit.active : true;
                    const maxLimit = catLimit ? catLimit.limit : 10;

                    if (isActive && quantity >= maxLimit && !hasConfirmedLargeOrder) {
                      setAlertData({
                        isOpen: true,
                        title: 'Aviso de Cantidad',
                        message: `¿Estás seguro que deseas ordenar más de ${maxLimit} unidades de ${currentProduct.name}?`,
                        onConfirm: () => {
                          setHasConfirmedLargeOrder(true);
                          setQuantity(quantity + 1);
                          setAlertData(prev => ({ ...prev, isOpen: false }));
                        },
                        confirmText: 'Aceptar',
                        cancelText: 'Cancelar'
                      });
                      return;
                    }
                    setQuantity(quantity + 1);
                  }}><Plus size={16} /></button>
                </div>

                <button onClick={handleAddToCart} className="customizer-add-btn">
                  <span>Agregar al carrito</span>
                  <span className="customizer-total">${totalPrice.toLocaleString('es-CO')}</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
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

export default ProductCustomizerModal;
