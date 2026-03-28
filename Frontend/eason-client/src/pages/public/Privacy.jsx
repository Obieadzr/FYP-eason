import React from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

export default function Privacy() {
  return (
    <div className="bg-white min-h-screen text-black">
      <Navbar />

      <section className="pt-40 pb-20 px-6 max-w-screen-md mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-4">Privacy Policy</h1>
        <p className="text-gray-500 mb-12 uppercase tracking-widest text-xs font-bold">Last Updated: March 2026</p>

        <article className="prose prose-emerald lg:prose-lg max-w-none text-gray-700">
          <p className="lead text-xl text-gray-900 font-medium mb-8">
            eAson Technologies respects your privacy. This document outlines how we collect, use, and protect your data when you use the eAson B2B wholesale platform.
          </p>

          <h2 className="text-2xl font-bold text-black uppercase tracking-tighter mt-12 mb-4">1. Information We Collect</h2>
          <p className="mb-6">During registration and usage, we collect:</p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li><strong>Identity Data:</strong> Full name, business name, PAN/VAT certificates, citizenship copies for KYC verification.</li>
            <li><strong>Contact Data:</strong> Email addresses, phone numbers, and physical delivery coordinates.</li>
            <li><strong>Financial Data:</strong> Bank account details for supplier payouts. We do not store eSewa/Khalti PINs or passwords.</li>
            <li><strong>Usage Data:</strong> Search queries, cart activity, and interaction logs for platform optimization.</li>
          </ul>

          <h2 className="text-2xl font-bold text-black uppercase tracking-tighter mt-12 mb-4">2. How We Use Your Data</h2>
          <p className="mb-6">Your data is strictly used to facilitate B2B trade:</p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>To verify the legitimacy of buyers and sellers to prevent fraud.</li>
            <li>To process payments and generate legal tax invoices.</li>
            <li>To provide customer support and resolve order disputes.</li>
          </ul>

          <h2 className="text-2xl font-bold text-black uppercase tracking-tighter mt-12 mb-4">3. Data Sharing</h2>
          <p className="mb-8">
            We share relevant delivery information (Name, Phone, Address) with our logistic partners strictly for order fulfillment. We do not sell your data to third-party ad networks. In the event of legal disputes, we comply with requests from government authorities under the jurisdiction of Nepal.
          </p>

          <h2 className="text-2xl font-bold text-black uppercase tracking-tighter mt-12 mb-4">4. Your Rights</h2>
          <p className="mb-8">
            You have the right to request a copy of your personal data or request account deletion. Note that transaction ledgers must be retained for 5 years per Nepal Rastra Bank regulations regarding digital B2B transactions.
          </p>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-12">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Contact Privacy Officer</p>
            <p className="text-sm text-gray-600">If you have concerns about your data, email us directly at <strong>privacy@eason.com.np</strong>.</p>
          </div>
        </article>
      </section>

      <Footer />
    </div>
  );
}
