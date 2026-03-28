import React from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { Search, Package, CreditCard } from "lucide-react";

export default function HelpCenter() {
  const categories = [
    { title: "Getting Started", icon: Search, links: ["How to register as a Retailer", "Account verification (KYC)", "Reset my password", "Understanding MOQs"] },
    { title: "Orders & Shipping", icon: Package, links: ["Track my current order", "Change delivery address", "What is partial fulfillment?", "Report a missing item"] },
    { title: "Payments & Wallet", icon: CreditCard, links: ["How to pay with Khalti/eSewa", "Is Cash on Delivery available?", "Refund policy and timelines", "Where is my invoice?"] },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      
      <section className="bg-black text-white pt-40 pb-32 px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-8 leading-none">
          How can we help?
        </h1>
        <div className="max-w-xl mx-auto relative relative">
          <input 
            type="text" 
            placeholder="Search for answers..."
            className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 transition-colors"
          />
          <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </section>

      <section className="py-24 px-6 max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((c, i) => (
            <div key={i} className="bg-white p-8 border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                <c.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tighter mb-6">{c.title}</h3>
              <ul className="space-y-4">
                {c.links.map((l, j) => (
                  <li key={j}>
                    <a href="#" className="text-gray-500 hover:text-emerald-600 transition-colors text-sm font-medium">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
