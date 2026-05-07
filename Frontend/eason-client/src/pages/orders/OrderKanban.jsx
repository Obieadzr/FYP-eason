import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../utils/api";
import { Package, Truck, CheckCircle, Clock, CheckCircle2, ArrowLeft, MapPin, Phone } from "lucide-react";

const COLUMNS = {
  pending:    { id: "pending",    title: "Pending",    color: "#f59e0b", iconEl: <Clock      className="w-4 h-4" /> },
  accepted:   { id: "accepted",   title: "Accepted",   color: "#3b82f6", iconEl: <CheckCircle className="w-4 h-4" /> },
  processing: { id: "processing", title: "Processing", color: "#8b5cf6", iconEl: <Package    className="w-4 h-4" /> },
  shipped:    { id: "shipped",    title: "Shipped",    color: "#06b6d4", iconEl: <Truck      className="w-4 h-4" /> },
  delivered:  { id: "delivered",  title: "Delivered",  color: "#00e87a", iconEl: <CheckCircle2 className="w-4 h-4" /> },
};

export default function OrderKanban() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/orders/wholesaler");
        // FIX: unwrap the orders array from the response object
        setOrders(data.orders || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId;
    setOrders(prev => prev.map(o => o._id === draggableId ? { ...o, status: newStatus } : o));

    try {
      await API.put(`/orders/${draggableId}/status`, { status: newStatus });
      toast.success(`Order moved to ${COLUMNS[newStatus].title}`);
    } catch (err) {
      toast.error("Failed to update status");
      setOrders(prev => prev.map(o => o._id === draggableId ? { ...o, status: source.droppableId } : o));
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#00e87a] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,232,122,0.5)]" />
    </div>
  );

  const columnsData = Object.keys(COLUMNS).reduce((acc, status) => {
    acc[status] = orders.filter(o => o.status === status);
    return acc;
  }, {});

  const totalOrders = orders.length;

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0d0d0d]/90 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex items-center gap-6 shadow-2xl">
        <button
          onClick={() => window.history.back()}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Order Kanban
          </h1>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">
            {totalOrders} active orders · drag to update status
          </p>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-5 overflow-x-auto px-8 py-8 pb-12 min-h-[80vh]">
          {Object.values(COLUMNS).map(col => (
            <div
              key={col.id}
              className="flex-shrink-0 w-80 rounded-2xl border border-white/5 bg-[#111111] flex flex-col"
            >
              {/* Column Header */}
              <div className="p-5 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <span style={{ color: col.color }}>{col.iconEl}</span>
                  <h2 className="font-bold text-white text-sm tracking-wide">{col.title}</h2>
                </div>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ color: col.color, background: col.color + "20", border: `1px solid ${col.color}30` }}
                >
                  {columnsData[col.id].length}
                </span>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 p-4 space-y-3 transition-colors rounded-b-2xl ${
                      snapshot.isDraggingOver ? "bg-white/[0.03]" : ""
                    }`}
                  >
                    {columnsData[col.id].map((order, index) => (
                      <Draggable key={order._id} draggableId={order._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-[#1a1a1a] border border-white/5 rounded-xl p-4 ${
                              snapshot.isDragging
                                ? "shadow-2xl shadow-black scale-[1.02] border-white/20"
                                : "hover:border-white/10"
                            } transition-all cursor-grab active:cursor-grabbing`}
                          >
                            {/* Order ID + Amount */}
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-xs font-mono font-bold" style={{ color: col.color }}>
                                #{order._id.slice(-6).toUpperCase()}
                              </span>
                              {/* FIX: use grandTotal (includes tax) not totalAmount */}
                              <span className="text-xs font-bold text-white bg-white/5 px-2 py-1 rounded-lg">
                                Rs {(order.grandTotal || order.totalAmount || 0).toLocaleString()}
                              </span>
                            </div>

                            {/* Buyer */}
                            <p className="text-sm font-bold text-white mb-1 truncate">
                              {order.user?.firstName} {order.user?.lastName}
                            </p>

                            {/* Address */}
                            <div className="flex items-start gap-1.5 mb-3">
                              <MapPin className="w-3 h-3 text-gray-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-gray-500 line-clamp-1">{order.shippingAddress}</p>
                            </div>

                            {/* Items + Payment */}
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-gray-600 font-medium uppercase tracking-widest">
                                {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                              </span>
                              <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full uppercase">
                                {order.paymentMethod || "COD"}
                              </span>
                            </div>

                            {/* Rider Info (if assigned) */}
                            {order.riderName && (
                              <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                                <Phone className="w-3 h-3 text-[#00e87a]" />
                                <span className="text-[10px] text-[#00e87a] font-medium">
                                  {order.riderName} · {order.riderPhone}
                                </span>
                              </div>
                            )}
                            {/* Tracking ID */}
                            {order.trackingId && (
                              <div className="mt-1">
                                <span className="text-[9px] font-mono text-gray-600">{order.trackingId}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {columnsData[col.id].length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-700">
                        <span className="text-3xl mb-2">○</span>
                        <p className="text-xs font-medium uppercase tracking-widest">Empty</p>
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
