import React from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";       
import Footer from "../components/Footer";
import {
  ArrowRight,
  Plus,
  Timer,
  DollarSign,
  MapPin,
  Search,
  Package,
  Store,
  Warehouse,
  ShoppingBag,
} from "lucide-react";
import nepalFlag from "../assets/nepal.png";
import { useNavigate } from "react-router-dom";
export default function LandingPage() {
  const navigate = useNavigate();
  const benefits = [
    {
      icon: Timer,
      title: "Save 4–6 Hours Weekly",
      desc: "No travel. No calls. Order in 20 seconds.",
      color: "emerald",
    },
    {
      icon: DollarSign,
      title: "Direct Wholesale Price",
      desc: "Zero dalal. Zero hidden cuts.",
      color: "blue",
    },
    {
      icon: Package,
      title: "Real-Time Stock",
      desc: "See live availability. Track every order.",
      color: "violet",
    },
    {
      icon: MapPin,
      title: "All Markets in One App",
      desc: "Ason + Kalimati + Bhotebahal — instantly.",
      color: "orange",
    },
  ];

  return (
    <>
      <style jsx global>{`
        @import url("https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&display=swap");
        @import url("https://rsms.me/inter/inter.css");

        html,
        body,
        * {
          font-family: "Satoshi", "Geist", "Inter", -apple-system,
            BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          letter-spacing: -0.02em;
          font-feature-settings: "cv11", "ss01";
        }
      `}</style>
  
      <Navbar/>
      

      {/* HERO */}
      <section className="relative min-h-screen flex items-center bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-lg">
            <div className="text-emerald-600 text-sm font-medium tracking-widest uppercase mb-8">
              Nepal’s wholesale platform
            </div>
            <h1 className="text-7xl lg:text-8xl font-light tracking-tight text-gray-900 leading-none">
              eAson
              <span className="block text-5xl lg:text-6xl text-gray-500 mt-3">
                Wholesale
              </span>
              <span className="block text-5xl lg:text-6xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Rebuilt.
              </span>
            </h1>
            <p className="mt-10 text-lg text-gray-600 font-light leading-relaxed">
              Real-time stock. Factory-direct pricing.
              <br />
              Pay instantly with Khalti, eSewa, IME Pay.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/register")}
                className="px-9 py-4 bg-black text-white font-medium rounded-xl hover:bg-gray-900 transition"
              >
                Start Free
              </button>
            </div>
          </div>

          <div className="relative h-[700px] hidden lg:flex items-center justify-center">
            {/* Your floating mockups — untouched */}
            {/* <motion.div
              initial={{ y: 60, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative z-20"
            >
              <img
                src="https://images.unsplash.com/photo-1558655146-9f40138ed1cb?w=600&h=800&fit=crop&crop=center"
                alt="eAson dashboard"
                className="w-80 rounded-3xl shadow-2xl border border-gray-100"
              /> */}
            {/* </motion.div> */}
            <motion.div
              initial={{ y: -80, x: 100, rotate: 12 }}
              whileInView={{ y: -60, x: 120, rotate: 12 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="absolute z-30"
            >
              <div className="w-72 h-44 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-2xl p-6 text-white flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs opacity-80">Credit Card</div>
                    <div className="text-lg tracking-wider mt-1">
                      234 •••• •••• ••••
                    </div>
                  </div>
                  <div className="text-2xl">VISA</div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-80">eAson Pay</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ y: 100, x: -80, rotate: -8 }}
              whileInView={{ y: 80, x: -100, rotate: -8 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="absolute z-10"
            >
              <img
                src="https://images.unsplash.com/photo-1592899677977-9c10ca1104a7?w=300&h=600&fit=crop"
                alt="eAson mobile"
                className="w-48 rounded-3xl shadow-2xl border border-gray-100"
              />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute top-32 left-10 bg-white/90 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-xl border border-gray-100"
            >
              <div className="text-2xl font-bold text-emerald-600">
                Rs 1.2Cr+
              </div>
              <div className="text-xs text-gray-600">Daily volume</div>
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 1 }}
              className="absolute bottom-40 right-20 bg-white/90 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-xl border border-gray-100"
            >
              <div className="text-2xl font-bold text-teal-600">8,000+</div>
              <div className="text-xs text-gray-600">Active traders</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-emerald-600 font-medium tracking-wider text-sm uppercase">
              Trusted by Nepal’s top wholesalers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Your 4 cards — untouched */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="p-8 bg-gray-50 rounded-3xl border border-gray-200 hover:border-emerald-300 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Verified Suppliers Only
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Every wholesaler is KYC verified. No fakes. No middlemen.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="p-8 bg-gray-50 rounded-3xl border border-gray-200 hover:border-emerald-300 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
                  <img
                    src={nepalFlag}
                    alt="Nepal Flag"
                    className="w-10 h-10 object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  100% Nepali Team
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Built in Kathmandu. We speak Nepali, understand your market,
                  and eat momo like you.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="p-8 bg-gray-50 rounded-3xl border border-gray-200 hover:border-emerald-300 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-cyan-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-cyan-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Instant Local Payments
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  eSewa · Khalti · IME Pay · ConnectIPS · Fonepay — pay in
                  seconds, not days.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="p-8 bg-gray-50 rounded-3xl border border-gray-200 hover:border-emerald-300 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  24/7 Real Support
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Call, chat, or visit our Kathmandu office. Real Nepali team,
                  always ready.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHY SHOPS SWITCH */}
      <section className="py-32 md:py-40 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-5xl md:text-7xl font-light tracking-tight text-gray-900"
            style={{
              fontFamily: "Neue Montreal, Inter, system-ui, sans-serif",
            }}
          >
            Why shops switch to{" "}
            <span className="font-normal text-emerald-600">ASON</span>
          </motion.h2>

          <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left & Right — exactly as you wrote */}
            {/* ... your full left list and right stacked cards ... */}
            {/* (keeping your exact code here - unchanged) */}
            <div className="space-y-16">
              {benefits.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className="group flex items-center gap-6 cursor-default"
                >
                  <div className="text-5xl font-light text-gray-300 select-none">
                    0{i + 1}
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-2xl md:text-3xl font-medium text-gray-800 leading-tight transition-colors duration-500 group-hover:text-emerald-600"
                      style={{
                        fontFamily:
                          "Neue Montreal, Inter, system-ui, sans-serif",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p className="mt-2 text-gray-500 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {item.desc}
                    </p>
                  </div>
                  <ArrowRight className="w-7 h-7 text-gray-400 opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-3 transition-all duration-500" />
                </motion.div>
              ))}
            </div>

            <div className="relative h-[500px] lg:h-[650px]">
              {benefits.map((item, i) => {
                const Icon = item.icon;
                const colors = {
                  emerald: "from-emerald-500 to-emerald-600",
                  blue: "from-blue-500 to-blue-600",
                  violet: "from-violet-500 to-violet-600",
                  orange: "from-orange-500 to-orange-600",
                };
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ zIndex: i }}
                    whileHover={{ zIndex: 50, scale: 1.04 }}
                  >
                    <div className="absolute inset-10 md:inset-12 rounded-3xl bg-gradient-to-br shadow-2xl transition-all duration-700 hover:shadow-3xl hover:inset-4">
                      <div
                        className={`h-full w-full rounded-3xl bg-gradient-to-br ${
                          colors[item.color]
                        } relative overflow-hidden`}
                      >
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-md opacity-0 hover:opacity-100 transition-opacity duration-700 flex flex-col items-center justify-center text-center p-10 text-white">
                          <Icon className="w-16 h-16 mb-6" />
                          <h3 className="text-3xl font-semibold mb-3">
                            {item.title}
                          </h3>
                          <p className="text-lg opacity-90 max-w-xs">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="mt-20 lg:hidden grid grid-cols-2 gap-5">
            {benefits.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="bg-gray-50 rounded-3xl p-8 text-center border border-gray-100"
                >
                  <Icon className="w-10 h-10 mx-auto mb-4 text-emerald-600" />
                  <h4 className="text-lg font-medium text-gray-800">
                    {item.title.split(" ")[0]}
                    <br />
                    {item.title.split(" ").slice(1).join(" ")}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DUAL PERSPECTIVE — Fixed nesting */}
      <section className="py-32 md:py-44 bg-gray-50/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-5xl mx-auto"
          >
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-gray-900">
              One platform.
            </h2>
            <p className="mt-4 text-5xl md:text-7xl lg:text-8xl font-medium bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Two realities.
            </p>
            <p className="mt-8 text-xl md:text-2xl text-gray-600 font-light">
              Built for the shop that buys and the supplier that sells.
            </p>
          </motion.div>

          <div className="mt-24 md:mt-32 grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Retailer Side — your exact design */}
            {/* Retailer Side – FINAL VERSION: Clean, English, Premium, Same Height */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="relative group h-full"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-100/60 to-teal-100/40 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition duration-1000" />

              <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-2xl overflow-hidden h-full flex flex-col">
                <div className="p-10 md:p-12 flex flex-col h-full">
                  {/* Top Header */}
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-2xl bg-emerald-600 shadow-xl">
                        <Store className="w-9 h-9 text-white" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900">
                          For Retailers
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Order in seconds. Never run out.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="relative mb-8">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search products, brands, categories..."
                      className="w-full pl-16 pr-6 py-6 rounded-2xl bg-gray-100/70 border border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition text-lg font-medium"
                    />
                  </div>

                
                  <div className="space-y-4 flex-1">
                    {[
                      {
                        name: "Dabur Chyawanprash 1kg",
                        price: "Rs 2,340",
                        qty: "12 jars left",
                      },
                      {
                        name: "Surf Excel Matic 4L",
                        price: "Rs 3,100",
                        qty: "6 units left",
                        hot: true,
                      },
                      {
                        name: "Head & Shoulders 180ml",
                        price: "Rs 1,890",
                        qty: "48 pcs left",
                      },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.02, x: 8 }}
                        className="flex items-center gap-5 p-5 rounded-2xl bg-white border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group/item"
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                          <Package className="w-8 h-8 text-gray-500" />
                        </div>

                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {item.qty}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-bold text-emerald-600">
                            {item.price}
                          </p>
                          {item.hot && (
                            <span className="text-xs font-bold text-orange-500 bg-orange-100 px-2 py-1 rounded-full">
                              HOT
                            </span>
                          )}
                        </div>

                        <Plus className="w-6 h-6 text-emerald-600 opacity-0 group-hover/item:opacity-100 transition" />
                      </motion.div>
                    ))}
                  </div>

                  
                  <button className="mt-10 w-full py-6 bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-900 transition shadow-xl flex items-center justify-center gap-3">
                    <ShoppingBag className="w-6 h-6" />
                    Start Ordering Now
                  </button>
                </div>
              </div>
            </motion.div>

         
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-3xl blur-xl" />
              <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl overflow-hidden border border-gray-800">
                <div className="p-10 md:p-12 text-white">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-4 rounded-2xl bg-emerald-500/20 backdrop-blur">
                      <Warehouse className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-3xl font-medium">For Suppliers</h3>
                  </div>
                  <h4 className="text-4xl font-light mb-2">
                    Your inventory, live
                  </h4>
                  <p className="text-gray-400 mb-12">
                    Real-time orders • Stock alerts • Instant payouts
                  </p>
                  <div className="grid grid-cols-3 gap-8 mb-12">
                    <div>
                      <div className="text-5xl font-light text-emerald-400">
                        87
                      </div>
                      <p className="text-gray-400 mt-2">Active Products</p>
                    </div>
                    <div>
                      <div className="text-5xl font-light">Rs 48.2L</div>
                      <p className="text-gray-400 mt-2">This Month</p>
                    </div>
                    <div>
                      <div className="text-5xl font-light text-orange-400">
                        6
                      </div>
                      <p className="text-gray-400 mt-2">Low Stock</p>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <button className="flex-1 bg-white text-black py-6 rounded-2xl font-medium hover:bg-gray-100 transition flex items-center justify-center gap-3">
                      <Plus className="w-6 h-6" /> Add Product
                    </button>
                    <button className="px-10 py-6 bg-white/10 backdrop-blur rounded-2xl font-medium hover:bg-white/20 transition flex items-center gap-3">
                      View Orders <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-32 md:py-40 overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800">
      
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-7xl md:text-9xl font-medium tracking-tighter text-white"
            style={{ fontFamily: "Satoshi, system-ui, sans-serif" }}
          >
            No more 5AM.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="mt-8 text-2xl md:text-3xl font-light text-white/80 tracking-tight"
            style={{ fontFamily: "Satoshi, system-ui, sans-serif" }}
          >
            8,000+ shops already quit the market rush.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-16 flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <button className="group px-14 py-7 bg-white text-black rounded-full text-2xl font-medium hover:scale-105 transition-all duration-300 shadow-2xl flex items-center gap-4" onClick={() => navigate("/register")}>
              Start Buying Free
              <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition" />
            </button>

            <button className="px-14 py-7 border-2 border-white/50 text-white rounded-full text-2xl font-medium hover:bg-white/10 backdrop-blur transition-all duration-300" onClick={()=>{navigate("/login")}}>
              Start Selling
            </button>
          </motion.div>

          {/* Tiny trust line — barely there, but powerful */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-10 text-white/60 text-sm tracking-wider"
            style={{ fontFamily: "Satoshi, system-ui, sans-serif" }}
          >
            NO CARD • NO FEES • CANCEL ANYTIME
          </motion.p>
        </div>
      </section>

       <Footer/>
    </>
  );
}
