// src/pages/retailer/Cart.jsx
import React from "react";
import { useCart } from "../../context/CartContext.jsx";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, Package, ArrowRight,ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto mb-8 flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-gray-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-10">Explore the marketplace and add items you need</p>
          <button
            onClick={() => navigate("/marketplace")}
            className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition flex items-center gap-3 mx-auto"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-10">Your Cart ({cart.length} items)</h1>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-6 hover:shadow-lg transition"
              >
                <div className="w-28 h-28 flex-shrink-0">
                  {item.image ? (
                    <img
                      src={`http://localhost:5000${item.image}`}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-gray-600 mt-1">Rs {item.price.toLocaleString()} per unit</p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <Minus className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-xl font-bold w-12 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <Plus className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-emerald-600">
                    Rs {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => removeFromCart(item._id)}
                  className="ml-4 p-3 rounded-lg hover:bg-red-50 transition text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({cart.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                  <span className="font-semibold">Rs {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>Rs {cartTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  toast.success("Order placed successfully! 🎉 (Demo mode)");
                  clearCart();
                  navigate("/marketplace");
                }}
                className="w-full py-5 bg-emerald-600 text-white text-lg font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate("/marketplace")}
                className="w-full mt-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;