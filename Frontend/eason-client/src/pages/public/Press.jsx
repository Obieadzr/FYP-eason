import React from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { Download, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

export default function Press() {
  const handleDownload = () => {
    toast.success("Downloading Press Kit.zip (14MB)");
  };

  const mentions = [
    { source: "TechLekh", date: "Jan 2026", title: "eAson raises Seed round to digitize Nepal's wholesale sector." },
    { source: "Kathmandu Post", date: "Nov 2025", title: "How a local startup is fixing the Bhotebahal supply chain." },
    { source: "Bizmandu", date: "Sep 2025", title: "eAson crosses Rs 1 Crore daily GMV milestone." }
  ];

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <section className="pt-40 pb-24 px-6 max-w-screen-xl mx-auto border-b border-gray-100">
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter uppercase text-black mb-8 leading-[0.9]">
          Press & <br /> <span className="text-gray-400">Media Kits</span>.
        </h1>
        <p className="text-gray-500 max-w-2xl text-lg leading-relaxed">
          Official brand assets, logos, phrasing guidelines, and our latest mentions in the press.
        </p>
      </section>

      <section className="py-24 px-6 max-w-screen-xl mx-auto">
        <div className="mb-16">
          <h2 className="text-2xl font-bold uppercase tracking-tighter mb-8">Brand Assets</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50">
              <h3 className="text-4xl font-bold tracking-tight text-black mb-6">eAson.</h3>
              <button onClick={handleDownload} className="text-xs font-bold uppercase tracking-widest text-emerald-600 hover:text-black transition-colors flex items-center gap-2">
                Download SVG <Download className="w-4 h-4" />
              </button>
            </div>
            <div className="border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-black">
              <h3 className="text-4xl font-bold tracking-tight text-white mb-6">eAson.</h3>
              <button onClick={handleDownload} className="text-xs font-bold uppercase tracking-widest text-emerald-400 hover:text-white transition-colors flex items-center gap-2">
                Download SVG <Download className="w-4 h-4" />
              </button>
            </div>
            <div className="border border-emerald-500 bg-emerald-500 rounded-2xl p-8 flex flex-col items-center justify-center">
              <h3 className="text-4xl font-bold tracking-tight text-white mb-6">eAson.</h3>
              <button onClick={handleDownload} className="text-xs font-bold uppercase tracking-widest text-black hover:text-white transition-colors flex items-center gap-2">
                Full Press Kit <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div>
           <h2 className="text-2xl font-bold uppercase tracking-tighter mb-8">In The News</h2>
           <div className="space-y-4">
             {mentions.map((m, i) => (
               <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 md:p-8 border border-gray-200 rounded-2xl hover:border-black hover:shadow-sm transition-all cursor-pointer group">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">{m.source} · {m.date}</p>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-black">{m.title}</h3>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors mt-4 sm:mt-0" />
               </div>
             ))}
           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
