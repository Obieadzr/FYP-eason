// src/pages/public/LandingPage.jsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { ArrowRight } from "lucide-react";

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function Reveal({ children, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 800ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 800ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const LP_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

.lp, .lp * {
  font-family: 'DM Sans', system-ui, sans-serif;
}
body {
  background: #0a0a0a;
  color: #fff;
  overflow-x: hidden;
}
::selection {
  background: rgba(16, 185, 129, 0.3);
  color: #fff;
}
.btn-primary {
  background: #fff;
  color: #0a0a0a;
  border: none;
  border-radius: 4px;
  padding: 16px 32px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
.btn-secondary {
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 4px;
  padding: 16px 32px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
}
.btn-secondary:hover {
  border-color: #fff;
  background: rgba(255,255,255,0.05);
}
.img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.img-wrap:hover img {
  transform: scale(1.03);
}
.story-text {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  line-height: 1.2;
  letter-spacing: -0.02em;
  font-weight: 500;
  color: #fff;
}
.story-sub {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255,255,255,0.6);
  max-width: 400px;
}
`;

// ── Component ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const nav = useNavigate();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <>
      <style>{LP_CSS}</style>
      <div className="lp">
        <Navbar />

        <main>
        {/* ══ 1. HERO SECTION ═══════════════════════════════════════════════ */}
        <section className="relative min-h-[110vh] flex flex-col justify-center items-center px-6 lg:px-16 pt-32 pb-32 overflow-hidden" style={{ background: "#0a0a0a" }}>

          {/* Grid Overlay & Glows */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 20%, black 20%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 20%, black 20%, transparent 80%)"
          }} />
          <div className="absolute top-[10%] left-[30%] w-[500px] h-[500px] bg-[#10b981] rounded-full blur-[140px] opacity-[0.06] pointer-events-none" />
          <div className="absolute top-[20%] right-[30%] w-[400px] h-[400px] bg-[#8b5cf6] rounded-full blur-[140px] opacity-[0.04] pointer-events-none" />

          <div className="relative z-10 w-full max-w-[1000px] flex flex-col items-center text-center">

            <motion.h1
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)", fontWeight: 500, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 24, color: "#fff" }}
            >
              The infrastructure for <br />
              <span style={{ color: "rgba(255,255,255,0.4)" }}>modern wholesale.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }}
              style={{ fontSize: "clamp(1rem, 2vw, 1.15rem)", color: "rgba(255,255,255,0.5)", maxWidth: 480, lineHeight: 1.6, marginBottom: 48, fontWeight: 400 }}
            >
              Connect directly with verified suppliers. Factory pricing, live inventory, and seamless digital ordering built for scale.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 mb-24">
              <Link className="btn-primary group" to="/register">
                Create Account <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link className="btn-secondary" to="/marketplace">
                Explore Marketplace
              </Link>
            </motion.div>

            {/* Editorial Grid Visual (Odd Ritual style) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[1200px] mt-8"
            >
              <div className="flex flex-col md:flex-row gap-6 h-auto md:h-[600px] w-full text-left">

                {/* Left Large Column (50%) */}
                <div className="w-full md:w-1/2 flex flex-col gap-3 group cursor-pointer h-[400px] md:h-full">
                  <h3 className="text-[13px] font-bold tracking-tight text-white">OUR PRODUCTS</h3>
                  <div className="relative w-full h-full overflow-hidden bg-[#111]">
                    <img
                      src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80"
                      alt="Wholesale products"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center z-10">
                      <span className="text-[12px] font-bold tracking-wider text-white">FMCG & GROCERIES</span>
                      <span className="text-[11px] font-bold tracking-widest text-white/70 group-hover:text-white transition-colors">[ EXPLORE ]</span>
                    </div>
                  </div>
                </div>

                {/* Middle Column (25%) */}
                <div className="w-full md:w-1/4 flex flex-col gap-3 group cursor-pointer h-[400px] md:h-full">
                  <h3 className="text-[13px] font-bold tracking-tight text-white">THE INFRASTRUCTURE</h3>
                  <div className="relative w-full h-full overflow-hidden bg-[#111]">
                    <img
                      src="https://images.pexels.com/photos/4481534/pexels-photo-4481534.jpeg?auto=compress&cs=tinysrgb&w=800"
                      alt="Warehouse"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 z-10">
                      <span className="text-[12px] font-bold tracking-wider text-white">LOGISTICS</span>
                    </div>
                  </div>
                </div>

                {/* Right Column (25%) */}
                <div className="w-full md:w-1/4 flex flex-col gap-3 group cursor-pointer h-[400px] md:h-full">
                  <h3 className="text-[13px] font-bold tracking-tight text-white">OUR NETWORK</h3>
                  <div className="relative w-full h-full overflow-hidden bg-[#111]">
                    <img
                      src="https://images.pexels.com/photos/1036371/pexels-photo-1036371.jpeg?auto=compress&cs=tinysrgb&w=800"
                      alt="Retailers"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 z-10">
                      <span className="text-[12px] font-bold tracking-wider text-white">SUPPLIERS</span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </section>


        {/* ══ 2. PRODUCT STORY SECTION ═══════════════════════════════════════ */}
        <section className="py-32 px-6 lg:px-16" style={{ background: "#0a0a0a" }}>
          <div className="max-w-[1200px] mx-auto">

            {/* Story Block 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24 mb-32">
              <div className="flex-1 img-wrap overflow-hidden aspect-[4/5] bg-[#111]">
                <img src="https://images.pexels.com/photos/3167310/pexels-photo-3167310.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Stack of goods" />
              </div>
              <div className="flex-1">
                <Reveal>
                  <p style={{ color: "#10b981", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 24 }}>The Reality</p>
                  <h2 className="story-text mb-8">
                    From warehouses to your shelves — <span style={{ color: "rgba(255,255,255,0.4)" }}>without the middle chaos.</span>
                  </h2>
                  <p className="story-sub">
                    We strip away the layers of distributors and agents. You see the inventory, you see the factory price, you order. It's the physical supply chain, fully digitized.
                  </p>
                </Reveal>
              </div>
            </div>

            {/* Story Block 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
              <div className="flex-1 img-wrap overflow-hidden aspect-[4/5] bg-[#111]">
                <img src="https://images.pexels.com/photos/4481534/pexels-photo-4481534.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Logistics delivery" />
              </div>
              <div className="flex-1">
                <Reveal>
                  <p style={{ color: "#8b5cf6", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 24 }}>The Execution</p>
                  <h2 className="story-text mb-8">
                    Built for the scale of <br /><span style={{ color: "rgba(255,255,255,0.4)" }}>real business.</span>
                  </h2>
                  <p className="story-sub">
                    No gimmicks. Just deep inventory from verified suppliers, reliable logistics tracking, and accounting-ready invoicing. Order a single carton or a full truckload.
                  </p>
                </Reveal>
              </div>
            </div>

          </div>
        </section>


        {/* ══ 3. THE OLD WAY VS NEW WAY ══════════════════════════════════════ */}
        <section className="py-40 px-6 lg:px-16" style={{ background: "#111" }}>
          <div className="max-w-[1000px] mx-auto text-center">
            <Reveal>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 500, letterSpacing: "-0.03em", marginBottom: 80 }}>
                A shift in how <br />trade happens.
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 text-left">
              {[
                { old: "Waking up at 5 AM to physically visit wholesale markets.", new: "Sourcing inventory from your phone, 24/7." },
                { old: "Guessing prices based on who you talk to.", new: "Transparent, universal pricing for all verified retailers." },
                { old: "Calling 5 different people to track a late delivery.", new: "Live order tracking from warehouse to your doorstep." },
                { old: "Dealing with fragmented cash payments and handwritten bills.", new: "Clean digital invoicing with instant payment options." }
              ].map((item, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
                    <p style={{ fontSize: 18, color: "rgba(255,255,255,0.3)", textDecoration: "line-through", lineHeight: 1.4 }}>{item.old}</p>
                    <p style={{ fontSize: 18, color: "#10b981", fontWeight: 500, lineHeight: 1.4 }}>{item.new}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>


        {/* ══ 4. REAL DATA ═══════════════════════════════════════════════════ */}
        <section className="py-32 px-6 lg:px-16" style={{ background: "#0a0a0a" }}>
          <div className="max-w-[1200px] mx-auto">
            <Reveal>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                  { label: "Active Suppliers", val: "142", sub: "KYC Verified" },
                  { label: "Listed Products", val: "4,800+", sub: "Live inventory" },
                  { label: "Orders Delivered", val: "12.5k", sub: "This quarter" }
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col border-l border-white/10 pl-8">
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>{stat.label}</p>
                    <p style={{ fontSize: "clamp(3rem, 5vw, 4rem)", fontWeight: 400, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1, marginBottom: 8 }}>{stat.val}</p>
                    <p style={{ fontSize: 12, color: "#10b981", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.sub}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>


        {/* ══ 5. FOR RETAILERS / SUPPLIERS SPLIT ═════════════════════════════ */}
        <section className="py-32 px-6 lg:px-16" style={{ background: "#0a0a0a" }}>
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Retailers */}
            <Reveal>
              <div className="bg-[#111] p-12 lg:p-20 flex flex-col h-full border border-white/5 hover:border-white/10 transition-colors">
                <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>Retailers</p>
                <h3 style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)", fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 24 }}>
                  Stock your shop, <br />stress-free.
                </h3>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,0.6)", marginBottom: 48, flex: 1 }}>
                  Find the products your customers want. Compare factory prices instantly. Restock in seconds. Let us handle the delivery logistics so you can focus on selling.
                </p>
                <Link className="btn-secondary self-start" to="/marketplace">Browse Catalog</Link>
              </div>
            </Reveal>

            {/* Suppliers */}
            <Reveal delay={100}>
              <div className="bg-[#111] p-12 lg:p-20 flex flex-col h-full border border-white/5 hover:border-white/10 transition-colors relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#10b981] rounded-full blur-[120px] opacity-[0.03] pointer-events-none" />
                <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>Suppliers</p>
                <h3 style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)", fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 24 }}>
                  Reach every shop. <br />Instantly.
                </h3>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,0.6)", marginBottom: 48, flex: 1 }}>
                  List your inventory once and get discovered by thousands of verified retailers across the country. Digital invoicing, automated stock alerts, and guaranteed payments.
                </p>
                <Link className="btn-primary self-start group" to="/register">Become a Partner <ArrowRight size={16} className="ml-1 hidden group-hover:inline-block transition-transform duration-300 group-hover:translate-x-1" /></Link>
              </div>
            </Reveal>

          </div>
        </section>


        {/* ══ 6. TESTIMONIALS ════════════════════════════════════════════════ */}
        <section className="py-40 px-6 lg:px-16" style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="max-w-[1000px] mx-auto text-center">
            <Reveal>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 500, letterSpacing: "-0.03em", marginBottom: 80 }}>
                The people building <br />their business on eAson.
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-left">
              <Reveal>
                <p style={{ fontSize: 20, fontStyle: "italic", lineHeight: 1.6, color: "rgba(255,255,255,0.9)", marginBottom: 24 }}>
                  "It feels entirely different. I used to spend hours negotiating over the phone just to get basic stock. Now I open the site, click reorder, and it's done. It just works."
                </p>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Suman Karki</p>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Grocery Retailer, Kathmandu</p>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <p style={{ fontSize: 20, fontStyle: "italic", lineHeight: 1.6, color: "rgba(255,255,255,0.9)", marginBottom: 24 }}>
                  "We had stock sitting in our warehouse that local shops didn't even know we carried. eAson gave us direct visibility to hundreds of new buyers overnight."
                </p>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Priya Traders</p>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>FMCG Wholesaler, Lalitpur</p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>


        {/* ══ 7. FINAL CTA ═══════════════════════════════════════════════════ */}
        <section className="py-40 px-6 lg:px-16" style={{ background: "#111" }}>
          <div className="max-w-[800px] mx-auto text-center">
            <Reveal>
              <h2 style={{ fontSize: "clamp(3.5rem, 6vw, 5rem)", fontWeight: 500, letterSpacing: "-0.04em", lineHeight: 1, color: "#fff", marginBottom: 40 }}>
                Start sourcing smarter.
              </h2>
              <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", marginBottom: 56 }}>
                Join the network of modern retailers and suppliers today.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link className="btn-primary group" to="/register">Create Account <ArrowRight size={16} className="ml-1 hidden group-hover:inline-block transition-transform duration-300 group-hover:translate-x-1" /></Link>
                <Link className="btn-secondary" to="/marketplace">View Products</Link>
              </div>
            </Reveal>
          </div>
        </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
