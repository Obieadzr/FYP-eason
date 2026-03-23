// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  // Remove StrictMode wrapper
  <>
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={12}
      toastOptions={{
        duration: 3500,
        style: {
          background: "#000",
          color: "#fff",
          fontSize: "14px",
          fontWeight: "bold",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          borderRadius: "9999px",
          padding: "16px 24px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        },
        success: {
          iconTheme: {
            primary: "#fff",
            secondary: "#000",
          },
        },
      }}
    />
    {/* <AuthProvider> */}
      <CartProvider>
        <App />
      </CartProvider>
    {/* </AuthProvider> */}
  </>
);