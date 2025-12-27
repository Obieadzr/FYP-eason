// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [stockMap, setStockMap] = useState({}); // { productId: availableStock }
  const toastId = useRef(null);

  // Load cart & stock from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("eason_cart");
    const savedStock = localStorage.getItem("eason_stock");

    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedStock) setStockMap(JSON.parse(savedStock));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("eason_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("eason_stock", JSON.stringify(stockMap));
  }, [stockMap]);

  const addToCart = (product, quantity = 1) => {
    if (toastId.current) toast.dismiss(toastId.current);

    const productId = product._id;
    const currentStock = stockMap[productId] ?? product.stock; // fallback to original
    const requestedTotal = cart.find(item => item._id === productId)?.quantity || 0 + quantity;

    if (requestedTotal > currentStock) {
      toastId.current = toast.error(`Only ${currentStock} in stock!`, { duration: 3000 });
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item._id === productId);
      let message;

      if (existing) {
        message = `Increased quantity: ${product.name}`;
      } else {
        message = `${product.name} added to cart!`;
      }

      toastId.current = toast.success(message, { duration: 2500 });

      if (existing) {
        return prev.map(item =>
          item._id === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });

    // Reduce available stock
    setStockMap(prev => ({
      ...prev,
      [productId]: currentStock - quantity
    }));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    const item = cart.find(i => i._id === id);
    const originalStock = item.stock; // original from DB
    const currentAvailable = stockMap[id] ?? originalStock;
    const inCart = cart.reduce((sum, i) => i._id === id ? sum + i.quantity : sum, 0);
    const newInCart = inCart - item.quantity + quantity;

    if (newInCart > originalStock) {
      toast.error(`Cannot exceed original stock of ${originalStock}`, { duration: 3000 });
      return;
    }

    setCart(prev =>
      prev.map(item => (item._id === id ? { ...item, quantity } : item))
    );

    // Update available stock
    setStockMap(prev => ({
      ...prev,
      [id]: originalStock - newInCart
    }));
  };

  const removeFromCart = (id) => {
    const item = cart.find(i => i._id === id);
    if (item) {
      if (toastId.current) toast.dismiss(toastId.current);
      toastId.current = toast.success(`${item.name} removed`, { duration: 2000 });

      const originalStock = item.stock;
      const wasInCart = item.quantity;

      setCart(prev => prev.filter(i => i._id !== id));

      // Restore stock
      setStockMap(prev => ({
        ...prev,
        [id]: (prev[id] ?? originalStock) + wasInCart
      }));
    }
  };

  const clearCart = () => {
    // Restore all stock
    cart.forEach(item => {
      setStockMap(prev => ({
        ...prev,
        [item._id]: item.stock // fully restore
      }));
    });

    setCart([]);
    toast.success("Cart cleared");
  };

  const getAvailableStock = (productId, originalStock) => {
    return stockMap[productId] ?? originalStock;
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        getAvailableStock, // ← Expose this
      }}
    >
      {children}
    </CartContext.Provider>
  );
};