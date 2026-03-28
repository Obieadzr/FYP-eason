import React, { useState, useEffect } from "react";
import API from "../../utils/api";
import { ShieldAlert, CheckCircle, XCircle, Search, UserCheck, Loader2, FileText, Bot, Eye, X, ChevronRight, Activity } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function VerificationQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'pending', 'ai_checked', 'rejected'

  // Modals
  const [docModal, setDocModal] = useState({ open: false, url: "", title: "", docLoading: false });
  const [decisionModal, setDecisionModal] = useState({ open: false, type: "", user: null });
  const [decisionNotes, setDecisionNotes] = useState("");
  const [aiLoading, setAiLoading] = useState(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const { data } = await API.get("/admin/kyc/queue");
      setQueue(data || []);
    } catch (err) {
      toast.error("Failed to load KYC queue");
    } finally {
      setLoading(false);
    }
  };

  const runAiCheck = async (userId) => {
    setAiLoading(userId);
    try {
      const { data } = await API.post(`/admin/kyc/${userId}/ai-check`);
      toast.success(data.message || "AI Analysis Complete");
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || "AI Check Failed");
    } finally {
      setAiLoading(null);
    }
  };

  const handleDecision = async () => {
    if (decisionModal.type === "reject" && !decisionNotes.trim()) {
      return toast.error("Rejection reason is required.");
    }
    
    try {
      if (decisionModal.type === "approve") {
        await API.post(`/admin/kyc/${decisionModal.user._id}/approve`, { verificationNotes: decisionNotes });
        toast.success("Wholesaler approved!");
      } else {
        await API.post(`/admin/kyc/${decisionModal.user._id}/reject`, { rejectionReason: decisionNotes });
        toast.success("Wholesaler rejected!");
      }
      setDecisionModal({ open: false, type: "", user: null });
      setDecisionNotes("");
      fetchQueue();
    } catch (err) {
      toast.error(`Failed to ${decisionModal.type}`);
    }
  };

  const filtered = queue.filter(u => {
    const matchesSearch = `${u.firstName} ${u.lastName} ${u.email} ${u.shopName}`.toLowerCase().includes(search.toLowerCase());
    const statuses = [u.panVerificationStatus, u.licenseVerificationStatus];
    
    if (filter === "pending") return matchesSearch && statuses.includes("pending");
    if (filter === "ai_checked") return matchesSearch && statuses.includes("ai_checked");
    if (filter === "rejected") return matchesSearch && statuses.includes("rejected");
    return matchesSearch;
  });

  // Fetch document as authenticated blob to avoid 'No token provided'
  const openDocModal = async (userId, type, title) => {
    setDocModal({ open: true, url: '', title, docLoading: true });
    try {
      const token = localStorage.getItem('eason_token');
      const res = await fetch(`http://localhost:5000/api/admin/kyc/${userId}/documents?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load document');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      setDocModal({ open: true, url: blobUrl, title, docLoading: false });
    } catch (err) {
      toast.error('Failed to load document');
      setDocModal({ open: false, url: '', title: '', docLoading: false });
    }
  };

  const closeDocModal = () => {
    if (docModal.url) URL.revokeObjectURL(docModal.url);
    setDocModal({ open: false, url: '', title: '', docLoading: false });
  };

  // AI Score Gauge Circle
  const ScoreGauge = ({ score }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 80 ? "text-emerald-500" : score >= 50 ? "text-orange-500" : "text-red-500";
    return (
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
          <circle className="text-[#222]" strokeWidth="4" stroke="currentColor" fill="transparent" r={radius} cx="24" cy="24" />
          <circle className={`${color}`} strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx="24" cy="24" />
        </svg>
        <span className="absolute text-xs font-bold text-white">{score}%</span>
      </div>
    );
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid #222' } }} />
      <div className="h-full flex flex-col bg-[#0d0d0d] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        
        {/* Header */}
        <div className="bg-[#0d0d0d] border-b border-[#222] px-8 py-10 z-10 sticky top-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>KYC Command Center</h1>
              <p className="text-gray-500 font-medium tracking-wide text-sm">Review, analyze, and manage incoming identity packets.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              {['all', 'pending', 'ai_checked', 'rejected'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors ${
                    filter === f ? "bg-white text-black" : "bg-[#111] text-gray-500 hover:text-white hover:bg-[#222]"
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-[#111111] border border-[#222] rounded-xl focus:outline-none focus:border-[#00e87a] transition-colors text-white text-sm font-medium placeholder:text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 px-8 py-10 bg-[#0d0d0d] overflow-y-auto">
          {loading ? (
             <div className="flex items-center justify-center py-32"><Loader2 className="w-10 h-10 text-[#00e87a] animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#111111] border border-[#222] rounded-3xl p-16 text-center max-w-2xl mx-auto mt-10">
              <UserCheck className="w-12 h-12 text-[#00e87a] mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Queue Clear</h3>
              <p className="text-gray-500">No applicants match this criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence>
                {filtered.map((user) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                    key={user._id} 
                    className="bg-[#111111] border border-[#222] rounded-3xl p-8 flex flex-col gap-6"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-[#222] pb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3" style={{ fontFamily: "'Syne', sans-serif" }}>
                          {user.firstName} {user.lastName} 
                          {user.verified && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                          <span className="text-gray-300">{user.email}</span>
                          <span className="w-1 h-1 bg-[#444] rounded-full"></span>
                          <span className="text-gray-300">{user.phone}</span>
                          <span className="w-1 h-1 bg-[#444] rounded-full"></span>
                          <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button 
                          onClick={() => runAiCheck(user._id)} 
                          disabled={aiLoading === user._id || !user.panDocument}
                          className="px-5 py-2.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 border border-indigo-500/20 rounded-xl text-xs font-bold uppercase tracking-widest transition flex items-center gap-2 disabled:opacity-50"
                        >
                          {aiLoading === user._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                          AI Insight
                        </button>
                        <button onClick={() => setDecisionModal({ open: true, type: "approve", user })} className="px-5 py-2.5 bg-[#00e87a] text-black hover:bg-[#00fc85] rounded-xl text-xs font-bold uppercase tracking-widest transition flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => setDecisionModal({ open: true, type: "reject", user })} className="px-5 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs font-bold uppercase tracking-widest transition flex items-center gap-2">
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>

                    {/* Content Row */}
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Left: User & Documents */}
                      <div className="space-y-6">
                        <div>
                          <p className="text-xs uppercase font-bold text-gray-500 tracking-widest mb-1">Declared Business Profile</p>
                          <div className="bg-[#161616] p-4 rounded-xl border border-[#222]">
                            <p className="text-sm text-gray-300 mb-2"><strong className="text-white">Shop Name:</strong> {user.shopName || "N/A"}</p>
                            <p className="text-sm text-gray-300 mb-2"><strong className="text-white">PAN:</strong> {user.panNumber || "N/A"}</p>
                            <p className="text-sm text-gray-300"><strong className="text-white">Address:</strong> {user.address || "N/A"}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs uppercase font-bold text-gray-500 tracking-widest mb-2">Original Documents</p>
                          <div className="flex gap-3">
                            {user.panDocument ? (
                              <button onClick={() => openDocModal(user._id, 'pan', 'PAN Certificate')} className="flex-1 p-3 bg-[#161616] border border-[#222] hover:border-[#00e87a]/50 rounded-xl flex items-center gap-3 transition group">
                                <FileText className="w-5 h-5 text-gray-400 group-hover:text-[#00e87a]" />
                                <span className="text-sm font-bold text-gray-300">View PAN</span>
                              </button>
                            ) : (
                              <div className="flex-1 p-3 bg-[#161616] border border-[#222] border-dashed rounded-xl flex items-center gap-3 opacity-50"><XCircle className="w-5 h-5 text-red-400" /><span className="text-sm font-bold text-gray-500">No PAN</span></div>
                            )}

                            {user.businessLicense ? (
                              <button onClick={() => openDocModal(user._id, 'license', 'Business License')} className="flex-1 p-3 bg-[#161616] border border-[#222] hover:border-[#00e87a]/50 rounded-xl flex items-center gap-3 transition group">
                                <FileText className="w-5 h-5 text-gray-400 group-hover:text-[#00e87a]" />
                                <span className="text-sm font-bold text-gray-300">View License</span>
                              </button>
                            ) : (
                              <div className="flex-1 p-3 bg-[#161616] border border-[#222] border-dashed rounded-xl flex items-center gap-3 opacity-50"><XCircle className="w-5 h-5 text-red-400" /><span className="text-sm font-bold text-gray-500">No License</span></div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: AI Synthesis Panel */}
                      <div>
                        {user.panAiResult ? (
                          <div className="h-full bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6 border-b border-indigo-500/20 pb-4">
                              <h4 className="text-sm font-bold text-indigo-300 tracking-widest uppercase flex items-center gap-2"><Bot className="w-4 h-4" /> AI Nexus Analysis</h4>
                              <ScoreGauge score={user.panAiScore || user.panAiResult.confidenceScore || 0} />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="bg-[#0a0a0a] p-3 rounded-lg border border-[#222]">
                                <span className="text-xs text-gray-500 block mb-1">Extracted PAN</span>
                                <span className={`text-sm font-bold font-mono ${user.panAiResult.panValid ? "text-[#00e87a]" : "text-red-400"}`}>{user.panAiResult.panNumberExtracted || "Not Found"}</span>
                              </div>
                              <div className="bg-[#0a0a0a] p-3 rounded-lg border border-[#222]">
                                <span className="text-xs text-gray-500 block mb-1">Registration No.</span>
                                <span className={`text-sm font-bold font-mono ${user.panAiResult.licenseValid ? "text-[#00e87a]" : "text-red-400"}`}>{user.panAiResult.licenseRegistrationExtracted || "Not Found"}</span>
                              </div>
                            </div>

                            <ul className="space-y-2 mb-6">
                              <li className="flex items-center justify-between text-sm text-gray-300">PAN Matches Name: {user.panAiResult.panNameMatch ? <CheckCircle className="w-4 h-4 text-[#00e87a]" /> : <XCircle className="w-4 h-4 text-red-400" />}</li>
                              <li className="flex items-center justify-between text-sm text-gray-300">Suspicious Flags: {user.panAiResult.suspiciousFlag ? <XCircle className="w-4 h-4 text-red-400" /> : <CheckCircle className="w-4 h-4 text-[#00e87a]" />}</li>
                            </ul>

                            {user.panAiResult.issues && user.panAiResult.issues.length > 0 && (
                              <div className="mb-4">
                                <span className="text-xs text-orange-400 font-bold uppercase">Detected Issues:</span>
                                <ul className="list-disc pl-4 mt-1 space-y-1">
                                  {user.panAiResult.issues.map((issue, idx) => (
                                    <li key={idx} className="text-xs text-orange-200">{issue}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="bg-[#0d0d0d] border border-[#222] py-2 px-4 rounded-lg inline-flex items-center gap-2">
                              <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Recommendation:</span>
                              <span className={`text-xs uppercase font-bold tracking-widest ${user.panAiResult.recommendation === 'approve' ? 'text-[#00e87a]' : user.panAiResult.recommendation === 'reject' ? 'text-red-400' : 'text-orange-400'}`}>
                                {user.panAiResult.recommendation}
                              </span>
                            </div>

                          </div>
                        ) : (
                          <div className="h-full bg-[#161616] border border-[#222] border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center opacity-70">
                            <Activity className="w-10 h-10 text-gray-600 mb-4" />
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No AI Data Available</p>
                            <p className="text-xs text-gray-600 mt-2">Run an AI Check to generate analysis.</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Status Footnote */}
                    {['manually_verified', 'rejected'].includes(user.panVerificationStatus) && (
                      <div className="mt-4 pt-4 border-t border-[#222] flex flex-col sm:flex-row gap-4 items-center justify-between">
                         <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                           {user.panVerificationStatus === 'rejected' ? <span className="text-red-500">REJECTED</span> : <span className="text-[#00e87a]">VERIFIED</span>} on {new Date(user.kycReviewedAt).toLocaleDateString()}
                         </div>
                         {user.rejectionReason && <div className="text-xs text-red-400 max-w-lg truncate">Reason: {user.rejectionReason}</div>}
                         {user.verificationNotes && <div className="text-xs text-gray-400 max-w-lg truncate">Notes: {user.verificationNotes}</div>}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* DOCUMENT MODAL */}
      <AnimatePresence>
        {docModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-sm">
            <div className="bg-[#0d0d0d] border border-[#222] rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-[#222]">
                <h3 className="text-lg font-bold text-white uppercase tracking-widest">{docModal.title}</h3>
                <button onClick={closeDocModal} className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-xl transition"><X className="w-6 h-6" /></button>
              </div>
              <div className="flex-1 bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center p-4">
                {docModal.docLoading ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-[#00e87a] animate-spin" />
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Loading document...</p>
                  </div>
                ) : docModal.url ? (
                  <img src={docModal.url} alt={docModal.title} className="max-h-full max-w-full object-contain rounded-xl shadow-2xl" />
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTION MODAL (APPROVE/REJECT) */}
      <AnimatePresence>
        {decisionModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#111] border border-[#222] p-8 rounded-3xl w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold tracking-tight text-white uppercase" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {decisionModal.type === "approve" ? "Grang Wholesaler Access" : "Deny Application"}
                </h3>
                <button onClick={() => setDecisionModal({ open: false, type: "", user: null })} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {decisionModal.type === "approve" ? (
                <>
                  <p className="text-sm text-gray-400 mb-6">You are about to approve <strong>{decisionModal.user?.firstName} {decisionModal.user?.lastName}</strong>. This instantly grants full marketplace trading access.</p>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Internal Verification Notes (Optional)</label>
                  <textarea value={decisionNotes} onChange={e => setDecisionNotes(e.target.value)} rows={3} placeholder="Everything looks authentic." className="w-full bg-[#0d0d0d] border border-[#222] text-white p-4 rounded-xl focus:border-[#00e87a] outline-none text-sm resize-none mb-8"></textarea>
                  <button onClick={handleDecision} className="w-full py-4 rounded-xl bg-[#00e87a] text-black font-bold uppercase tracking-widest hover:bg-[#00fc85] transition shadow-[0_0_20px_rgba(0,232,122,0.2)]">Confirm Approval</button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-400 mb-6 font-bold">You are about to reject <strong>{decisionModal.user?.firstName} {decisionModal.user?.lastName}</strong>. A reason is mandatory.</p>
                  <label className="block text-xs font-bold text-red-500 uppercase tracking-widest mb-2">* Rejection Reason (Sent to User)</label>
                  <textarea value={decisionNotes} onChange={e => setDecisionNotes(e.target.value)} rows={3} placeholder="Image is blurry, PAN number does not match..." className="w-full bg-[#0d0d0d] border border-red-500/30 text-white p-4 rounded-xl focus:border-red-500 outline-none text-sm resize-none mb-8"></textarea>
                  <button onClick={handleDecision} className="w-full py-4 rounded-xl bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-500 transition shadow-[0_0_20px_rgba(220,38,38,0.2)]">Confirm Rejection</button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
