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
  const { user, loading: authLoading, isAuthenticated } = useAuthStore();
  const [cart, setCart] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const toastId = useRef(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("eason_cart");
    const savedStock = localStorage.getItem("eason_stock");
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedStock) setStockMap(JSON.parse(savedStock));
  }, []);

  // Save cart whenever it changes
  useEffect(() => {
    localStorage.setItem("eason_cart", JSON.stringify(cart));
  }, [cart]);

  // Save stock map whenever it changes
  useEffect(() => {
    localStorage.setItem("eason_stock", JSON.stringify(stockMap));
  }, [stockMap]);

  // Clear cart ONLY on explicit logout (after auth loading finished)
  useEffect(() => {
    if (!authLoading && user === null && !isAuthenticated) {
      console.log("[Cart] Explicit logout detected → clearing cart");
      setCart([]);
      setStockMap({});
      localStorage.removeItem("eason_cart");
      localStorage.removeItem("eason_stock");
    }
  }, [user, authLoading, isAuthenticated]);

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
      toast.error("Please login to add items to cart", { duration: 4000 });
      return;
    }

    if (user.role === "wholesaler") {
      toast.error("Wholesalers cannot add items to the retail cart at this time", {
        duration: 5000,
      });
      return;
    }

    if (user.role !== "retailer") {
      toast.error("Only retailers can shop in the marketplace right now", {
        duration: 4000,
      });
      return;
    }

    const price = getPriceForUser(product);
    if (price <= 0) {
      toast.error("Price not available for your role", { duration: 4000 });
      return;
    }

    const currentStock = stockMap[product._id] ?? product.stock ?? 0;
    const alreadyInCart = cart.find((item) => item._id === product._id)?.quantity || 0;
    const requestedTotal = alreadyInCart + quantity;

    if (requestedTotal > currentStock) {
      toast.error(
        `Only ${currentStock} available! (${alreadyInCart} already in cart)`,
        { duration: 4500 }
      );
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      let message = existing
        ? `Updated: ${product.name} × ${quantity}`
        : `Added: ${product.name}`;

      toastId.current = toast.success(message, { duration: 2800 });

      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                total: price * (item.quantity + quantity),
              }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          quantity,
          pricePerUnit: price,
          total: price * quantity,
        },
      ];
    });

    setStockMap((prev) => ({
      ...prev,
      [product._id]: currentStock - quantity,
    }));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    const item = cart.find((i) => i._id === id);
    if (!item) return;

    const originalStock = item.stock ?? 9999;
    const currentAvailable = stockMap[id] ?? originalStock;
    const currentInCart = cart
      .filter((i) => i._id === id)
      .reduce((sum, i) => sum + i.quantity, 0);

    const newTotalInCart = currentInCart - item.quantity + newQuantity;

    if (newTotalInCart > originalStock) {
      toast.error(`Cannot exceed available stock (${originalStock})`, {
        duration: 4000,
      });
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item._id === id
          ? {
              ...item,
              quantity: newQuantity,
              total: item.pricePerUnit * newQuantity,
            }
          : item
      )
    );

    setStockMap((prev) => ({
      ...prev,
      [id]: originalStock - newTotalInCart,
    }));
  };

  const removeFromCart = (id) => {
    const item = cart.find((i) => i._id === id);
    if (!item) return;

    toastId.current = toast.success(`Removed: ${item.name}`, {
      duration: 2200,
    });

    const originalStock = item.stock ?? 9999;
    const wasInCart = item.quantity;

    setCart((prev) => prev.filter((i) => i._id !== id));

    setStockMap((prev) => ({
      ...prev,
      [id]: (prev[id] ?? originalStock) + wasInCart,
    }));
  };

  const clearCart = () => {
    cart.forEach((item) => {
      setStockMap((prev) => ({
        ...prev,
        [item._id]: item.stock ?? 9999,
      }));
    });
    setCart([]);
    toast.success("Cart cleared", { duration: 2000 });
  };

  const getAvailableStock = (productId, originalStock) => {
    return stockMap[productId] ?? originalStock ?? 0;
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.total || 0), 0);
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
        getAvailableStock,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};