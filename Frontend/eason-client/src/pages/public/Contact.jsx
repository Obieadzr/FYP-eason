import React from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

export default function Contact() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <section className="pt-40 pb-32 px-6 max-w-screen-xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase text-black mb-8 leading-none">
          Contact Us
        </h1>
        <p className="text-gray-500 max-w-2xl text-lg leading-relaxed mb-16">
          We are here to help. Reach out to the eAson team for support, partnership inquiries, or media assets.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-8 border border-gray-200 rounded-2xl hover:border-black transition-colors">
            <h3 className="text-xl font-bold uppercase tracking-tighter mb-4">Support</h3>
            <p className="text-gray-500 font-medium mb-4 text-sm leading-relaxed">Need help with an order or account setup?</p>
            <p className="font-bold">support@eason.com.np</p>
          </div>
          <div className="p-8 border border-gray-200 rounded-2xl hover:border-black transition-colors">
            <h3 className="text-xl font-bold uppercase tracking-tighter mb-4">Partnerships</h3>
            <p className="text-gray-500 font-medium mb-4 text-sm leading-relaxed">Are you an enterprise brand looking to scale?</p>
            <p className="font-bold">brands@eason.com.np</p>
          </div>
          <div className="p-8 border border-gray-200 rounded-2xl hover:border-black transition-colors">
            <h3 className="text-xl font-bold uppercase tracking-tighter mb-4">Office</h3>
            <p className="text-gray-500 font-medium mb-4 text-sm leading-relaxed">Visit us in the heart of Kathmandu.</p>
            <p className="font-bold">Newroad, Kathmandu, Nepal</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
