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

  const getTieredPriceForUser = (product, quantity) => {
    let price = getPriceForUser(product);
    if (user?.role === "retailer" && product.bulkPricing && product.bulkPricing.length > 0) {
      const sortedTiers = [...product.bulkPricing].sort((a, b) => b.minQuantity - a.minQuantity);
      for (const tier of sortedTiers) {
        if (quantity >= tier.minQuantity) {
          return tier.pricePerUnit;
        }
      }
    }
    return price;
  };

  const addToCart = (product, quantity = 1, selectedVariants = {}) => {
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

    // Let getTieredPriceForUser handle the price, but we first need to know if the user is allowed at all.
    const basePrice = getPriceForUser(product);
    if (basePrice <= 0) {
      toast.error("Price not available for your role", { duration: 4000 });
      return;
    }

    const currentStock = stockMap[product._id] ?? product.stock ?? 0;
    // Calculate total quantity of THIS product across all variant combinations currently in cart
    const totalSpecificProductInCart = cart
      .filter(item => item._id === product._id)
      .reduce((sum, item) => sum + item.quantity, 0);

    const cartItemId = `${product._id}-${JSON.stringify(selectedVariants)}`;
    
    // The stock map tracks overall product stock, so we must check against the TOTAL of this product
    const requestedTotalAcrossVariants = totalSpecificProductInCart + quantity;

    if (requestedTotalAcrossVariants > currentStock && quantity > 0) {
      toast.error(
        `Only ${currentStock} available in total! (${totalSpecificProductInCart} already in cart)`,
        { duration: 4500 }
      );
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      const finalQuantity = existing ? existing.quantity + quantity : quantity;
      const tieredPrice = getTieredPriceForUser(product, finalQuantity);

      let variantNames = Object.values(selectedVariants).map(v => typeof v === 'object' ? v.name : v).join(', ');
      let displayName = variantNames ? `${product.name} (${variantNames})` : product.name;
      
      let message = existing
        ? `Updated: ${displayName} × ${finalQuantity}`
        : `Added: ${displayName}`;

      toastId.current = toast.success(message, { duration: 2800 });

      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                quantity: finalQuantity,
                pricePerUnit: tieredPrice,
                total: tieredPrice * finalQuantity,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          cartItemId,
          selectedVariants,
          quantity: finalQuantity,
          pricePerUnit: tieredPrice,
          total: tieredPrice * finalQuantity,
        },
      ];
    });

    setStockMap((prev) => ({
      ...prev,
      [product._id]: currentStock - quantity,
    }));
  };

  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    const item = cart.find((i) => i.cartItemId === cartItemId);
    if (!item) return;

    const productId = item._id;
    const originalStock = item.stock ?? 9999;
    const currentInCartAllVariants = cart
      .filter((i) => i._id === productId)
      .reduce((sum, i) => sum + i.quantity, 0);

    const newTotalInCartAllVariants = currentInCartAllVariants - item.quantity + newQuantity;

    if (newTotalInCartAllVariants > originalStock) {
      toast.error(`Cannot exceed available stock (${originalStock})`, {
        duration: 4000,
      });
      return;
    }

    const tieredPrice = getTieredPriceForUser(item, newQuantity);

    setCart((prev) =>
      prev.map((cartItem) =>
        cartItem.cartItemId === cartItemId
          ? {
              ...cartItem,
              quantity: newQuantity,
              pricePerUnit: tieredPrice,
              total: tieredPrice * newQuantity,
            }
          : cartItem
      )
    );

    setStockMap((prev) => ({
      ...prev,
      [productId]: originalStock - newTotalInCartAllVariants,
    }));
  };

  const removeFromCart = (cartItemId) => {
    const item = cart.find((i) => i.cartItemId === cartItemId);
    if (!item) return;

    let variantNames = Object.values(item.selectedVariants || {}).map(v => typeof v === 'object' ? v.name : v).join(', ');
    let displayName = variantNames ? `${item.name} (${variantNames})` : item.name;

    toastId.current = toast.success(`Removed: ${displayName}`, {
      duration: 2200,
    });

    const productId = item._id;
    const originalStock = item.stock ?? 9999;
    const wasInCart = item.quantity;

    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));

    setStockMap((prev) => ({
      ...prev,
      [productId]: (prev[productId] ?? originalStock) + wasInCart,
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