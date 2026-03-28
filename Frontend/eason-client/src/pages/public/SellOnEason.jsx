import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, LayoutDashboard, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

export default function SellOnEason() {
  const navigate = useNavigate();

  const benefits = [
    { icon: LayoutDashboard, title: "Smart Dashboard", desc: "Manage inventory, track orders, and view deep analytics all from one unified portal." },
    { icon: TrendingUp, title: "Massive Reach", desc: "Instantly distribute your catalog to over 8,000 KYC-verified retail shops across Nepal." },
    { icon: ShieldCheck, title: "Secure Payouts", desc: "Guaranteed settlements directly to your bank account with zero payment risk." },
    { icon: Zap, title: "Zero Setup Fees", desc: "We only earn when you sell. Enjoy robust wholesale tools without upfront enterprise costs." },
  ];

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 relative bg-black text-white overflow-hidden">
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10">
            <p className="text-emerald-400 font-bold tracking-widest uppercase text-xs mb-6">Supplier Portal</p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-[0.9] mb-8">
              Grow Your <span className="text-emerald-500">B2B</span> Sales
            </h1>
            <p className="text-gray-400 text-lg mb-10 max-w-md leading-relaxed">
              Join Nepal's premier wholesale marketplace. Automate your orders, digitize your catalog, and reach thousands of retailers instantly.
            </p>
            <button 
              onClick={() => navigate("/register")}
              className="bg-white text-black px-10 py-5 font-bold uppercase tracking-widest text-xs rounded-none hover:bg-gray-200 transition flex items-center gap-3"
            >
              Start Selling <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="relative hidden lg:block border border-white/10 rounded-2xl overflow-hidden p-2 bg-[#111]">
            {/* Mock Dashboard preview */}
            <div className="bg-black h-80 w-full rounded-xl border border-white/5 flex flex-col p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="h-4 w-32 bg-white/10 rounded-full" />
                <div className="h-8 w-8 bg-emerald-500 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 border border-white/10 rounded-xl bg-white/5">
                  <div className="h-6 w-16 bg-white rounded-md mb-2" />
                  <div className="h-3 w-24 bg-white/30 rounded-md" />
                </div>
                <div className="p-4 border border-white/10 rounded-xl bg-white/5">
                  <div className="h-6 w-16 bg-white rounded-md mb-2" />
                  <div className="h-3 w-24 bg-white/30 rounded-md" />
                </div>
              </div>
              <div className="flex-1 border border-white/10 rounded-xl bg-gradient-to-t from-emerald-500/10 to-transparent flex items-end">
                <div className="w-full h-1 bg-emerald-500/50 relative bottom-4 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="py-32 bg-gray-50 border-y border-gray-200 px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tighter uppercase text-black">Why Partner With Us?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((b, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-10 border border-gray-200 hover:shadow-xl transition-shadow rounded-2xl"
              >
                <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                  <b.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">{b.title}</h3>
                <p className="text-gray-600 leading-relaxed font-medium">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
