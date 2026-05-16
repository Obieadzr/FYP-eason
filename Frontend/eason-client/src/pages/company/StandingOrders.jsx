import React, { useState, useEffect } from "react";
import { Loader2, Repeat, Package, Play, Pause, XCircle } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function StandingOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/standing-orders/my");
      setOrders(data.orders);
    } catch (err) {
      toast.error("Failed to fetch standing orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/standing-orders/${id}/status`, { status });
      toast.success(`Subscription marked as ${status}`);
      fetchOrders();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    if (status === "active") return <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Active</span>;
    if (status === "paused") return <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Paused</span>;
    return <span className="bg-rose-50 text-rose-600 border border-rose-200 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Cancelled</span>;
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-[24px] font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Repeat className="w-6 h-6 text-emerald-600 stroke-[2]" />
        Standing Orders
      </h1>
      <p className="text-gray-500 text-sm font-medium mb-6">Manage your recurring product subscriptions. We automatically re-order these items for you based on the frequency.</p>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center">
            <Repeat className="w-12 h-12 mb-4 text-gray-200 stroke-[1.5]" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No active subscriptions</h3>
            <p className="text-sm font-medium">You haven't set up any standing orders yet. Find a product you like and click "Subscribe".</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Frequency</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Next Delivery</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {order.product?.image ? <img src={`http://localhost:5000${order.product.image}`} alt="Product" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-gray-300 stroke-[1.5]" />}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{order.product?.name || "Unknown Product"}</div>
                        <div className="text-gray-500 text-xs font-medium">{order.quantity} units @ Rs {order.pricePerUnit}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-gray-700 font-bold text-sm bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg">{order.frequency}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 font-semibold text-sm">{new Date(order.nextDeliveryDate).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {order.status === "active" && (
                        <button onClick={() => updateStatus(order._id, "paused")} className="p-2 text-amber-500 hover:bg-amber-50 border border-transparent hover:border-amber-200 rounded-lg transition-colors" title="Pause">
                          <Pause className="w-4 h-4 stroke-[2]" />
                        </button>
                      )}
                      {order.status === "paused" && (
                        <button onClick={() => updateStatus(order._id, "active")} className="p-2 text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-lg transition-colors" title="Resume">
                          <Play className="w-4 h-4 stroke-[2]" />
                        </button>
                      )}
                      {order.status !== "cancelled" && (
                        <button onClick={() => { if(confirm("Cancel this subscription?")) updateStatus(order._id, "cancelled") }} className="p-2 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors" title="Cancel">
                          <XCircle className="w-4 h-4 stroke-[2]" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
