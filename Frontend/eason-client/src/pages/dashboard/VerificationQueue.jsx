import React, { useState, useEffect } from "react";
import API from "../../utils/api";
import { ShieldAlert, CheckCircle, XCircle, Search, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function VerificationQueue() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const { data } = await API.get("/admin/pending-wholesalers");
      setPendingUsers(data || []);
    } catch (err) {
      toast.error("Failed to load pending accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.put(`/admin/approve-wholesaler/${id}`);
      toast.success("Wholesaler approved!");
      setPendingUsers(pendingUsers.filter(u => u._id !== id));
    } catch (err) {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (id) => {
    if(!window.confirm("Are you sure you want to reject and delete this application?")) return;
    try {
      await API.delete(`/admin/reject-wholesaler/${id}`);
      toast.success("Application rejected");
      setPendingUsers(pendingUsers.filter(u => u._id !== id));
    } catch (err) {
      toast.error("Failed to reject");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Verification Queue</h1>
          <p className="text-gray-500 mt-2">Review and approve new wholesaler accounts to grant them marketplace access.</p>
        </div>
        <div className="bg-amber-100 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-amber-800">
           <ShieldAlert size={20} /> {pendingUsers.length} Pending
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Search Bar mock */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
           <Search className="w-5 h-5 text-gray-400" />
           <input type="text" placeholder="Search applicants by name or email..." className="bg-transparent w-full outline-none text-gray-700 font-medium" />
        </div>

        {loading ? (
          <div className="p-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="p-24 flex flex-col items-center justify-center text-center">
             <UserCheck className="w-24 h-24 text-gray-200 mb-6" />
             <h3 className="text-2xl font-bold text-gray-800 mb-2">All caught up!</h3>
             <p className="text-gray-500">There are no pending wholesaler applications right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingUsers.map(user => (
              <div key={user._id} className="p-6 hover:bg-gray-50 transition flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div>
                   <h3 className="text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h3>
                   <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>{user.email}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>Applied: {new Date(user.createdAt).toLocaleDateString()}</span>
                      {user.shopName && (
                         <>
                           <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                           <span className="font-bold text-gray-800">{user.shopName}</span>
                         </>
                      )}
                   </div>
                   {user.panNumber && (
                      <div className="mt-4">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest block mb-1">Verified PAN / VAT</span>
                        <p className="text-lg font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-100 px-4 py-2 rounded-lg inline-block">
                          {user.panNumber}
                        </p>
                      </div>
                   )}
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                   <button onClick={() => handleApprove(user._id)} className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2">
                     <CheckCircle className="w-5 h-5" /> Approve
                   </button>
                   <button onClick={() => handleReject(user._id)} className="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition flex items-center justify-center gap-2">
                     <XCircle className="w-5 h-5" /> Reject
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
