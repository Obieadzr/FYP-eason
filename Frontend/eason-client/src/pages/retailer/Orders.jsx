import React, { useState, useEffect } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";
import { Package, ShoppingBag, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get("/orders/my-orders");
        setOrders(res.data.orders || res.data || []);
      } catch (err) {
        toast.error("Failed to load your orders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-xl text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button at Top */}
      <button
        onClick={() => navigate("/marketplace")}
        className="flex items-center gap-2 text-gray-600 hover:text-emerald-700 transition font-medium mb-8"
      >
        <ArrowLeft size={20} />
        Back to Marketplace
      </button>

      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">My Orders</h1>
      <p className="text-lg text-gray-600 mb-10">
        {orders.length} order{orders.length !== 1 ? "s" : ""}
      </p>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
          <div className="w-24 h-24 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-8">
            <ShoppingBag className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-medium text-gray-900 mb-4">No orders yet</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
            When you place an order, it will appear here so you can track it easily.
          </p>
          <button
            onClick={() => navigate("/marketplace")}
            className="px-10 py-4 bg-emerald-600 text-white font-medium rounded-2xl hover:bg-emerald-700 transition shadow-lg"
          >
            Start Shopping Now
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-6 md:p-8 rounded-2xl shadow border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <p className="font-bold text-xl text-gray-900">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-700">
                    Rs {order.totalAmount.toLocaleString()}
                  </p>
                  <span
                    className={`inline-block px-5 py-1.5 mt-3 rounded-full text-sm font-semibold tracking-wide
                      ${order.status === "delivered" ? "bg-green-100 text-green-800" :
                        order.status === "shipped" ? "bg-blue-100 text-blue-800" :
                        order.status === "processing" ? "bg-purple-100 text-purple-800" :
                        order.status === "cancelled" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-6">
                <p className="text-base font-medium mb-4 text-gray-800">Items in this order:</p>
                <ul className="space-y-4">
                  {order.items.map((item) => (
                    <li key={item._id} className="flex justify-between items-center text-gray-700">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package size={20} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{item.product?.name || "Product"}</p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} × Rs {item.pricePerUnit.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium">
                        Rs {(item.pricePerUnit * item.quantity).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {order.notes && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-base font-medium text-gray-800 mb-2">Delivery Notes:</p>
                  <p className="text-gray-600 italic bg-gray-50 p-4 rounded-xl">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}