"use client";

import { useState, useEffect } from "react";
import { Search, Ban, CheckCircle, Edit, Save, X, Trash2, Gift, PlusCircle } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, deleteDoc, query, where, addDoc, increment } from "firebase/firestore";

interface User {
  id: string;
  phone: string;
  balance: number;
  status: string;
  role: string;
  createdAt: string;
  specialBonus?: number; // Optional special bonus percentage
  specialBonusTurnover?: number; // Optional special bonus turnover multiplier
  remainingTurnover?: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editBalance, setEditBalance] = useState("");
  const [editSpecialBonus, setEditSpecialBonus] = useState("");
  const [editSpecialBonusTurnover, setEditSpecialBonusTurnover] = useState("");
  const [manualTurnover, setManualTurnover] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBan = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "banned" : "active";
      await updateDoc(doc(db, "users", id), { status: newStatus });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const deleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete user ${user.phone || user.id}? This action cannot be undone and will remove all associated data (deposits, withdrawals, etc.).`)) return;

    try {
      // 1. Delete Deposits
      const depQ = query(collection(db, "deposits"), where("userId", "==", user.id));
      const depSnap = await getDocs(depQ);
      const depPromises = depSnap.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(depPromises);

      // 2. Delete Withdrawals
      const wdQ = query(collection(db, "withdrawals"), where("userId", "==", user.id));
      const wdSnap = await getDocs(wdQ);
      const wdPromises = wdSnap.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(wdPromises);

      // 3. Delete User Document
      await deleteDoc(doc(db, "users", user.id));

      // 4. Update UI
      setUsers(users.filter(u => u.id !== user.id));
      alert("User and all associated data deleted successfully.");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user. Check console for details.");
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditBalance(user.balance.toString());
    setEditSpecialBonus(user.specialBonus?.toString() || "");
    setEditSpecialBonusTurnover(user.specialBonusTurnover?.toString() || "");
    setManualTurnover(""); // Reset manual turnover input
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updates: any = {
        balance: Number(editBalance)
      };

      // Handle Special Bonus
      if (editSpecialBonus) {
        updates.specialBonus = Number(editSpecialBonus);
        
        // Only update turnover setting if provided
        if (editSpecialBonusTurnover) {
          updates.specialBonusTurnover = Number(editSpecialBonusTurnover);
        } else {
          updates.specialBonusTurnover = null;
        }

        // Notify User if bonus changed or is new
        if (editingUser.specialBonus !== Number(editSpecialBonus)) {
           await addDoc(collection(db, "notifications"), {
            userId: editingUser.id,
            title: "Special Bonus Offer!",
            message: `You have received a Special Bonus Offer of ${editSpecialBonus}%! Deposit now to claim it.`,
            type: "success",
            read: false,
            createdAt: new Date().toISOString()
          });
        }

      } else {
        updates.specialBonus = null; // Remove if empty
        updates.specialBonusTurnover = null;
      }

      // Handle Manual Turnover Addition
      if (manualTurnover) {
        updates.remainingTurnover = increment(Number(manualTurnover));
      }

      await updateDoc(doc(db, "users", editingUser.id), updates);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.phone?.includes(searchTerm) || user.id.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">User Management</h2>
          <p className="text-gray-400">View and manage all registered users.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#1a1a2e] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 w-64"
          />
        </div>
      </div>

      <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-gray-400">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Balance</th>
              <th className="p-4">Special Offer</th>
              <th className="p-4">Status</th>
              <th className="p-4">Role</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading users...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No users found</td></tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
                        {user.phone ? user.phone[0] : "U"}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.phone || "No Phone"}</p>
                        <p className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-green-500">৳{user.balance?.toFixed(2) || "0.00"}</td>
                  <td className="p-4">
                    {user.specialBonus ? (
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                          <Gift className="w-4 h-4" /> {user.specialBonus}%
                        </span>
                        {user.specialBonusTurnover && (
                          <span className="text-[10px] text-gray-500">
                            Turnover: {user.specialBonusTurnover}x
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-600 text-sm">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs uppercase ${
                      user.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {user.status || "active"}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 capitalize">{user.role || "user"}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleBan(user.id, user.status || "active")}
                        className={`p-2 rounded-lg ${
                          user.status === 'banned' 
                            ? 'text-green-400 hover:bg-green-500/20' 
                            : 'text-red-400 hover:bg-red-500/20'
                        }`}
                        title={user.status === 'banned' ? "Unban User" : "Ban User"}
                      >
                        {user.status === 'banned' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => deleteUser(user)}
                        className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg"
                        title="Delete User Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">User</label>
                <input 
                  type="text" 
                  value={editingUser.phone} 
                  disabled 
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-gray-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Balance</label>
                <input 
                  type="number" 
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none"
                />
              </div>
              
              <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/10 space-y-3">
                <h4 className="font-bold text-yellow-500 text-sm flex items-center gap-2">
                  <Gift className="w-4 h-4" /> Special Bonus Offer
                </h4>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Bonus Percentage (%)</label>
                  <input 
                    type="number" 
                    value={editSpecialBonus}
                    onChange={(e) => setEditSpecialBonus(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-yellow-500 focus:border-yellow-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Turnover Multiplier (x)</label>
                  <input 
                    type="number" 
                    value={editSpecialBonusTurnover}
                    onChange={(e) => setEditSpecialBonusTurnover(e.target.value)}
                    placeholder="Default: Global Setting"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-yellow-500 focus:border-yellow-500 outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Leave empty to use default turnover setting.</p>
                </div>
              </div>

              <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 space-y-3">
                <h4 className="font-bold text-blue-400 text-sm flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Manual Turnover Adjustment
                </h4>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Add/Remove Turnover Amount</label>
                  <input 
                    type="number" 
                    value={manualTurnover}
                    onChange={(e) => setManualTurnover(e.target.value)}
                    placeholder="e.g. 500 or -500"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Current Remaining Turnover: <span className="text-white font-bold">{editingUser.remainingTurnover || 0}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
