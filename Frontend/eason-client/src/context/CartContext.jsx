import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuthStore();
  const [cart, setCart] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const toastId = useRef(null);

  useEffect(() => {
    const savedCart = localStorage.getItem("eason_cart");
    const savedStock = localStorage.getItem("eason_stock");
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedStock) setStockMap(JSON.parse(savedStock));
  }, []);

  useEffect(() => {
    localStorage.setItem("eason_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("eason_stock", JSON.stringify(stockMap));
  }, [stockMap]);

  useEffect(() => {
    if (!user) {
      setCart([]);
      setStockMap({});
      localStorage.removeItem("eason_cart");
      localStorage.removeItem("eason_stock");
    }
  }, [user]);

  const getPriceForUser = (product) => {
    const info = product.priceInfo || {};
    const fallback = product.wholesalerPrice || product.price || 0;

    if (!user) return fallback;
    if (user.role === "retailer") return info.purchasePrice || fallback;
    if (user.role === "wholesaler") return info.sellingPrice || fallback;
    return info.finalPrice || fallback;
  };

  const addToCart = (product, quantity = 1) => {
    if (toastId.current) toast.dismiss(toastId.current);

    if (!user) {
      toast.error("Please login to add items", { duration: 4000 });
      return;
    }

    if (user.role === "wholesaler") {
      toast.error("Wholesalers cannot use retail cart yet", { duration: 5000 });
      return;
    }

    if (user.role !== "retailer") {
      toast.error("Only retailers can shop here", { duration: 4000 });
      return;
    }

    const price = getPriceForUser(product);
    if (price <= 0) {
      toast.error("Price unavailable for your role", { duration: 4000 });
      return;
    }

    const currentStock = stockMap[product._id] ?? product.stock ?? 0;
    const alreadyInCart = cart.find(i => i._id === product._id)?.quantity || 0;
    const requested = alreadyInCart + quantity;

    if (requested > currentStock) {
      toast.error(`Only ${currentStock} available (${alreadyInCart} in cart)`, { duration: 4500 });
      return;
    }

    setCart(prev => {
      const existing = prev.find(i => i._id === product._id);
      const msg = existing ? `Updated ${product.name}` : `Added ${product.name}`;
      toastId.current = toast.success(msg, { duration: 2800 });

      if (existing) {
        return prev.map(i =>
          i._id === product._id
            ? { ...i, quantity: i.quantity + quantity, total: price * (i.quantity + quantity) }
            : i
        );
      }
      return [...prev, { ...product, quantity, pricePerUnit: price, total: price * quantity }];
    });

    setStockMap(prev => ({
      ...prev,
      [product._id]: currentStock - quantity,
    }));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) return removeFromCart(id);

    const item = cart.find(i => i._id === id);
    if (!item) return;

    const origStock = item.stock ?? 9999;
    const avail = stockMap[id] ?? origStock;
    const currInCart = cart.filter(i => i._id === id).reduce((s, i) => s + i.quantity, 0);
    const newTotal = currInCart - item.quantity + newQuantity;

    if (newTotal > origStock) {
      toast.error(`Cannot exceed stock (${origStock})`, { duration: 4000 });
      return;
    }

    setCart(prev =>
      prev.map(i =>
        i._id === id ? { ...i, quantity: newQuantity, total: i.pricePerUnit * newQuantity } : i
      )
    );

    setStockMap(prev => ({ ...prev, [id]: origStock - newTotal }));
  };

  const removeFromCart = (id) => {
    const item = cart.find(i => i._id === id);
    if (!item) return;

    toastId.current = toast.success(`Removed ${item.name}`, { duration: 2200 });

    const origStock = item.stock ?? 9999;
    const wasQty = item.quantity;

    setCart(prev => prev.filter(i => i._id !== id));
    setStockMap(prev => ({ ...prev, [id]: (prev[id] ?? origStock) + wasQty }));
  };

  const clearCart = () => {
    cart.forEach(item => {
      setStockMap(prev => ({ ...prev, [item._id]: item.stock ?? 9999 }));
    });
    setCart([]);
    toast.success("Cart cleared");
  };

  const getAvailableStock = (id, orig) => stockMap[id] ?? orig ?? 0;

  const cartTotal = cart.reduce((sum, i) => sum + (i.total || 0), 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

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
        getAvailableStock,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};