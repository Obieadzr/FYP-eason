import React from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

export default function AboutUs() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <section className="pt-40 pb-20 px-6 max-w-screen-xl mx-auto text-center">
        <p className="text-emerald-600 font-bold tracking-widest uppercase text-xs mb-6">Our Story</p>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase text-black mb-8 leading-none">
          Powering Nepal's <br className="hidden md:block" />
          <span className="text-gray-400">Retail Economy.</span>
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
          eAson was built to solve the fragmentation of Nepal's wholesale market. We believe that technology can democratize access to factory-direct prices for every retailer, from Asan to the far west.
        </p>
      </section>

      <section className="pb-32 px-6 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-gray-100 h-96 rounded-3xl overflow-hidden relative">
            <img 
              src="https://images.pexels.com/photos/1036372/pexels-photo-1036372.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
              alt="Nepali Market" 
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-80"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tighter uppercase mb-6">Built by Traders. For Traders.</h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Our founders grew up in the alleys of Bhotebahal and Newroad, watching their parents struggle with manual ledger books, bargaining, and unpredictable supply chains. 
            </p>
            <p className="text-gray-500 leading-relaxed">
              We took those lessons and built eAson — a digital mirror of Nepal's bustling markets, but with the speed, transparency, and reliability of modern tech.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-black text-white py-32 px-6">
        <div className="max-w-screen-xl mx-auto grid md:grid-cols-3 gap-12 text-center">
          <div>
            <h3 className="text-5xl font-bold text-emerald-500 mb-4 tracking-tighter">100%</h3>
            <p className="text-sm tracking-widest uppercase font-bold text-gray-400">Bootstrapped in Nepal</p>
          </div>
          <div>
            <h3 className="text-5xl font-bold text-emerald-500 mb-4 tracking-tighter">8k+</h3>
            <p className="text-sm tracking-widest uppercase font-bold text-gray-400">Active Businesses</p>
          </div>
          <div>
            <h3 className="text-5xl font-bold text-emerald-500 mb-4 tracking-tighter">24/7</h3>
            <p className="text-sm tracking-widest uppercase font-bold text-gray-400">Order Fulfillment</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
