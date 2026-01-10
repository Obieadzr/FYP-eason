// src/components/Navbar.jsx
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/marketplace", { replace: true });
    } else {
      navigate("/register"); // or "/login" if you prefer
    }
  };
  return (
   
         <motion.nav
           initial={{ y: -100 }}
           animate={{ y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="fixed inset-x-4 top-4 z-50 mx-auto max-w-7xl rounded-3xl bg-white/90 backdrop-blur-xl shadow-xl border border-gray-100"
         >
           <div className="px-8 py-5 flex items-center justify-between">
             <motion.h1
          onClick={() => navigate("/")}
          className="text-2xl font-bold text-gray-900 cursor-pointer hover:opacity-80 transition"
          whileHover={{ scale: 1.05 }}
        >
          eAson<span className="text-emerald-600">.</span>
        </motion.h1>
             <div className="hidden md:flex gap-10 text-gray-600 font-medium">
               {["How it Works", "Retailers", "Wholesalers", "Contact"].map(
                 (item) => (
                   <a
                     key={item}
                     href="#"
                     className="hover:text-emerald-600 transition"
                   >
                     {item}
                   </a>
                 )
               )}
             </div>
             <button
               className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition shadow-lg"
               onClick={handleGetStarted}
             >
               Get Started Free
             </button>
           </div>
         </motion.nav>
  );
}