"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Edit, Gift, CalendarCheck, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, onSnapshot } from "firebase/firestore";

interface RewardItem {
  id: string;
  title: string;
  description: string;
  amount: number;
  type: 'daily' | 'weekly' | 'one_time';
  active: boolean;
}

export default function RewardsPage() {
  const [signInRewards, setSignInRewards] = useState<number[]>([10, 20, 30, 40, 50, 80, 100]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<RewardItem | null>(null);
  const [formData, setFormData] = useState<Partial<RewardItem>>({
    title: "",
    description: "",
    amount: 0,
    type: "one_time",
    active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Sign-in Rewards
      // We'll store this in a specific document in 'settings' collection
      const settingsDoc = doc(db, "settings", "rewards");
      // Use onSnapshot for real-time updates if needed, but getDocs is fine here
      // For simplicity, let's just use a listener for the rewards collection
      
      // Fetch Custom Rewards
      const rewardsSnap = await getDocs(collection(db, "rewards"));
      const rewardsData = rewardsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RewardItem[];
      setRewards(rewardsData);

    } catch (error) {
      console.error("Error fetching rewards:", error);
    } finally {
      setLoading(false);
    }
  };

  // Separate effect for settings to handle the specific doc
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "rewards"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.signInRewards) {
          setSignInRewards(data.signInRewards);
        }
      }
    });
    return () => unsub();
  }, []);

  const handleSignInChange = (index: number, value: string) => {
    const newRewards = [...signInRewards];
    newRewards[index] = Number(value);
    setSignInRewards(newRewards);
  };

  const saveSignInRewards = async () => {
    try {
      await setDoc(doc(db, "settings", "rewards"), {
        signInRewards
      }, { merge: true });
      alert("Sign-in rewards updated successfully!");
    } catch (error) {
      console.error("Error saving sign-in rewards:", error);
      alert("Failed to save sign-in rewards.");
    }
  };

  const handleOpenModal = (reward?: RewardItem) => {
    if (reward) {
      setEditingReward(reward);
      setFormData(reward);
    } else {
      setEditingReward(null);
      setFormData({
        title: "",
        description: "",
        amount: 0,
        type: "one_time",
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReward) {
        await setDoc(doc(db, "rewards", editingReward.id), formData, { merge: true });
      } else {
        await addDoc(collection(db, "rewards"), formData);
      }
      setIsModalOpen(false);
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Error saving reward:", error);
      alert("Failed to save reward.");
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reward?")) return;
    try {
      await deleteDoc(doc(db, "rewards", id));
      fetchData();
    } catch (error) {
      console.error("Error deleting reward:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Reward Management</h2>
        <p className="text-gray-400">Configure daily tasks and custom rewards.</p>
      </div>

      {/* Sign-in Task Configuration */}
      <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-yellow-500" />
            7-Day Sign-in Rewards
          </h3>
          <button 
            onClick={saveSignInRewards}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Config
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-4">
          {signInRewards.map((amount, index) => (
            <div key={index} className="space-y-2">
              <label className="text-xs text-gray-400 block text-center">Day {index + 1}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => handleSignInChange(index, e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg pl-7 pr-2 py-2 text-white text-center font-bold focus:border-yellow-500 outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Rewards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Gift className="w-6 h-6 text-pink-500" />
            Reward Center Items
          </h3>
          <button 
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Reward
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <div key={reward.id} className="bg-[#1a1a2e] border border-white/5 rounded-xl p-5 relative group">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(reward)} className="p-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteReward(reward.id)} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  reward.type === 'daily' ? 'bg-blue-500/20 text-blue-500' :
                  reward.type === 'weekly' ? 'bg-purple-500/20 text-purple-500' :
                  'bg-yellow-500/20 text-yellow-500'
                }`}>
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">{reward.title}</h4>
                  <p className="text-gray-400 text-sm mb-2">{reward.description}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-green-500 font-bold">৳{reward.amount}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-300 capitalize">{reward.type.replace('_', ' ')}</span>
                    {!reward.active && <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-500">Inactive</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{editingReward ? "Edit Reward" : "Create New Reward"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveReward} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Weekly VIP Gift"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="e.g. Claim your weekly bonus!"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Amount (৳)</label>
                  <input 
                    type="number" 
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as RewardItem['type']})}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none"
                  >
                    <option value="one_time">One Time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                />
                <label htmlFor="active" className="text-white text-sm">Active (Visible to users)</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Reward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
