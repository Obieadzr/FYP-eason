import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Package, Search, CreditCard, Truck, Star } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const faqs = [
  { q: "Is eAson only for registered businesses?", a: "Yes, to maintain wholesale pricing and protect our suppliers, you must provide valid PAN/VAT credentials during registration." },
  { q: "How long does delivery take?", a: "Within Kathmandu Valley, orders are fulfilled in 24-48 hours. Outside the valley typically takes 3-5 business days." },
  { q: "What payment methods are supported?", a: "We support eSewa, Khalti, ConnectIPS, Fonepay, and Cash on Delivery for trusted buyers." },
  { q: "Is there a minimum order quantity?", a: "Yes, MOQs depend on the exact product and supplier. You'll see the MOQ clearly listed on every product page." }
];

const steps = [
  { icon: Search, title: "1. Discover", desc: "Browse thousands of authentic products from KYC-verified suppliers across Nepal. See real-time stock and transparent pricing." },
  { icon: Package, title: "2. Build Your Cart", desc: "Mix and match products across different suppliers. Hit the MOQ and checkout with unified carts." },
  { icon: CreditCard, title: "3. Secure Payment", desc: "Pay instantly via digital wallets or choose Cash on Delivery. All funds are held securely until delivery." },
  { icon: Truck, title: "4. Rapid Delivery", desc: "Live track your deliveries all the way to your storefront. Enjoy our aggregated logistic network." }
];

export default function HowItWorks() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navbar />

      {/* Hero */}
      <section className="bg-black text-white pt-40 pb-24 px-6 md:px-12">
        <div className="max-w-screen-xl mx-auto flex flex-col items-center text-center">
          <p className="text-emerald-400 font-bold tracking-widest uppercase text-xs mb-6">Simplifying B2B</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none mb-8">
            How It <span className="text-gray-400">Works</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed">
            We’ve removed the friction from traditional wholesale. No more calls, fake prices, or traveling to crowded markets.
          </p>
        </div>
      </section>

      {/* Timeline Steps */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="border-l border-gray-200 ml-6 md:ml-10 space-y-20">
            {steps.map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative pl-12 md:pl-20"
              >
                <div className="absolute -left-[26px] top-0 w-14 h-14 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                  <s.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-3xl font-bold tracking-tighter text-gray-900 mb-4 uppercase">{s.title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg max-w-xl">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive FAQ */}
      <section className="bg-white py-32 px-6 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tighter uppercase text-black mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-500">Everything you need to know about the platform.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="font-bold text-gray-900 pr-8">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-gray-50/50"
                    >
                      <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
