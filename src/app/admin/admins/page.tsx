"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, setDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { UserPlus, Shield, Trash2 } from "lucide-react";
import { useUser, UserData } from "@/context/UserContext";

const PERMISSIONS = [
  { id: "games", label: "Games Management" },
  { id: "finance", label: "Finance & Wallet" },
  { id: "users", label: "User Management" },
  { id: "affiliate", label: "Affiliate Program" },
  { id: "vip", label: "VIP Management" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "logs", label: "Betting Logs" },
  { id: "notifications", label: "Notifications" },
  { id: "settings", label: "Settings" },
  { id: "support", label: "Support" },
];

export default function AdminManagementPage() {
  const { user } = useUser();
  const [admins, setAdmins] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "in", ["admin", "master_admin"]));
      const snap = await getDocs(q);
      setAdmins(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData)));
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    try {
      // 1. Create Auth User
      // Note: This will sign in the new user immediately, which might disrupt the current session.
      // Ideally, this should be done via a Cloud Function or a secondary app instance.
      // For this demo, we'll warn the user or use a workaround if possible.
      // A simple workaround for client-side admin creation without losing session is tricky.
      // We will assume for now this is acceptable or we'd use a secondary app initialization.
      
      alert("Creating a new admin will log you out. You will need to login again.");
      
      const res = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Create User Doc
      await setDoc(doc(db, "users", res.user.uid), {
        name,
        email,
        role: "admin",
        permissions: selectedPermissions,
        createdAt: new Date().toISOString(),
        balance: 0,
        walletInfo: {}
      });

      setShowModal(false);
      setName("");
      setEmail("");
      setPassword("");
      setSelectedPermissions([]);
      fetchAdmins();
      
      // Since we are logged out, we might need to redirect or handle re-login.
      // In a real app, use Cloud Functions for this!
      
    } catch (error) {
      console.error("Error creating admin:", error);
      if (error instanceof Error) {
        alert("Error: " + error.message);
      } else {
        alert("An unknown error occurred");
      }
    }
  };

  const togglePermission = (id: string) => {
    setSelectedPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  if (user?.role !== "master_admin") {
    return <div className="p-8 text-red-500">Access Denied. Master Admin only.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Admin Management</h2>
          <p className="text-gray-400">Manage admins and their permissions.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Create Admin
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map((admin) => (
          <div key={admin.id} className="bg-[#1a1a2e] border border-white/10 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{admin.name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{admin.role?.replace("_", " ")}</p>
                </div>
              </div>
              {admin.role !== "master_admin" && (
                <button className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-gray-400 font-bold uppercase">Permissions</p>
              <div className="flex flex-wrap gap-2">
                {admin.permissions?.map((perm: string) => (
                  <span key={perm} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300 border border-white/5">
                    {PERMISSIONS.find(p => p.id === perm)?.label || perm}
                  </span>
                ))}
                {admin.role === "master_admin" && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded text-xs border border-yellow-500/20">
                    Full Access
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] border border-white/10 p-8 rounded-2xl w-full max-w-md space-y-6">
            <h3 className="text-2xl font-bold text-white">Create New Admin</h3>
            
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-yellow-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-yellow-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-yellow-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Permissions</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-black/20 rounded-lg border border-white/5">
                  {PERMISSIONS.map(perm => (
                    <label key={perm.id} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 rounded">
                      <input 
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="rounded border-gray-600 text-yellow-500 focus:ring-yellow-500 bg-gray-700"
                      />
                      <span className="text-sm text-gray-300">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition-colors"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
