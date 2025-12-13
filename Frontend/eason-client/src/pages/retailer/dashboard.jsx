// src/pages/retailer/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { ShoppingCart, Package, Truck, Wallet, Search, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RetailerDashboard = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const stats = [
    { label: "Pending Orders", value: "12", icon: ShoppingCart, color: "bg-orange-500" },
    { label: "In Transit", value: "8", icon: Truck, color: "bg-blue-500" },
    { label: "Total Spent", value: "Rs. 4,82,000", icon: Wallet, color: "bg-green-500" },
    { label: "Saved This Month", value: "Rs. 68,000", icon: Package, color: "bg-purple-500" },
  ];

  const recentOrders = [
    { id: "#2841", supplier: "Himalayan Traders", items: 24, total: "Rs. 48,200", status: "In Transit" },
    { id: "#2839", supplier: "New Road Cosmetics", items: 18, total: "Rs. 32,800", status: "Delivered" },
    { id: "#2835", supplier: "Kalimati Vegetables", items: 40, total: "Rs. 18,500", status: "Processing" },
  ];

  const quickReorder = [
    { name: "Pashmina Shawl", price: 3400, lastOrdered: "2 days ago" },
    { name: "Sunscreen 50ml", price: 4500, lastOrdered: "1 week ago" },
    { name: "Dettol 1L", price: 890, lastOrdered: "3 days ago" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-black text-gray-900">Welcome back, Raju!</h1>
            <p className="text-xl text-gray-600 mt-2">Your shop is doing great today</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, suppliers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-14 pr-6 py-5 bg-white border border-gray-300 rounded-2xl w-96 text-lg font-medium focus:outline-none focus:ring-4 focus:ring-black/10"
              />
            </div>
            <button className="relative p-4 bg-white rounded-2xl shadow-lg border border-gray-200">
              <Bell className="w-7 h-7" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
              <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
                <stat.icon className="w-9 h-9 text-white" />
              </div>
              <p className="text-gray-600 font-bold text-lg">{stat.label}</p>
              <p className="text-4xl font-black mt-3">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions + Recent */}
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Quick Reorder */}
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-black mb-8">Quick Reorder</h2>
            <div className="space-y-6">
              {quickReorder.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-xl">{item.name}</h3>
                    <span className="text-sm text-gray-500">{item.lastOrdered}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black">Rs. {item.price.toLocaleString()}</span>
                    <button className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition">
                      Reorder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-black mb-8">Recent Orders</h2>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left px-8 py-6 font-bold">Order ID</th>
                    <th className="text-left px-8 py-6 font-bold">Supplier</th>
                    <th className="text-left px-8 py-6 font-bold">Items</th>
                    <th className="text-left px-8 py-6 font-bold">Total</th>
                    <th className="text-right px-8 py-6 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-8 py-6 font-bold">{order.id}</td>
                      <td className="px-8 py-6">{order.supplier}</td>
                      <td className="px-8 py-6">{order.items}</td>
                      <td className="px-8 py-6 font-bold">{order.total}</td>
                      <td className="px-8 py-6 text-right">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                          order.status === "Delivered" ? "bg-green-100 text-green-700" :
                          order.status === "In Transit" ? "bg-blue-100 text-blue-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailerDashboard;