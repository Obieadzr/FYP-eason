// src/components/Footer.jsx
import React from "react";
import nepalFlag from "../assets/nepal.png";

export default function Footer() {
  return (
    <footer className="py-28 md:py-36 bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid md:grid-cols-5 gap-12">
                {/* Brand */}
                <div className="md:col-span-2">
                  <h1 className="text-4xl font-bold text-gray-900 mb-8 tracking-tight">
                    eAson<span className="text-emerald-600">.</span>
                  </h1>
                  <p className="text-gray-600 leading-relaxed max-w-sm mb-10">
                    Nepal’s fastest-growing wholesale platform.
                    <br />
                    Built by Nepalis, for Nepali businesses.
                  </p>
    
                  {/* Socials */}
                  <div className="flex gap-4">
                    {["fb", "ig", "in", "tt"].map((icon) => (
                      <a
                        key={icon}
                        href="#"
                        className="w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-600 transition-all duration-300 shadow-sm hover:shadow-md group"
                      >
                        <span className="text-gray-600 group-hover:text-white text-sm font-bold">
                          {icon === "fb" && "f"}
                          {icon === "ig" && "ig"}
                          {icon === "in" && "in"}
                          {icon === "tt" && "tt"}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
    
                {/* Links */}
                {[
                  {
                    title: "Product",
                    links: ["Features", "Pricing", "Demo", "API"],
                  },
                  {
                    title: "Company",
                    links: ["About Us", "Blog", "Careers", "Press"],
                  },
                  {
                    title: "Support",
                    links: ["Help Center", "Contact", "WhatsApp", "Status"],
                  },
                  {
                    title: "Legal",
                    links: ["Privacy Policy", "Terms", "Licenses", "Compliance"],
                  },
                ].map((col) => (
                  <div key={col.title}>
                    <h4 className="font-semibold text-gray-900 mb-6 text-lg">
                      {col.title}
                    </h4>
                    <ul className="space-y-4">
                      {col.links.map((link) => (
                        <li key={link}>
                          <a
                            href="#"
                            className="text-gray-600 hover:text-emerald-600 transition-colors duration-300 font-medium text-sm tracking-wide"
                          >
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
    
              {/* Bottom Bar – Proud & Clean */}
             
              <div className="mt-20 pt-10 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-8 text-sm">
                  <p className="text-gray-500">
                    © 2025 ASON Technologies • Built in Kathmandu with pride
                  </p>
                  <div className="flex items-center gap-2">
                    <img
                      src={nepalFlag}
                      alt="Nepal Flag"
                      className="w-6 h-4 rounded-sm shadow-sm"
                    />
                    <span className="text-gray-600 font-medium">नेपाल</span>
                  </div>
                </div>
    
                <div className="flex items-center gap-8 text-sm">
                  <a
                    href="#"
                    className="text-gray-500 hover:text-emerald-600 transition"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-emerald-600 transition"
                  >
                    Terms of Service
                  </a>
                </div>
              </div>
            </div>
          </footer>
  );
}