// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { CartProvider } from "./context/CartContext.jsx";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <Toaster
      position="bottom-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 3500,
        // Default style — clean minimal white card
        style: {
          fontFamily: "'Inter', -apple-system, sans-serif",
          fontSize: "14px",
          fontWeight: "500",
          letterSpacing: "-0.01em",
          background: "#ffffff",
          color: "#111111",
          borderRadius: "16px",
          padding: "14px 18px",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          maxWidth: "360px",
        },
        // Success = emerald accent
        success: {
          style: {
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontSize: "14px",
            fontWeight: "500",
            letterSpacing: "-0.01em",
            background: "#ffffff",
            color: "#111111",
            borderRadius: "16px",
            padding: "14px 18px",
            border: "1px solid rgba(16,185,129,0.25)",
            boxShadow: "0 8px 32px rgba(16,185,129,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          },
          iconTheme: {
            primary: "#10b981",
            secondary: "#ffffff",
          },
        },
        // Error = red subtle
        error: {
          style: {
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontSize: "14px",
            fontWeight: "500",
            letterSpacing: "-0.01em",
            background: "#ffffff",
            color: "#111111",
            borderRadius: "16px",
            padding: "14px 18px",
            border: "1px solid rgba(239,68,68,0.25)",
            boxShadow: "0 8px 32px rgba(239,68,68,0.10), 0 2px 8px rgba(0,0,0,0.06)",
          },
          iconTheme: {
            primary: "#ef4444",
            secondary: "#ffffff",
          },
        },
        // Loading
        loading: {
          style: {
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontSize: "14px",
            fontWeight: "500",
            letterSpacing: "-0.01em",
            background: "#111111",
            color: "#ffffff",
            borderRadius: "16px",
            padding: "14px 18px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          },
          iconTheme: {
            primary: "#10b981",
            secondary: "#333333",
          },
        },
      }}
    />
    <CartProvider>
      <App />
    </CartProvider>
  </>
);