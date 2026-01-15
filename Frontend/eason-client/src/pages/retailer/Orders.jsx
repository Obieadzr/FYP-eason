import React, { useState, useEffect } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get("/orders/my-orders");
        setOrders(res.data);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">My Orders</h1>
      <p className="text-gray-600 mb-10">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow text-center">
          <p className="text-xl text-gray-600">You haven't placed any orders yet.</p>
          <button
            onClick={() => window.location.href = "/marketplace"}
            className="mt-6 px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-6 rounded-2xl shadow border border-gray-100 hover:shadow-lg transition"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div>
                  <p className="font-semibold text-lg">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500">
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
                  <p className="text-xl font-bold text-emerald-600">
                    Rs {order.totalAmount.toLocaleString()}
                  </p>
                  <span
                    className={`inline-block px-4 py-1 mt-2 rounded-full text-sm font-medium ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "shipped"
                        ? "bg-blue-100 text-blue-700"
                        : order.status === "processing"
                        ? "bg-purple-100 text-purple-700"
                        : order.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Items:</p>
                <ul className="space-y-3">
                  {order.items.map((item) => (
                    <li key={item._id} className="flex justify-between text-sm">
                      <span>
                        {item.quantity} ×{" "}
                        {item.product?.name || "Product " + item.product}
                      </span>
                      <span className="font-medium">
                        Rs {(item.pricePerUnit * item.quantity).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {order.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium">Notes:</p>
                  <p className="text-sm text-gray-600 mt-1">{order.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}