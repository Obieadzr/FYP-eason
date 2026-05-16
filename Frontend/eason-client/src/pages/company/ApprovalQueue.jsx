import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Loader2, Package } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function ApprovalQueue() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const { data } = await api.get("/company/approvals");
      setOrders(data.orders);
    } catch (err) {
      toast.error("Failed to load approval queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleApprove = async (orderId) => {
    if (!confirm("Are you sure you want to approve this order?")) return;
    try {
      await api.put(`/orders/${orderId}/status`, { status: "pending" });
      toast.success("Order approved successfully!");
      fetchQueue();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve order");
    }
  };

  const handleReject = async (orderId) => {
    if (!confirm("Are you sure you want to REJECT and cancel this order?")) return;
    try {
      await api.put(`/orders/${orderId}/status`, { status: "cancelled" });
      toast.success("Order rejected.");
      fetchQueue();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reject order");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-[24px] font-bold text-gray-900 mb-2">Approval Queue</h1>
      <p className="text-gray-500 text-sm font-medium mb-6">Review orders exceeding Rs. 50,000 from your buyers.</p>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-amber-100 flex items-center justify-between bg-amber-50">
          <h2 className="text-sm font-bold flex items-center gap-2 text-amber-700">
            <AlertCircle className="w-4 h-4 stroke-[2]" />
            Pending Action Required
          </h2>
          <span className="text-[10px] bg-white border border-amber-200 text-amber-700 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider shadow-sm">
            {orders.length} Requests
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-200 stroke-[1.5]" />
            <p className="font-bold text-gray-900 text-lg mb-1">Queue is empty</p>
            <p className="text-sm font-medium">No pending approvals at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map(order => (
              <div key={order._id} className="p-6 flex flex-col lg:flex-row items-center justify-between gap-6 hover:bg-gray-50 transition-colors">
                
                {/* Info Block */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase">#{order._id.substring(0, 8)}</span>
                    <span className="text-xs font-semibold text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Rs. {order.grandTotal.toLocaleString()}</h3>
                  <p className="text-sm text-gray-500 font-medium">
                    Requested by <span className="text-gray-900 font-bold">{order.user?.firstName} {order.user?.lastName}</span> ({order.user?.email})
                  </p>
                </div>

                {/* Items Summary Block */}
                <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100 w-full lg:w-auto">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3 font-bold">Order Items</p>
                  <div className="space-y-2">
                    {order.items.slice(0, 2).map((item, i) => (
                      <div key={i} className="text-sm flex justify-between font-medium">
                        <span className="text-gray-700 truncate pr-4 flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-gray-400"/> {item.quantity}x {item.product?.name || 'Product'}</span>
                        <span className="text-gray-900 font-bold">Rs. {(item.quantity * item.pricePerUnit).toLocaleString()}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-emerald-600 font-bold pt-1">+ {order.items.length - 2} more items</p>
                    )}
                  </div>
                </div>

                {/* Actions Block */}
                <div className="flex flex-col gap-2 min-w-[140px] w-full lg:w-auto">
                  <button 
                    onClick={() => handleApprove(order._id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4 stroke-[2]" />
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReject(order._id)}
                    className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold text-sm px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4 stroke-[2]" />
                    Reject
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
