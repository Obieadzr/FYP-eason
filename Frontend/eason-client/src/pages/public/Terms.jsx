import React from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

export default function Terms() {
  return (
    <div className="bg-white min-h-screen text-black">
      <Navbar />

      <section className="pt-40 pb-20 px-6 max-w-screen-md mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-4">Terms of Service</h1>
        <p className="text-gray-500 mb-12 uppercase tracking-widest text-xs font-bold">Effective Date: March 2026</p>

        <article className="prose prose-emerald lg:prose-lg max-w-none text-gray-700">
          <p className="lead text-xl text-gray-900 font-medium mb-8">
            By accessing or using the eAson platform, you agree to be bound by these B2B wholesale terms of service.
          </p>

          <h2 className="text-2xl font-bold text-black uppercase tracking-tighter mt-12 mb-4">1. Eligibility & KYC</h2>
          <p className="mb-8">
            eAson is a strict B2B marketplace. Users must represent a legally registered business in Nepal. We reserve the right to suspend accounts that fail to provide legitimate PAN/VAT credentials or business registration certificates upon request.
          </p>

          <h2 className="text-2xl font-bold text-black uppercase tracking-tighter mt-12 mb-4">2. Vendor Responsibilities</h2>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li><strong>Accuracy:</strong> Suppliers must ensure prices, MOQs, and stock availability are accurate in real-time.</li>
            <li><strong>Quality:</strong> Listing counterfeit or expired goods is strictly prohibited and equates to immediate platform ban.</li>
            <li><strong>Fulfillment:</strong> Suppliers must pack and dispatch approved orders within their stated handling times (default 24 hours).</li>
          </ul>

          <h2 className="text-2xl font-bold text-black uppercase tracking-tighter mt-12 mb-4">3. Buyer Responsibilities</h2>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li><strong>Payments:</strong> Retailers must clear payments promptly for COD or digital integrations.</li>
            <li><strong>Returns:</strong> Wholesale return requests are only valid for damaged goods or incorrect variants, reported within 48 hours of delivery. Buyer's remorse is not a valid wholesale return reason.</li>
          </ul>

          <h2 className="text-2xl font-bold text-black uppercase tracking-tighter mt-12 mb-4">4. Platform Fees & Settlements</h2>
          <p className="mb-8">
            eAson charges a fixed commission rate to suppliers for successful transactions. Settlements to supplier bank accounts execute within T+2 business days after logistics confirmation. eAson acts as a marketplace facilitator, not the seller of record.
          </p>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-12">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Legal Jurisdiction</p>
            <p className="text-sm text-gray-600">Any disputes arising under these terms are subject to the exclusive jurisdiction of the courts located in Kathmandu, Nepal.</p>
          </div>
        </article>
      </section>

      <Footer />
    </div>
  );
}
