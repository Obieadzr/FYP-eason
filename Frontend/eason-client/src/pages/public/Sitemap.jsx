import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

export default function Sitemap() {
  const mapData = [
    {
      category: "Platform",
      links: [
        { label: "Home / Landing", path: "/" },
        { label: "Marketplace Listing", path: "/marketplace" },
        { label: "Retailer Cart", path: "/cart" },
        { label: "Login Portal", path: "/login" },
        { label: "Registration Portal", path: "/register" }
      ]
    },
    {
      category: "Marketing",
      links: [
        { label: "How It Works", path: "/how-it-works" },
        { label: "Sell on eAson", path: "/sell" },
        { label: "Pricing", path: "/pricing" }
      ]
    },
    {
      category: "Company",
      links: [
        { label: "About Us", path: "/about" },
        { label: "Blog & Logs", path: "/blog" },
        { label: "Careers", path: "/careers" },
        { label: "Press & Media", path: "/press" },
        { label: "Contact Us", path: "/contact" }
      ]
    },
    {
      category: "Support & Legal",
      links: [
        { label: "Help Center", path: "/help" },
        { label: "Privacy Policy", path: "/privacy" },
        { label: "Terms of Service", path: "/terms" },
      ]
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <section className="pt-40 pb-20 px-6 max-w-screen-xl mx-auto border-b border-gray-100">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase text-black mb-8 leading-none">
          Sitemap
        </h1>
        <p className="text-gray-500 max-w-xl text-lg leading-relaxed">
          A complete structural overview of the eAson wholesale platform.
        </p>
      </section>

      <section className="py-24 px-6 max-w-screen-xl mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12">
          {mapData.map((col, i) => (
            <div key={i}>
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-6 border-b border-gray-200 pb-2">
                {col.category}
              </h3>
              <ul className="space-y-4">
                {col.links.map((l, j) => (
                  <li key={j}>
                    <Link to={l.path} className="text-gray-600 hover:text-black transition-colors font-medium text-sm">
                      {l.label}
                    </Link>
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
