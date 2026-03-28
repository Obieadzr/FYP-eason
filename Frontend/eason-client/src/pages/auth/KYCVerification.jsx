import React, { useState, useEffect } from "react";
import { ShieldCheck, UploadCloud, FileText, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import API from "../../utils/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function KYCVerification() {
  const [kycData, setKycData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [panFile, setPanFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const { data } = await API.get("/kyc/status");
      setKycData(data);
    } catch (err) {
      toast.error("Failed to load KYC status.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File exceeds 10MB limit.");
        return;
      }
      setter(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!panFile || !licenseFile) return toast.error("Please upload both documents.");

    setSubmitting(true);
    const formData = new FormData();
    formData.append("panDocument", panFile);
    formData.append("businessLicense", licenseFile);

    try {
      await API.post("/kyc/submit", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Documents submitted successfully!");
      setPanFile(null);
      setLicenseFile(null);
      fetchStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

  const status = kycData?.panVerificationStatus || "not_submitted";
  const needsUpload = status === "not_submitted" || status === "rejected";

  return (
    <div className="space-y-6">
      <div className="mb-10 border-b border-gray-200 pb-6">
        <h2 className="text-3xl font-bold tracking-tight text-black mb-2 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-600" /> Trust & Verification
        </h2>
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Secure your seller account.</p>
      </div>

      {/* Status Banner */}
      <div className={`p-6 border rounded-2xl flex items-start gap-4 ${
        kycData?.verified ? "bg-emerald-50 border-emerald-200" :
        status === "rejected" ? "bg-red-50 border-red-200" :
        status === "pending" || status === "ai_checked" ? "bg-orange-50 border-orange-200" :
        "bg-gray-50 border-gray-200"
      }`}>
        <div className="mt-1">
          {kycData?.verified ? <CheckCircle className="w-6 h-6 text-emerald-600" /> :
           status === "rejected" ? <XCircle className="w-6 h-6 text-red-600" /> :
           status === "pending" || status === "ai_checked" ? <AlertCircle className="w-6 h-6 text-orange-500" /> :
           <ShieldCheck className="w-6 h-6 text-gray-400" />}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg uppercase tracking-tight">
            Status: {kycData?.verified ? "Verified ✓" : status.replace("_", " ")}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {kycData?.verified ? "Your business is fully verified and active on the marketplace." :
             status === "rejected" ? "Your application was rejected. Please review the reason below and try again." :
             status === "pending" || status === "ai_checked" ? "Your documents are under review. You'll be notified soon." :
             "Please upload your business registration and PAN documents to get verified."}
          </p>
          {status === "rejected" && kycData?.rejectionReason && (
            <div className="mt-4 p-4 bg-white border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              Reason: {kycData.rejectionReason}
            </div>
          )}
        </div>
      </div>

      {/* AI AI Check Summary Card */}
      {status === "ai_checked" && kycData?.panAiResult && (
        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
          <h4 className="font-bold uppercase tracking-widest text-xs text-gray-500 mb-4">Initial AI Analysis</h4>
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-emerald-700">
              {kycData.panAiScore}%
            </div>
            <div className="flex-1 text-sm space-y-2 text-gray-700">
              <p>PAN Valid: {kycData.panAiResult.panValid ? "✅" : "❌"}</p>
              <p>Name Match: {kycData.panAiResult.panNameMatch ? "✅" : "❌"}</p>
              <p>Recommendation: <span className="uppercase font-bold">{kycData.panAiResult.recommendation}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Form */}
      {needsUpload && (
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            
            {/* PAN Dropzone */}
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 hover:border-emerald-500 transition-colors cursor-pointer relative">
              <input type="file" accept=".jpg,.png,.webp,.pdf" onChange={(e) => handleFileChange(e, setPanFile)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center justify-center pointer-events-none">
                {panFile ? <FileText className="w-10 h-10 text-emerald-600 mb-4" /> : <UploadCloud className="w-10 h-10 text-gray-400 mb-4" />}
                <p className="font-bold text-gray-900 text-sm">{panFile ? panFile.name : "Upload PAN Certificate"}</p>
                <p className="text-xs text-gray-500 mt-2">{panFile ? `${(panFile.size/1024/1024).toFixed(2)} MB` : "PDF, JPG, PNG up to 10MB"}</p>
              </div>
            </div>

            {/* License Dropzone */}
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 hover:border-emerald-500 transition-colors cursor-pointer relative">
              <input type="file" accept=".jpg,.png,.webp,.pdf" onChange={(e) => handleFileChange(e, setLicenseFile)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center justify-center pointer-events-none">
                {licenseFile ? <FileText className="w-10 h-10 text-emerald-600 mb-4" /> : <UploadCloud className="w-10 h-10 text-gray-400 mb-4" />}
                <p className="font-bold text-gray-900 text-sm">{licenseFile ? licenseFile.name : "Upload Business License"}</p>
                <p className="text-xs text-gray-500 mt-2">{licenseFile ? `${(licenseFile.size/1024/1024).toFixed(2)} MB` : "PDF, JPG, PNG up to 10MB"}</p>
              </div>
            </div>

          </div>

          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6">
            <strong>Note:</strong> Make sure the documents clearly show the IRD letterhead, your registration number, and your business name. Files must be readable.
          </div>

          <button 
            type="submit" 
            disabled={submitting || !panFile || !licenseFile}
            className="w-full sm:w-auto px-8 py-4 bg-black text-white text-sm font-bold tracking-widest uppercase hover:bg-gray-900 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            {submitting ? "Uploading..." : "Submit for Verification"}
          </button>
        </form>
      )}
    </div>
  );
}
