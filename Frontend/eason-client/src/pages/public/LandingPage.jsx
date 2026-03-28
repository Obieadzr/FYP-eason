// src/pages/public/LandingPage.jsx
import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import {
  ArrowRight, Plus, Package, Store, Warehouse, ShoppingBag,
  CheckCircle, Zap, Shield, Users, ChevronDown,
  MapPin, Mail, Phone,
} from "lucide-react";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────────────────────────────────────── */

const FadeUp = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ─── Social Proof Animated Counter ──────────────────────────────────────── */
function AnimatedStat({ target, prefix = "", suffix = "", label }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  return (
    <div ref={ref} className="flex-1 text-center py-10 px-6 border-r border-gray-200 last:border-r-0">
      <p className="text-4xl md:text-5xl font-bold text-emerald-600 tracking-tighter">
        {prefix}{count.toLocaleString()}{suffix}
      </p>
      <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mt-2">{label}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // Parallax scroll for hero text
  const { scrollY } = useScroll();
  const heroTextY = useTransform(scrollY, [0, 600], [0, 180]);
  const heroBgY   = useTransform(scrollY, [0, 600], [0, 80]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75;
    }
  }, []);

  const trusts = [
    { icon: CheckCircle, label: "Verified Suppliers",  desc: "KYC-cleared wholesalers only. Zero fakes.",  color: "text-emerald-400" },
    { icon: Shield,      label: "Buyer Protection",    desc: "Escrow payments. Full refund if goods don't match.", color: "text-white"      },
    { icon: Zap,         label: "Instant Payments",    desc: "eSewa · Khalti · IME · Fonepay.",            color: "text-emerald-400" },
    { icon: Users,       label: "8,000+ Traders",      desc: "The largest wholesale network in Nepal.",    color: "text-white"       },
  ];

  return (
    <>
      <style>{`
        *, *::before, *::after {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          letter-spacing: -0.01em;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <Navbar />

      {/* ══════════════════════════════════════════════════════════════════
          HERO — full-bleed video, Nike-style bold editorial
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen bg-black overflow-hidden flex flex-col justify-end">

        {/* Video */}
        <motion.div style={{ y: heroBgY }} className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            poster="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&w=1600"
          >
            <source
              src="https://videos.pexels.com/video-files/3252215/3252215-uhd_2560_1440_25fps.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </motion.div>

        {/* Content pinned to bottom-left — Nike style */}
        <motion.div
          style={{ y: heroTextY }}
          className="relative z-10 max-w-screen-2xl mx-auto px-8 md:px-12 pb-20 md:pb-24 w-full"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-white text-xs font-bold tracking-widest uppercase mb-4"
          >
            Nepal's Premium Wholesale Network
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(4rem,14vw,11rem)] font-bold text-white leading-[0.85] tracking-tighter uppercase"
          >
            Just
            <br />
            <em className="not-italic text-emerald-400">Order It.</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-8 text-white/70 text-base md:text-lg font-medium max-w-md leading-relaxed"
          >
            Factory-direct pricing. Real-time stock. No middlemen, no chaos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.8 }}
            className="mt-12 flex flex-wrap gap-4"
          >
            <button
              onClick={() => navigate("/marketplace")}
              className="group flex items-center gap-3 px-10 py-5 bg-white text-black text-xs font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors rounded-none"
            >
              Shop Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-10 py-5 border border-white text-white hover:bg-white hover:text-black text-xs font-bold tracking-widest uppercase transition-colors rounded-none"
            >
              Create Account
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          onClick={() => document.getElementById("stats")?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-6 right-8 z-10 flex items-center gap-2 text-white/50 text-xs cursor-pointer hover:text-white transition-colors"
        >
          <span className="tracking-widest uppercase font-bold text-[10px]">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.button>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SOCIAL PROOF — animated counting stats
      ══════════════════════════════════════════════════════════════════ */}
      <section id="stats" className="bg-white border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
          <AnimatedStat target={8000} suffix="+" label="Active Traders" />
          <AnimatedStat prefix="Rs " target={12000000} suffix="+" label="Daily Volume" />
          <AnimatedStat target={4.9} suffix="★" label="Supplier Rating" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          STATS BAR — matches marketplace dark bar
      ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-black border-y border-white/20">
        <div className="max-w-screen-2xl mx-auto px-8 py-10 flex flex-wrap justify-between items-center gap-8">
          {[
            { val: "8,000+",    label: "Active Traders"      },
            { val: "Rs 1.2Cr+", label: "Daily Trading Volume" },
            { val: "500+",      label: "Verified Products"    },
            { val: "4.9 ★",     label: "Supplier Rating"      },
            { val: "2–4 days",  label: "Delivery Time"       },
          ].map(({ val, label }, i) => (
            <FadeUp key={i} delay={i * 0.06} className="text-center sm:text-left">
              <div>
                <p className="text-3xl font-bold tracking-tighter text-white">{val}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">{label}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          EDITORIAL SPLIT — "Order. Track. Grow." — dark/white
      ══════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="bg-[#111]">
        <div className="max-w-screen-2xl mx-auto">

          {/* Row 1 — big text + description */}
          <div className="grid lg:grid-cols-2 border-b border-white/20">
            <FadeUp className="px-10 py-24 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/20 hover:bg-[#1a1a1a] transition-colors">
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-6">01 — ORDER</p>
              <h2 className="text-5xl md:text-7xl font-bold text-white leading-none tracking-tighter uppercase">
                Buy direct.<br />
                Pay fast.
              </h2>
              <p className="mt-8 text-gray-400 text-sm font-medium leading-relaxed max-w-sm">
                Browse hundreds of wholesale products from KYC-verified nepali suppliers. Add to cart in seconds. Pay with Khalti, eSewa, or COD.
              </p>
              <button
                onClick={() => navigate("/marketplace")}
                className="mt-12 self-start group flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest border-b-2 border-transparent hover:border-emerald-400 transition-colors pb-1"
              >
                Browse Marketplace <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </FadeUp>

            <FadeUp delay={0.1} className="px-10 py-24 flex flex-col justify-center bg-[#0a0a0a] hover:bg-[#111] transition-colors">
              <p className="text-xs text-white/50 font-bold uppercase tracking-widest mb-6">02 — TRACK</p>
              <h2 className="text-5xl md:text-7xl font-bold text-white leading-none tracking-tighter uppercase">
                Every order.<br />
                Accounted for.
              </h2>
              <p className="mt-8 text-gray-400 text-sm font-medium leading-relaxed max-w-sm">
                Real-time order tracking, live stock updates, and instant notifications — so you never get surprised by an empty shelf again.
              </p>
              <button
                onClick={() => navigate("/register")}
                className="mt-12 self-start group flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest border-b-2 border-transparent hover:border-white transition-colors pb-1"
              >
                Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </FadeUp>
          </div>

          {/* Row 2 — full width "03 GROW" */}
          <FadeUp className="px-10 py-32 border-b border-white/20 text-center bg-black hover:bg-[#050505] transition-colors">
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-8">03 — GROW</p>
            <h2 className="text-6xl md:text-[8rem] lg:text-[11rem] font-bold text-white leading-none tracking-tighter uppercase">
              More margin.
              <br />
              <span className="text-emerald-400">Less hustle.</span>
            </h2>
            <button
              onClick={() => navigate("/register")}
              className="mt-16 inline-flex items-center gap-3 px-12 py-5 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-none hover:bg-gray-200 transition-colors"
            >
              Join Free <ArrowRight className="w-5 h-5" />
            </button>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          TRUST PILLS — white section
      ══════════════════════════════════════════════════════════════════ */}
      <section id="why-us" className="bg-white py-32 border-b border-black">
        <div className="max-w-screen-2xl mx-auto px-8">
          <FadeUp>
            <p className="text-sm font-bold uppercase tracking-widest text-black mb-12 border-b-4 border-black inline-block pb-2">Why Traders Choose Us</p>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-gray-200">
            {trusts.map(({ icon: Icon, label, desc }, i) => (
              <FadeUp key={i} delay={i * 0.07}>
                <div className="bg-white p-10 h-full flex flex-col gap-6 border-b border-r border-gray-200 hover:bg-gray-50 transition-colors">
                  <Icon className="w-8 h-8 text-black" />
                  <h3 className="text-lg font-bold uppercase tracking-tighter text-black">{label}</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          DUAL: RETAILER + SUPPLIER — dark
      ══════════════════════════════════════════════════════════════════ */}
      <section id="retailers" className="bg-white py-32">
        <div className="max-w-screen-2xl mx-auto px-8">
          <FadeUp className="mb-16">
            <h2 className="text-5xl md:text-7xl font-bold text-black leading-tight tracking-tighter uppercase">
              One platform.
              <br />
              <span className="text-gray-400">Two realities.</span>
            </h2>
          </FadeUp>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Retailer */}
            <FadeUp delay={0.08}>
              <div className="group relative bg-[#f9f9f9] border-t-8 border-black rounded-none overflow-hidden hover:bg-gray-100 transition-colors h-full">
                <div className="p-10 md:p-16">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black flex items-center justify-center">
                        <Store className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-bold uppercase tracking-widest text-black">For Retailers</span>
                    </div>
                  </div>

                  <h3 className="text-4xl md:text-5xl font-bold text-black mb-4 leading-none tracking-tighter uppercase">Order in seconds.</h3>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-12">No calls, no travel, no chaos.</p>

                  {/* Mock order row */}
                  <div className="space-y-4 mb-12">
                    {[
                      { name: "Dabur Chyawanprash 1kg",  price: "Rs 2,340", tag: "12 IN STOCK" },
                      { name: "Surf Excel Matic 4L",      price: "Rs 3,100", tag: "HOT" },
                      { name: "Head & Shoulders 180ml",   price: "Rs 1,890", tag: null },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 bg-white border border-gray-200 transition-colors p-4 cursor-pointer">
                        <div className="w-12 h-12 bg-[#f9f9f9] border border-gray-100 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold uppercase tracking-widest text-black">{item.name}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold tracking-tight text-black">{item.price}</p>
                          {item.tag && (
                            <span className={`text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 border ${item.tag === "HOT" ? "text-red-600 border-red-600" : "text-gray-500 border-gray-200"}`}>
                              {item.tag}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate("/marketplace")}
                    className="w-full py-5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 rounded-none"
                  >
                    <ShoppingBag className="w-4 h-4" /> Start Shopping
                  </button>
                </div>
              </div>
            </FadeUp>

            {/* Supplier */}
            <FadeUp delay={0.15}>
              <div id="suppliers" className="relative bg-black rounded-none overflow-hidden h-full">
                <div className="relative p-10 md:p-16 text-white h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-12">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white flex items-center justify-center">
                          <Warehouse className="w-5 h-5 text-black" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest">For Wholesalers</span>
                      </div>
                    </div>

                    <h3 className="text-4xl md:text-5xl font-bold leading-none tracking-tighter uppercase mb-2">List products.</h3>
                    <h3 className="text-4xl md:text-5xl font-bold leading-none tracking-tighter text-emerald-400 uppercase mb-4">Watch it sell.</h3>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-12">Real-time orders · Stock alerts · Instant payouts</p>

                    {/* Dashboard stats */}
                    <div className="grid grid-cols-3 gap-4 mb-10">
                      {[
                        { val: "87",     sub: "Products"    },
                        { val: "Rs 48L", sub: "This Month"  },
                        { val: "6",      sub: "Low Stock"   },
                      ].map(({ val, sub }, i) => (
                        <div key={i} className="border border-white/20 p-5 text-center">
                          <p className="text-2xl font-bold tracking-tighter">{val}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">{sub}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-auto">
                    <button
                      onClick={() => navigate("/register")}
                      className="flex-1 py-5 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors rounded-none"
                    >
                      Join as Supplier
                    </button>
                    <button
                      onClick={() => navigate("/marketplace")}
                      className="px-6 py-5 border border-white/30 hover:bg-white hover:text-black transition-colors flex items-center justify-center rounded-none"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          TESTIMONIALS — stark
      ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#111] py-32 overflow-hidden border-t border-white/20">
        <div className="max-w-screen-2xl mx-auto px-8 mb-16">
          <FadeUp>
            <p className="text-sm font-bold uppercase tracking-widest text-white mb-4 border-b-4 border-white inline-block pb-2">What Traders Say</p>
          </FadeUp>
        </div>
        <div className="w-full overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
            {[...Array(2)].map((_, arrayIdx) => (
              <React.Fragment key={arrayIdx}>
                {[
                  { q: "Saved me 5 hours every week. No more 5AM market trips.", n: "Ramesh K.",  r: "Retailer · Asan, KTM"       },
                  { q: "Orders flow while I sleep. This is how business should feel.", n: "Sunita M.",  r: "Wholesaler · Bhotebahal"    },
                  { q: "Prices are real. No bargaining nonsense. Love it.", n: "Bikash T.",  r: "Retailer · Kalimati"         },
                  { q: "My stock reaches shops I didn't even know existed.", n: "Priya S.",   r: "Supplier · Newroad, KTM"    },
                  { q: "Cart to checkout in under 2 minutes. Insane.", n: "Anil R.",   r: "Retailer · Patan"            },
                ].map((t, i) => (
                  <div
                    key={`${arrayIdx}-${i}`}
                    className="relative shrink-0 min-w-[360px] mx-3 border border-white/10 p-8 bg-[#111] rounded-2xl border-l-2 border-l-emerald-500/40 hover:bg-[#1a1a1a] transition-colors"
                  >
                    <span className="absolute top-4 left-6 text-emerald-400 text-5xl font-serif">"</span>
                    <p className="text-lg font-medium text-white leading-tight mb-8 mt-4 relative z-10">{t.q}</p>
                    <div>
                      <p className="text-sm font-bold text-white uppercase">{t.n}</p>
                      <p className="text-xs text-emerald-400 uppercase tracking-widest mt-1">{t.r}</p>
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FINAL CTA — full black, massive type, Nike-like
      ══════════════════════════════════════════════════════════════════ */}
      <section id="contact-cta" className="bg-white relative overflow-hidden py-32 border-t border-black">
        <div className="max-w-screen-2xl mx-auto px-8">
          <FadeUp>
            <h2 className="text-[clamp(4.5rem,14vw,11rem)] font-bold text-black leading-[0.85] tracking-tighter uppercase mb-10">
              No more<br />
              <span className="text-gray-300">5 AM.</span>
            </h2>

            <p className="text-gray-500 text-lg font-bold tracking-widest uppercase max-w-lg leading-relaxed mb-16">
              8,000+ shops already quit the market rush.
              Built in Nepal. For Nepal.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/register")}
                className="group flex items-center gap-3 px-12 py-6 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors rounded-none"
              >
                Start for Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/marketplace")}
                className="flex items-center gap-3 px-12 py-6 border-2 border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors rounded-none"
              >
                Browse Marketplace
              </button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          CONTACT FORM SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <section id="contact" className="bg-white py-32 border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-6 md:px-8 grid lg:grid-cols-2 gap-16 lg:gap-24">
          <FadeUp>
            <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mb-6">Get in touch</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-black mb-6">
              We'd love to hear from you.
            </h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-sm mb-12">
              Whether you're a retailer looking to source wholesale or a supplier wanting to list your products — reach out and we'll get back to you within 24 hours.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-sm text-gray-700 font-medium">Kathmandu, Bagmati Province, Nepal</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-sm text-gray-700 font-medium">hello@eason.com.np</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-sm text-gray-700 font-medium">+977 9800000000</p>
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  if(!fd.get("name") || !fd.get("email") || !fd.get("role") || !fd.get("message")) {
                    toast.error("Please fill in all fields.");
                    return;
                  }
                  toast.success("Message sent! We'll reply within 24 hours.");
                  e.target.reset();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">Full Name</label>
                  <input name="name" type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">Email</label>
                  <input name="email" type="email" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">Role</label>
                  <select name="role" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition bg-white cursor-pointer hover:border-gray-300">
                    <option value="">Select your role...</option>
                    <option value="retailer">I'm a Retailer</option>
                    <option value="supplier">I'm a Supplier</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">Message</label>
                  <textarea name="message" rows="5" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition resize-none" />
                </div>
                <button type="submit" className="w-full bg-black text-white rounded-xl py-4 font-semibold hover:bg-gray-900 transition mt-2">
                  Send Message
                </button>
              </form>
            </div>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </>
  );
}
