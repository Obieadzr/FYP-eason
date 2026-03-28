import React, { useState, useEffect } from "react";
import API from "../../utils/api.js";
import { Search, Loader2, User, Shield, Key, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data || []);
    } catch {
      toast.error("Failed to load users matrix");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success("Node permissions updated");
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Role change rejected");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("CRITICAL: Permanently purge this node from the network?")) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      toast.success("Target purged");
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to purge node");
    }
  };

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid #222' } }} />

      <div className="h-full flex flex-col bg-[#0d0d0d] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        
        {/* Header Section */}
        <div className="bg-[#0d0d0d] border-b border-[#222] px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Network Nodes</h1>
              <p className="text-gray-500 font-medium tracking-wide text-sm">{users.length} authenticated identities in the system</p>
            </div>
            <div className="px-5 py-2.5 bg-[#111] border border-[#222] rounded-xl flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#00e87a]" />
              <span className="text-sm font-bold tracking-widest uppercase text-gray-300">Creator Access Admin</span>
            </div>
          </div>

          {/* Search */}
          <div className="mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, email, or hash..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-[#111111] border border-[#222] rounded-2xl focus:outline-none focus:border-[#00e87a] focus:ring-1 focus:ring-[#00e87a] transition-colors text-white font-medium placeholder:text-gray-600 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 px-8 py-10 bg-[#0d0d0d]">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-10 h-10 text-[#00e87a] animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#111111] border border-[#222] rounded-3xl p-16 text-center max-w-2xl mx-auto mt-10">
              <div className="w-20 h-20 bg-[#0d0d0d] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#222]">
                <User className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>No Nodes Found</h3>
              <p className="text-gray-500 mb-8">No identities match the current query parameters.</p>
            </div>
          ) : (
            <div className="bg-[#111111] rounded-2xl border border-[#222] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0d0d0d] border-b border-[#222]">
                      <th className="py-5 px-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Identity Hash</th>
                      <th className="py-5 px-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Profile</th>
                      <th className="py-5 px-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Access Layer</th>
                      <th className="py-5 px-8 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Root Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {filtered.map((userNode, i) => (
                      <motion.tr
                        key={userNode._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-[#1a1a1a] transition-colors group"
                      >
                        <td className="px-8 py-6">
                           <code className="text-xs font-mono bg-[#0d0d0d] border border-[#222] px-3 py-1.5 rounded-lg text-[#00e87a]">
                            #{userNode._id.slice(-8).toUpperCase()}
                          </code>
                        </td>
                        <td className="px-8 py-6">
                           <div>
                            <p className="text-sm font-bold text-white">{userNode.firstName} {userNode.lastName || userNode.fullName}</p>
                            <p className="text-xs font-medium text-gray-500 mt-1">{userNode.email}</p>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <select 
                            value={userNode.role}
                            onChange={(e) => handleRoleChange(userNode._id, e.target.value)}
                            className={`text-xs font-bold tracking-widest uppercase bg-[#0d0d0d] border px-3 py-1.5 rounded-lg focus:outline-none transition-colors 
                              ${userNode.role === 'admin' ? 'text-purple-400 border-purple-500/30' : 
                                userNode.role === 'wholesaler' ? 'text-orange-400 border-orange-500/30' : 'text-blue-400 border-blue-500/30'}`}
                          >
                            <option value="retailer">Retailer Access</option>
                            <option value="wholesaler">Wholesaler Access</option>
                            <option value="admin">Root Admin</option>
                          </select>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button onClick={() => handleDelete(userNode._id)} className="p-2.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-gray-400 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                              <Trash2 className="w-4 h-4" /> Purge
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Users;
