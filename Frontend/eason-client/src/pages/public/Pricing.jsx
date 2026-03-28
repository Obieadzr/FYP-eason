import React from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { Check } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Retailer / Buyer",
      price: "Free",
      desc: "For businesses looking to source products.",
      features: [
        "Access to 8,000+ verified suppliers",
        "Unified multi-vendor cart",
        "Order limits: None",
        "Dedicated buyer support",
        "Supplier analytics & ratings"
      ]
    },
    {
      name: "Supplier / Seller",
      price: "1.5%",
      desc: "Flat fee per successful transaction. No hidden costs.",
      features: [
        "Unlimited product listings",
        "Advanced inventory management",
        "Real-time order tracking",
        "Wholesale analytics dashboard",
        "Automated KYC fast-lane"
      ],
      featured: true
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <section className="pt-40 pb-20 px-6 max-w-screen-xl mx-auto text-center">
        <p className="text-emerald-600 font-bold tracking-widest uppercase text-xs mb-6">Simple & Transparent</p>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase text-black mb-8 leading-none">
          Radically Fair Pricing
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-lg leading-relaxed">
          No subscriptions, no hidden fees, and absolutely no surprises. We only make money when you successfully trade on the platform.
        </p>
      </section>

      <section className="pb-32 px-6 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {plans.map((p, i) => (
            <div 
              key={i} 
              className={`relative rounded-3xl p-10 border ${p.featured ? 'bg-black text-white border-black shadow-2xl scale-[1.02]' : 'bg-white text-black border-gray-200 shadow-sm'}`}
            >
              {p.featured && (
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  For Wholesalers
                </div>
              )}
              <h3 className="text-2xl font-bold uppercase tracking-tighter mb-2">{p.name}</h3>
              <p className={`text-sm mb-8 ${p.featured ? 'text-gray-400' : 'text-gray-500'}`}>{p.desc}</p>
              
              <div className="mb-10">
                <span className="text-6xl font-bold tracking-tighter">{p.price}</span>
                {p.featured && <span className={`text-sm font-medium ${p.featured ? 'text-gray-400' : 'text-gray-500'} ml-2`}>/ order</span>}
              </div>

              <div className="space-y-4">
                {p.features.map((f, j) => (
                  <div key={j} className="flex gap-4 items-center">
                    <div className={`p-1 rounded-full ${p.featured ? 'bg-white/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
