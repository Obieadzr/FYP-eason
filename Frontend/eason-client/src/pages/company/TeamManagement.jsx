import React, { useState, useEffect } from "react";
import { Plus, Trash2, Mail, Users, Shield, User, Loader2, Copy } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function TeamManagement() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("buyer");
  const [inviting, setInviting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

  const fetchMembers = async () => {
    try {
      const { data } = await api.get("/company/members");
      setMembers(data.members);
    } catch (err) {
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return toast.error("Enter an email");
    setInviting(true);
    try {
      const { data } = await api.post("/company/invite", { email: inviteEmail, role: inviteRole });
      toast.success(data.message);
      setGeneratedLink(data.inviteLink);
      setInviteEmail("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to invite");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put("/company/role", { userId, newRole });
      toast.success("Role updated");
      fetchMembers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update role");
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await api.delete(`/company/member/${userId}`);
      toast.success("Member removed");
      fetchMembers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove member");
    }
  };

  const getRoleIcon = (role) => {
    if (role === "admin") return <Shield className="w-4 h-4 text-emerald-600 stroke-[2]" />;
    if (role === "approver") return <Users className="w-4 h-4 text-blue-500 stroke-[2]" />;
    return <User className="w-4 h-4 text-gray-400 stroke-[2]" />;
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-[24px] font-bold text-gray-900 mb-2">Team Management</h1>
      <p className="text-gray-500 text-sm font-medium mb-6">Manage your company's users, roles, and approval permissions.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Invite Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600 stroke-[2]" />
              Invite Member
            </h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" placeholder="colleague@company.com" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Assign Role</label>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors appearance-none font-medium">
                  <option value="buyer">Buyer (Can order {'<'} 50k)</option>
                  <option value="approver">Approver (Can approve orders)</option>
                  <option value="admin">Admin (Full Control)</option>
                </select>
              </div>
              <button type="submit" disabled={inviting} className="w-full bg-emerald-600 text-white font-bold text-sm rounded-xl py-3 hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-sm">
                {inviting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Plus className="w-4 h-4 stroke-[2]" /> Generate Invite Link</>}
              </button>
            </form>

            {generatedLink && (
              <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 stroke-[2]" /> Link Generated
                </p>
                <div className="flex flex-col gap-2">
                  <input type="text" readOnly value={generatedLink} className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-xs text-gray-600 outline-none font-medium" />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLink);
                      toast.success("Link copied!");
                    }}
                    className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5 stroke-[2]" /> Copy Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Member List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600 stroke-[2]" />
                Active Members
              </h2>
              <span className="text-[10px] bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">{members.length} Users</span>
            </div>

            {loading ? (
              <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.map(member => (
                    <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-sm">{member.firstName} {member.lastName}</div>
                        <div className="text-gray-500 text-xs font-medium">{member.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(member.companyRole)}
                          {member.isCompanyOwner ? (
                            <span className="text-emerald-600 font-bold text-xs uppercase tracking-wide">Owner</span>
                          ) : (
                            <select
                              value={member.companyRole}
                              onChange={(e) => handleRoleChange(member._id, e.target.value)}
                              className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-emerald-500 transition-colors"
                            >
                              <option value="admin">Admin</option>
                              <option value="approver">Approver</option>
                              <option value="buyer">Buyer</option>
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!member.isCompanyOwner && (
                          <button onClick={() => handleRemove(member._id)} className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 stroke-[2]" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center text-gray-400 font-medium text-sm">No members found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
