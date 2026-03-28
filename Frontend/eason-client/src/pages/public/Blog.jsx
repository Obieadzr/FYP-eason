import React from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

export default function Blog() {
  const posts = [
    { title: "The Rise of Digital Wholesale in Nepal", cat: "INDUSTRY", date: "Oct 12, 2025", img: "https://images.pexels.com/photos/4482900/pexels-photo-4482900.jpeg?auto=compress&cs=tinysrgb&w=800" },
    { title: "How to Optimize Your Supply Chain for Dashain", cat: "GUIDE", date: "Sep 28, 2025", img: "https://images.pexels.com/photos/6169052/pexels-photo-6169052.jpeg?auto=compress&cs=tinysrgb&w=800" },
    { title: "New Feature: Multi-Vendor Shared Carts", cat: "PRODUCT", date: "Sep 15, 2025", img: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800" },
    { title: "Understanding Import Duties in Nepal 2025", cat: "FINANCE", date: "Aug 30, 2025", img: "https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=800" },
  ];

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <section className="pt-40 pb-20 px-6 max-w-screen-xl mx-auto text-center border-b border-gray-100">
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter uppercase text-black mb-8 leading-none">
          The <span className="text-emerald-500">Logbook</span>.
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
          Insights, platform updates, and strategies for modern retailers and suppliers navigating the Nepalese market.
        </p>
      </section>

      <section className="py-24 px-6 max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          <div className="bg-gray-100 rounded-3xl overflow-hidden aspect-[4/3] relative">
            <img src={posts[0].img} alt="Featured" className="w-full h-full object-cover mix-blend-multiply opacity-90" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-emerald-600 font-bold tracking-widest uppercase text-xs mb-4">{posts[0].cat} · {posts[0].date}</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-6 leading-none">
              {posts[0].title}
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              Discover how B2B platforms are transforming the traditional market dynamics in Kathmandu Valley, reducing middleman margins and empowering small shop owners.
            </p>
            <a href="#" className="font-bold uppercase tracking-widest text-sm text-black border-b-2 border-black inline-block self-start pb-1 hover:text-emerald-600 hover:border-emerald-600 transition-colors">
              Read Article
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.slice(1).map((p, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-video mb-6 relative">
                <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <p className="text-gray-400 font-bold tracking-widest uppercase text-[10px] mb-3">{p.cat} · {p.date}</p>
              <h3 className="text-xl font-bold uppercase tracking-tighter leading-tight group-hover:text-emerald-600 transition-colors">
                {p.title}
              </h3>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
