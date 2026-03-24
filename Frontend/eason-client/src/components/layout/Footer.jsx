// src/components/layout/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import nepalFlag from "../../assets/nepal.png";

const cols = [
  { title: "Platform",  links: ["Marketplace",    "How it Works", "Pricing",   "API"]          },
  { title: "Company",   links: ["About Us",       "Blog",         "Careers",   "Press"]         },
  { title: "Support",   links: ["Help Center",    "Contact",      "WhatsApp",  "System Status"] },
  { title: "Legal",     links: ["Privacy Policy", "Terms",        "Licenses",  "Compliance"]    },
];

const SocialFacebook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const SocialInstagram = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const SocialLinkedIn = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>
  </svg>
);
const SocialX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const socials = [
  { label: "Facebook",  href: "#", Icon: SocialFacebook  },
  { label: "Instagram", href: "#", Icon: SocialInstagram },
  { label: "LinkedIn",  href: "#", Icon: SocialLinkedIn  },
  { label: "X",         href: "#", Icon: SocialX         },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white overflow-hidden">
      {/* Big brand statement */}
      <div className="max-w-screen-xl mx-auto px-8 pt-24 pb-12 border-b border-white/8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-5">
              Built in Kathmandu, Nepal 🇳🇵
            </p>
            <h2 className="text-5xl md:text-7xl font-light text-white leading-none tracking-tighter">
              eAson<span className="text-emerald-400 font-semibold">.</span>
            </h2>
            <p className="mt-5 text-white/40 text-base max-w-sm leading-relaxed">
              Nepal's fastest-growing wholesale platform.
              Built by Nepalis, for Nepali businesses.
            </p>

            {/* Socials */}
            <div className="flex gap-3 mt-8">
              {socials.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  whileHover={{ scale: 1.1, backgroundColor: "#10b981" }}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:text-white transition-colors"
                >
                  <s.Icon />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="max-w-sm w-full">
            <p className="text-sm font-semibold text-white mb-2">Stay in the loop</p>
            <p className="text-xs text-white/40 mb-4">Get the latest wholesale deals and updates.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-white/6 border border-white/12 text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500/50"
              />
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="px-5 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition shrink-0"
              >
                Join
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Link columns */}
      <div className="max-w-screen-xl mx-auto px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-10 border-b border-white/8">
        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-white/30 mb-5 font-semibold">
              {col.title}
            </h4>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="max-w-screen-xl mx-auto px-8 py-7 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={nepalFlag} alt="Nepal" className="w-5 h-3.5 rounded-sm opacity-70" />
          <p className="text-xs text-white/25">© 2025 eAson Technologies · Made with ♥ in Kathmandu</p>
        </div>
        <div className="flex gap-6">
          {["Privacy Policy", "Terms of Service", "Sitemap"].map((l) => (
            <a key={l} href="#" className="text-xs text-white/25 hover:text-white/60 transition">
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}