// src/pages/PendingApproval.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const PendingApproval = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Account Under Review</h1>
        <p className="text-gray-600 mb-8">
          Your wholesaler account is pending admin approval. You'll receive an email once it's verified.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-medium hover:bg-emerald-700 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default PendingApproval;