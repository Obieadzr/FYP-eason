// src/pages/auth/Settings.jsx  — repurposed as the User Profile page
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  User, Store, Shield, Lock, Smartphone, Mail, MapPin,
  LogOut, ArrowLeft, ShoppingBag, Edit3, Check, Package, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../utils/api";
import KYCVerification from "./KYCVerification";

const inputCls = "w-full bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-sm px-4 py-3.5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors rounded-none";
const labelCls = "block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2";

const Field = ({ label, children }) => (
  <div><label className={labelCls}>{label}</label>{children}</div>
);

export default function Settings() {
  const navigate  = useNavigate();
  const { user, logout, setUser } = useAuthStore();
  const [tab, setTab]           = useState("profile");
  const [loading, setLoading]   = useState(false);
  const [passLoad, setPassLoad] = useState(false);

  const isWholesaler = user?.role === "wholesaler";

  const [profile, setProfile] = useState({
    firstName:    user?.firstName    || "",
    lastName:     user?.lastName     || "",
    email:        user?.email        || "",
    phone:        user?.phone        || "",
    shopName:     user?.shopName     || "",
    panNumber:    user?.panNumber    || "",
    address:      user?.address      || "",
    businessType: user?.businessType || "retailer",
  });

  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.put("/auth/profile", profile);
      setUser?.({ ...user, ...res.data.user });
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed.");
    } finally { setLoading(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error("Passwords don't match.");
    setPassLoad(true);
    try {
      await API.put("/auth/password", { currentPassword: passwords.current, newPassword: passwords.new });
      toast.success("Password changed!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.");
    } finally { setPassLoad(false); }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const tabs = [
    { id: "profile",    label: "Profile",         icon: User    },
    ...(isWholesaler ? [{ id: "business", label: "Business",  icon: Store  }] : []),
    ...(isWholesaler ? [{ id: "kyc", label: "Verification", icon: ShieldCheck }] : []),
    { id: "security",   label: "Security",         icon: Shield  },
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-screen-lg mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-black hover:bg-gray-100 p-2 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold tracking-widest uppercase text-black">Account</h1>
          <button onClick={handleLogout} className="text-xs uppercase tracking-widest text-black hover:text-gray-600 font-bold transition flex items-center gap-2 p-2">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-12 gap-8">

          {/* Left — avatar + tabs */}
          <div className="lg:col-span-3 space-y-4">
            {/* Avatar card */}
            <div className="bg-white border border-gray-200 p-8 text-center hover:border-black transition-colors duration-300">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold tracking-tighter text-white">
                  {(user?.firstName?.[0] || "U").toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-black">{user?.firstName} {user?.lastName}</h2>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{user?.email}</p>
              <span className={`inline-block mt-4 text-[10px] font-bold uppercase tracking-widest px-3 py-1 border ${
                isWholesaler ? "border-black text-black" : "border-gray-300 text-gray-600"
              }`}>
                {isWholesaler ? "Wholesaler" : "Retailer"}
              </span>
            </div>

            {/* Quick actions */}
            <div className="bg-white border border-gray-200 p-2 space-y-1">
              <button
                onClick={() => navigate("/orders")}
                className="w-full text-left flex items-center gap-3 px-4 py-3.5 text-sm uppercase font-bold tracking-widest text-gray-500 hover:text-black hover:bg-[#f9f9f9] transition-colors"
              >
                <ShoppingBag className="w-4 h-4" /> My Orders
              </button>
              {isWholesaler && (
                <button
                  onClick={() => navigate("/wholesaler")}
                  className="w-full text-left flex items-center gap-3 px-4 py-3.5 text-sm uppercase font-bold tracking-widest text-gray-500 hover:text-black hover:bg-[#f9f9f9] transition-colors"
                >
                  <Package className="w-4 h-4" /> Dashboard
                </button>
              )}
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3.5 text-sm uppercase tracking-widest transition-colors ${
                    tab === id ? "bg-black text-white font-bold" : "text-gray-500 hover:text-black hover:bg-[#f9f9f9] font-bold"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-3 px-4 py-3.5 text-sm uppercase font-bold tracking-widest text-red-500 hover:bg-red-50 border-t border-gray-100 transition-colors mt-2"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-9">
            <div className="bg-white border border-gray-200 p-8 md:p-10 mb-10 hover:border-black transition-colors duration-300">
              <AnimatePresence mode="wait">

                {/* PROFILE TAB */}
                {tab === "profile" && (
                  <motion.form
                    key="profile"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleProfileSave}
                    className="space-y-5"
                  >
                    <div className="mb-10 border-b border-gray-200 pb-6">
                      <h2 className="text-3xl font-bold tracking-tight text-black mb-2">Personal Details</h2>
                      <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Update your name, email and phone number.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <Field label="First name">
                        <input value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                          placeholder="Aarav" className={inputCls} />
                      </Field>
                      <Field label="Last name">
                        <input value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                          placeholder="Thapa" className={inputCls} />
                      </Field>
                    </div>

                    <Field label="Email">
                      <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })}
                        className={inputCls} />
                    </Field>
                    <Field label="Phone">
                      <input type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="98XXXXXXXX" className={inputCls} />
                    </Field>

                    <button type="submit" disabled={loading}
                      className="mt-8 flex items-center justify-center gap-2 px-8 py-4 bg-black text-white text-sm font-bold tracking-widest uppercase hover:bg-gray-900 disabled:opacity-60 transition-colors w-full sm:w-auto">
                      {loading ? "Saving..." : <><Check className="w-4 h-4" /> Save Changes</>}
                    </button>
                  </motion.form>
                )}

                {/* BUSINESS TAB */}
                {tab === "business" && isWholesaler && (
                  <motion.form
                    key="business"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleProfileSave}
                    className="space-y-5"
                  >
                    <div className="mb-10 border-b border-gray-200 pb-6">
                      <h2 className="text-3xl font-bold tracking-tight text-black mb-2">Business Profile</h2>
                      <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Your business info seen by buyers.</p>
                    </div>

                    <Field label="Shop / Company Name">
                      <input value={profile.shopName} onChange={e => setProfile({ ...profile, shopName: e.target.value })}
                        placeholder="Thapa Traders Pvt. Ltd." className={inputCls} />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="PAN / VAT Number">
                        <input value={profile.panNumber} onChange={e => setProfile({ ...profile, panNumber: e.target.value })}
                          placeholder="123456789" className={inputCls} />
                      </Field>
                      <Field label="Business Category">
                        <select value={profile.businessType} onChange={e => setProfile({ ...profile, businessType: e.target.value })}
                          className={inputCls}>
                          <option value="retailer">Retailer</option>
                          <option value="wholesaler">Distributor / Wholesaler</option>
                        </select>
                      </Field>
                    </div>

                    <Field label="Business Address">
                      <input value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })}
                        placeholder="Tole, Ward No., City" className={inputCls} />
                    </Field>

                    <button type="submit" disabled={loading}
                      className="mt-8 flex items-center justify-center gap-2 px-8 py-4 bg-black text-white text-sm font-bold tracking-widest uppercase hover:bg-gray-900 disabled:opacity-60 transition-colors w-full sm:w-auto">
                      {loading ? "Saving..." : <><Check className="w-4 h-4" /> Update Business Info</>}
                    </button>
                  </motion.form>
                )}

                {/* KYC TAB */}
                {tab === "kyc" && isWholesaler && (
                  <motion.div
                    key="kyc"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <KYCVerification />
                  </motion.div>
                )}

                {/* SECURITY TAB */}
                {tab === "security" && (
                  <motion.form
                    key="security"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handlePasswordSave}
                    className="space-y-5"
                  >
                    <div className="mb-10 border-b border-gray-200 pb-6">
                      <h2 className="text-3xl font-bold tracking-tight text-black mb-2">Security</h2>
                      <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Change your password.</p>
                    </div>
                    <Field label="Current Password">
                      <input type="password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                        className={inputCls} />
                    </Field>
                    <Field label="New Password">
                      <input type="password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                        className={inputCls} />
                    </Field>
                    <Field label="Confirm New Password">
                      <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                        className={inputCls} />
                    </Field>
                    <button type="submit" disabled={passLoad}
                      className="mt-8 flex items-center justify-center gap-2 px-8 py-4 bg-black text-white text-sm font-bold tracking-widest uppercase hover:bg-gray-900 disabled:opacity-60 transition-colors w-full sm:w-auto">
                      {passLoad ? "Updating..." : <><Lock className="w-4 h-4" /> Change Password</>}
                    </button>
                  </motion.form>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
