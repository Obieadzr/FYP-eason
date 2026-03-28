import React from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { ArrowRight } from "lucide-react";

export default function Careers() {
  const jobs = [
    { title: "Senior Full-Stack Engineer", dept: "Engineering", type: "Full-time", loc: "Kathmandu / Hybrid" },
    { title: "B2B Sales Executive", dept: "Sales", type: "Full-time", loc: "Kathmandu" },
    { title: "Supply Chain Operations Lead", dept: "Operations", type: "Full-time", loc: "On-site" }
  ];

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white">
      <Navbar />

      <section className="pt-40 pb-32 px-6 max-w-screen-xl mx-auto text-center border-b border-white/10">
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter uppercase mb-8 leading-none">
          Build the <br className="hidden md:block"/>
          <span className="text-emerald-500">Future.</span>
        </h1>
        <p className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
          We are a fast-moving, design-obsessed team fixing the backbone of Nepal's commerce. Join us.
        </p>
      </section>

      <section className="py-32 px-6 max-w-4xl mx-auto">
        <h2 className="text-sm font-bold tracking-widest uppercase text-white/50 mb-12 border-b border-white/10 pb-4">Open Positions</h2>
        
        <div className="space-y-4">
          {jobs.map((j, i) => (
            <div key={i} className="group flex flex-col md:flex-row md:items-center justify-between p-8 border border-white/10 rounded-2xl hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer">
              <div>
                <h3 className="text-2xl font-bold tracking-tighter text-white mb-2 group-hover:text-emerald-400 transition-colors">{j.title}</h3>
                <div className="flex gap-4 text-sm font-bold tracking-widest uppercase text-white/30">
                  <span>{j.dept}</span>
                  <span>·</span>
                  <span>{j.type}</span>
                  <span>·</span>
                  <span>{j.loc}</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-2 transition-all mt-6 md:mt-0" />
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 bg-white text-black text-center">
        <h2 className="text-3xl font-bold tracking-tighter uppercase mb-6">Don't see a fit?</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">Send us your CV anyway. We're always looking for exceptional talent to join our mission.</p>
        <button className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest text-xs rounded-none hover:bg-emerald-600 transition-colors">
          Email Us
        </button>
      </section>

      <Footer />
    </div>
  );
}
