import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Upload, FileText, CheckCircle, ShieldAlert, ArrowRight, Loader2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../utils/api";
import toast from "react-hot-toast";

export default function PendingApproval() {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [formData, setFormData] = useState({
    shopName: user?.shopName || "",
    panNumber: user?.panNumber || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  
  const [panFile, setPanFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);

  // Re-fetch user status actively
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await API.get('/kyc/status');
        setKycStatus(res.data);
      } catch (err) { }
    };
    fetchStatus();
    checkAuth();
  }, []);

  // If verified, throw them out
  useEffect(() => {
    if (user?.verified) {
      navigate(user.role === 'wholesaler' ? '/wholesaler' : '/marketplace');
    }
  }, [user, navigate]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'pan') setPanFile(file);
      else setLicenseFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!panFile || !licenseFile) {
      return toast.error("Please upload both your PAN Card and Business License");
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('panDocument', panFile);
      data.append('businessLicense', licenseFile);
      data.append('shopName', formData.shopName);
      data.append('panNumber', formData.panNumber);
      data.append('phone', formData.phone);
      data.append('address', formData.address);

      await API.post('/kyc/submit', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success("Documents submitted successfully!");
      
      // Update local state to show under review
      setKycStatus({ ...kycStatus, panVerificationStatus: 'pending', licenseVerificationStatus: 'pending' });
      await checkAuth(); // rehydrate user object
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit documents");
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = kycStatus?.panVerificationStatus || user?.panVerificationStatus || 'not_submitted';
  const isRejected = currentStatus === 'rejected';
  
  // If Not Submitted or Rejected
  if (currentStatus === 'not_submitted' || isRejected) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="w-full max-w-4xl bg-white shadow-xl shadow-gray-200/50 rounded-[40px] overflow-hidden flex flex-col md:flex-row border border-gray-100">
          
          {/* Left Panel */}
          <div className="md:w-5/12 bg-[#080808] p-10 md:p-14 text-white flex flex-col justify-between">
            <div>
              <div className="text-xl font-bold tracking-widest uppercase mb-16">
                eAson<span className="text-emerald-400">.</span>
              </div>
              <h2 className="text-3xl font-light leading-tight mb-4">
                Complete your <br />
                <span className="font-semibold text-emerald-400">Business Profile</span>
              </h2>
              <p className="text-white/60 text-sm leading-relaxed mb-12">
                As a B2B wholesale marketplace, we require all our suppliers to verify their tax and business registration details to maintain a safe ecosystem.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-white/80">Automated AI Verification</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-white/80">Approved in under 24 hours</p>
              </div>
            </div>
          </div>

          {/* Right Panel (Form) */}
          <div className="md:w-7/12 p-10 md:p-14 bg-white relative">
            <h3 className="text-xl font-bold text-gray-900 mb-8 tracking-tight">Business Details</h3>
            
            {isRejected && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-800">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Previous Submission Rejected</h4>
                  <p className="text-sm mt-1">{kycStatus?.rejectionReason || user?.rejectionReason || "Documents were unclear or invalid. Please upload them again."}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">Shop Name</label>
                  <input required placeholder="e.g. Nepal Trading Concern" value={formData.shopName} onChange={e => setFormData({ ...formData, shopName: e.target.value })} className="w-full bg-gray-50 border border-gray-200 px-4 py-3.5 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">PAN Number</label>
                  <input required placeholder="9-digit PAN" value={formData.panNumber} onChange={e => setFormData({ ...formData, panNumber: e.target.value })} className="w-full bg-gray-50 border border-gray-200 px-4 py-3.5 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">Phone</label>
                  <input required placeholder="+977" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-gray-50 border border-gray-200 px-4 py-3.5 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">Address</label>
                  <input required placeholder="e.g. New Road, Kathmandu" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full bg-gray-50 border border-gray-200 px-4 py-3.5 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-4">Official Documents</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* PAN Upload */}
                  <label className={`relative flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${panFile ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300'}`}>
                     {panFile ? (
                        <>
                          <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                          <span className="text-sm font-semibold text-emerald-700 truncate w-3/4 text-center">{panFile.name}</span>
                        </>
                     ) : (
                        <>
                          <Upload className="w-6 h-6 text-gray-400 mb-2" />
                          <span className="text-sm font-medium text-gray-600">Upload PAN Card</span>
                          <span className="text-xs text-gray-400 mt-1">JPEG/PNG/PDF</span>
                        </>
                     )}
                     <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => handleFileChange(e, 'pan')} />
                  </label>

                  {/* License Upload */}
                  <label className={`relative flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${licenseFile ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300'}`}>
                     {licenseFile ? (
                        <>
                          <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                          <span className="text-sm font-semibold text-emerald-700 truncate w-3/4 text-center">{licenseFile.name}</span>
                        </>
                     ) : (
                        <>
                          <FileText className="w-6 h-6 text-gray-400 mb-2" />
                          <span className="text-sm font-medium text-gray-600">Business License</span>
                          <span className="text-xs text-gray-400 mt-1">JPEG/PNG/PDF</span>
                        </>
                     )}
                     <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => handleFileChange(e, 'license')} />
                  </label>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 mt-4 bg-black text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-gray-900 transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isRejected ? "Resubmit for Review" : "Submit Verification"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Pending Review Screen
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 p-10 max-w-md w-full text-center border border-gray-100 relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60" />

        <div className="w-24 h-24 mx-auto mb-8 relative">
           <svg className="absolute inset-0 w-full h-full text-emerald-100 animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 4" />
           </svg>
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-16 h-16 bg-emerald-500 rounded-2xl rotate-12 flex items-center justify-center shadow-lg shadow-emerald-500/20">
               <ShieldAlert className="w-8 h-8 text-white -rotate-12" />
             </div>
           </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Profile Under Review</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Your uploaded PAN and Business Registration documents are currently being scanned by our automated KYC engine. You'll be approved within a few hours.
        </p>

        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 text-left border border-gray-100">
           <Info className="w-5 h-5 text-emerald-500 shrink-0" />
           <p className="text-xs text-gray-600 font-medium">Sit tight! We will email you at <strong>{user?.email}</strong> the moment your account is activated.</p>
        </div>

        <button
          onClick={() => {
             // For testing: we can allow them to return to marketplace in restricted mode
             navigate("/marketplace");
          }}
          className="mt-8 px-6 py-3 border border-gray-200 text-gray-600 rounded-full font-medium hover:border-gray-400 hover:text-black transition text-sm"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}