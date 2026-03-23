import React, { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { User, Store, Shield, Lock, Smartphone, Mail, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../utils/api";

const InputField = ({ icon: Icon, label, required, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
        {...props}
      />
    </div>
  </div>
);

export default function Settings() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  // Profile State
  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    shopName: user?.shopName || "",
    panNumber: user?.panNumber || "",
    address: user?.address || "",
    businessType: user?.businessType || "retailer",
  });

  // Password State
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.put("/auth/profile", profile);
      setUser({ ...user, ...res.data.user });
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return toast.error("New passwords do not match");
    }
    setPassLoading(true);
    try {
      await API.put("/auth/password", { 
        currentPassword: passwords.current, 
        newPassword: passwords.new 
      });
      toast.success("Password changed successfully");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 space-y-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === "profile" ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <User size={20} /> Personal Details
          </button>
          {user?.role === "wholesaler" && (
            <button
              onClick={() => setActiveTab("business")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === "business" ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <Store size={20} /> Business Profile
            </button>
          )}
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === "security" ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Shield size={20} /> Security
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          
          {/* PERSONAL DETAILS TAB */}
          {activeTab === "profile" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Details</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InputField 
                    icon={User} label="First Name" required 
                    value={profile.firstName} 
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                  />
                  <InputField 
                    icon={User} label="Last Name" required 
                    value={profile.lastName} 
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                  />
                </div>
                <InputField 
                  icon={Mail} label="Email Address" type="email" required 
                  value={profile.email} 
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                />
                <InputField 
                  icon={Smartphone} label="Phone Number" required 
                  value={profile.phone} 
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                />
                <button 
                  type="submit" disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}

          {/* BUSINESS DETAILS TAB */}
          {activeTab === "business" && user?.role === "wholesaler" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Profile</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl">
                <InputField 
                  icon={Store} label="Shop / Company Name" required 
                  value={profile.shopName} 
                  onChange={(e) => setProfile({...profile, shopName: e.target.value})}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InputField 
                    icon={Shield} label="PAN / VAT Number" required 
                    value={profile.panNumber} 
                    onChange={(e) => setProfile({...profile, panNumber: e.target.value})}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Category *</label>
                    <select 
                      value={profile.businessType}
                      onChange={(e) => setProfile({...profile, businessType: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="retailer">Retailer</option>
                      <option value="wholesaler">Distributor / Wholesaler</option>
                    </select>
                  </div>
                </div>
                <InputField 
                  icon={MapPin} label="Business Address" required 
                  value={profile.address} 
                  onChange={(e) => setProfile({...profile, address: e.target.value})}
                />
                <button 
                  type="submit" disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Update Business Info"}
                </button>
              </form>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Security & Passwords</h2>
              <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-md">
                <InputField 
                  icon={Lock} label="Current Password" type="password" required 
                  value={passwords.current} 
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                />
                <InputField 
                  icon={Lock} label="New Password" type="password" required 
                  value={passwords.new} 
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                />
                <InputField 
                  icon={Lock} label="Confirm New Password" type="password" required 
                  value={passwords.confirm} 
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                />
                <button 
                  type="submit" disabled={passLoading}
                  className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition disabled:opacity-50"
                >
                  {passLoading ? "Updating..." : "Change Password"}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
