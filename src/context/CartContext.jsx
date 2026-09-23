import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMenuItems } from '../services/db';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);

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
            // Actualizar precio y nombre con los datos reales. Si está agotado, lo quitamos.
            if (dbItem && !dbItem.isOutofStock) {
              return { ...cartItem, price: dbItem.price, name: dbItem.name };
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

  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, comment: '' }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id, change) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0)); 
  };

  const updateComment = (id, comment) => {
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, comment } : item));
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
