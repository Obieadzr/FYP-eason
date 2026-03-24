import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../utils/api";
import { Package, Truck, CheckCircle, Clock, CheckCircle2 } from "lucide-react";

const COLUMNS = {
  pending: {
    id: "pending",
    title: "Pending",
    icon: <Clock className="w-5 h-5 text-amber-500" />,
    bg: "bg-amber-50",
    border: "border-amber-200"
  },
  accepted: {
    id: "accepted",
    title: "Accepted",
    icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
    bg: "bg-blue-50",
    border: "border-blue-200"
  },
  processing: {
    id: "processing",
    title: "Processing",
    icon: <Package className="w-5 h-5 text-indigo-500" />,
    bg: "bg-indigo-50",
    border: "border-indigo-200"
  },
  shipped: {
    id: "shipped",
    title: "Shipped",
    icon: <Truck className="w-5 h-5 text-purple-500" />,
    bg: "bg-purple-50",
    border: "border-purple-200"
  },
  delivered: {
    id: "delivered",
    title: "Delivered",
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    bg: "bg-emerald-50",
    border: "border-emerald-200"
  }
};

export default function OrderKanban() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // In a real scenario, this fetches all orders for the wholesaler/admin.
        // We'll reuse my-orders for demo, but backend needs fetching logic.
        const { data } = await API.get("/orders/wholesaler");
        setOrders(data || []);
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
    
    // Optimistic UI Update
    setOrders(prev => prev.map(o => 
      o._id === draggableId ? { ...o, status: newStatus } : o
    ));

    try {
      await API.put(`/orders/${draggableId}/status`, { status: newStatus });
      toast.success(`Order moved to ${COLUMNS[newStatus].title}`);
    } catch (err) {
      toast.error("Failed to update status");
      // Revert on fail
      setOrders(prev => prev.map(o => 
        o._id === draggableId ? { ...o, status: source.droppableId } : o
      ));
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" /></div>;

  // Group orders by status
  const columnsData = Object.keys(COLUMNS).reduce((acc, status) => {
    acc[status] = orders.filter(o => o.status === status);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Order Fulfillment</h1>
        <p className="text-gray-500">Drag and drop orders across columns to update their status and notify customers.</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-8 min-h-[70vh]">
          {Object.values(COLUMNS).map(col => (
            <div key={col.id} className={`flex-shrink-0 w-80 rounded-2xl border ${col.border} ${col.bg} flex flex-col`}>
              <div className="p-4 flex items-center justify-between border-b border-black/5">
                <div className="flex items-center gap-2">
                  {col.icon}
                  <h2 className="font-bold text-gray-800">{col.title}</h2>
                </div>
                <span className="bg-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                  {columnsData[col.id].length}
                </span>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className={`flex-1 p-4 space-y-4 transition-colors ${snapshot.isDraggingOver ? 'bg-black/5' : ''}`}
                  >
                    {columnsData[col.id].map((order, index) => (
                      <Draggable key={order._id} draggableId={order._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 ${snapshot.isDragging ? 'shadow-xl scale-105' : 'hover:shadow-md'} transition-all`}
                          >
                            <div className="flex justify-between items-start mb-2">
                               <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">#{order._id.slice(-6)}</span>
                               <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Rs {order.totalAmount}</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{order.shippingAddress}</h3>
                            <p className="text-sm text-gray-500 mb-3">{order.items.length} items</p>
                            <div className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded inline-block">
                              {order.paymentMethod ? order.paymentMethod.toUpperCase() : 'COD'}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
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
