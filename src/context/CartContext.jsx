import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMenuItems } from '../services/db';
import { useSessionState } from '../hooks/useSessionState';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useSessionState('antana_isCartOpen', false);
  const [selectedNeighborhood, setSelectedNeighborhood] = useSessionState('antana_selectedNeighborhood', null);

  // Cargar y sincronizar precios desde la base de datos real
  useEffect(() => {
    const syncCart = async () => {
      const saved = localStorage.getItem('antana_cart');
      if (saved) {
        let parsedCart = JSON.parse(saved);
        if (parsedCart.length > 0) {
          const dbItems = await getMenuItems();
          parsedCart = parsedCart.map(cartItem => {
            const dbItem = dbItems.find(i => i.id === cartItem.id);
            // Actualizar precio base con los datos reales. Si está agotado, lo quitamos.
            if (dbItem && !dbItem.isOutofStock) {
              const extrasTotal = (cartItem.extras || []).reduce((sum, ext) => {
                if (ext.price === 0 && ext.quantity > 2) {
                  return sum + (Math.ceil((ext.quantity - 2) / 2) * 1000);
                }
                return sum + (ext.price * (ext.quantity || 1));
              }, 0);
              return { ...cartItem, price: dbItem.price + extrasTotal, name: dbItem.name };
            }
            return null; // El producto ya no existe o está agotado
          }).filter(item => item !== null);
          setCartItems(parsedCart);
        }
      }
    };
    syncCart();
  }, []);

  useEffect(() => {
    localStorage.setItem('antana_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item, quantity = 1, extras = [], comment = '') => {
    // Generar un ID único para esta línea del carrito
    const cartItemId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    
    // Calcular el precio total con extras
    const extrasTotal = extras.reduce((sum, ext) => {
      if (ext.price === 0 && ext.quantity > 2) {
        return sum + (Math.ceil((ext.quantity - 2) / 2) * 1000);
      }
      return sum + (ext.price * (ext.quantity || 1));
    }, 0);
    const finalPrice = item.price + extrasTotal;

    setCartItems(prev => [
      ...prev, 
      { ...item, cartItemId, quantity, extras, comment, price: finalPrice }
    ]);
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prev => prev.filter(i => i.cartItemId !== cartItemId));
  };

  const updateCartItemFull = (cartItemId, quantity, extras, comment, basePrice) => {
    setCartItems(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const extrasTotal = extras.reduce((sum, ext) => sum + (ext.price * (ext.quantity || 1)), 0);
        const finalPrice = basePrice + extrasTotal;
        return { ...item, quantity, extras, comment, price: finalPrice };
      }
      return item;
    }));
  };

  const updateQuantity = (cartItemId, change) => {
    setCartItems(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0)); 
  };

  const updateComment = (cartItemId, comment) => {
    setCartItems(prev => prev.map(item => item.cartItemId === cartItemId ? { ...item, comment } : item));
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedNeighborhood(null);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const subTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = selectedNeighborhood ? selectedNeighborhood.price : 0;
  const cartTotal = subTotal + deliveryFee;
  
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateCartItemFull,
      updateQuantity,
      updateComment,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      toggleCart,
      cartTotal,
      subTotal,
      deliveryFee,
      cartCount,
      selectedNeighborhood,
      setSelectedNeighborhood
    }}>
      {children}
    </CartContext.Provider>
  );
};
