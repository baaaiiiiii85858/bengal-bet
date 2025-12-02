"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, getDoc, setDoc, where } from "firebase/firestore";
import { Users, DollarSign, TrendingUp, Search, Save, Eye, X } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface AffiliateUser {
  id: string;
  name: string;
  phone: string;
  referralCode: string;
  affiliateStats: {
    totalInvited: number;
    totalEarnings: number;
    claimable: number;
  };
}

interface ReferredUser {
  id: string;
  name: string;
  phone: string;
  totalTurnover: number;
  referralBonusGiven: boolean;
}

export default function AdminAffiliatePage() {
  const [affiliates, setAffiliates] = useState<AffiliateUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Settings State
  const [turnoverTarget, setTurnoverTarget] = useState(4000);
  const [bonusAmount, setBonusAmount] = useState(200);
  const [commissionPercent, setCommissionPercent] = useState(5);
  const [referralDomain, setReferralDomain] = useState("https://bengalbet.com");

  // Network View State
  const [selectedAffiliate, setSelectedAffiliate] = useState<AffiliateUser | null>(null);
  const [networkUsers, setNetworkUsers] = useState<ReferredUser[]>([]);
  const [networkLoading, setNetworkLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch Affiliates
      const q = query(collection(db, "users"), orderBy("affiliateStats.totalInvited", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as AffiliateUser))
        .filter(u => u.affiliateStats?.totalInvited > 0);
      setAffiliates(data);

      // Fetch Settings
      const settingsSnap = await getDoc(doc(db, "settings", "affiliate"));
      if (settingsSnap.exists()) {
        const s = settingsSnap.data();
        setTurnoverTarget(s.turnoverTarget || 4000);
        setBonusAmount(s.bonusAmount || 200);
        setCommissionPercent(s.commissionPercent || 5);
        setReferralDomain(s.referralDomain || "https://bengalbet.com");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      await setDoc(doc(db, "settings", "affiliate"), {
        turnoverTarget,
        bonusAmount,
        commissionPercent,
        referralDomain
      }, { merge: true });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    }
  };

  const viewNetwork = async (affiliate: AffiliateUser) => {
    setSelectedAffiliate(affiliate);
    setNetworkLoading(true);
    try {
      const q = query(collection(db, "users"), where("referredBy", "==", affiliate.id));
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReferredUser));
      setNetworkUsers(users);
    } catch (error) {
      console.error("Error fetching network:", error);
    } finally {
      setNetworkLoading(false);
    }
  };

  const filteredAffiliates = affiliates.filter(a => 
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.phone?.includes(searchTerm) ||
    a.referralCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPayout = affiliates.reduce((sum, a) => sum + (a.affiliateStats?.totalEarnings || 0), 0);
  const totalInvited = affiliates.reduce((sum, a) => sum + (a.affiliateStats?.totalInvited || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Affiliate Management</h1>
      </div>

      {/* Settings Section */}
      <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-yellow-500" /> Program Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Turnover Target (BDT)</label>
            <Input 
              type="number" 
              value={turnoverTarget}
              onChange={(e) => setTurnoverTarget(Number(e.target.value))}
              className="bg-black/50 border-white/10"
            />
            <p className="text-xs text-gray-500 mt-1">User must bet this amount to trigger bonus.</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Bonus Amount (BDT)</label>
            <Input 
              type="number" 
              value={bonusAmount}
              onChange={(e) => setBonusAmount(Number(e.target.value))}
              className="bg-black/50 border-white/10"
            />
            <p className="text-xs text-gray-500 mt-1">Amount given to referrer.</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Commission (%)</label>
            <Input 
              type="number" 
              value={commissionPercent}
              onChange={(e) => setCommissionPercent(Number(e.target.value))}
              className="bg-black/50 border-white/10"
            />
            <p className="text-xs text-gray-500 mt-1">% of user loss given to referrer.</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Base Referral Domain</label>
            <Input 
              type="text" 
              value={referralDomain}
              onChange={(e) => setReferralDomain(e.target.value)}
              className="bg-black/50 border-white/10"
              placeholder="https://bengalbet.com"
            />
            <p className="text-xs text-gray-500 mt-1">Domain used for referral links.</p>
          </div>
        </div>
        <button 
          onClick={saveSettings}
          className="mt-4 px-6 py-2 bg-yellow-500 text-black rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-400"
        >
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-slate-400 text-sm">Active Affiliates</span>
          </div>
          <div className="text-2xl font-bold text-white">{affiliates.length}</div>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-slate-400 text-sm">Total Invited Users</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalInvited}</div>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-slate-400 text-sm">Total Commission Paid</span>
          </div>
          <div className="text-2xl font-bold text-white">৳ {totalPayout.toFixed(2)}</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
        <Input 
          placeholder="Search by name, phone or code..." 
          className="pl-10 bg-slate-800 border-slate-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/50 text-xs uppercase font-medium text-slate-300">
              <tr>
                <th className="p-4">Affiliate</th>
                <th className="p-4">Code</th>
                <th className="p-4 text-center">Invited</th>
                <th className="p-4 text-right">Total Earnings</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">Loading...</td>
                </tr>
              ) : filteredAffiliates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">No affiliates found</td>
                </tr>
              ) : (
                filteredAffiliates.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-xs">{user.phone}</div>
                    </td>
                    <td className="p-4 font-mono text-xs bg-slate-900/30 rounded px-2 py-1 w-fit">
                      {user.referralCode}
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full text-xs font-bold">
                        {user.affiliateStats?.totalInvited || 0}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-green-400">
                      ৳ {user.affiliateStats?.totalEarnings?.toFixed(2) || "0.00"}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => viewNetwork(user)}
                        className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 text-xs font-bold flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3 h-3" /> View Network
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Network Modal */}
      {selectedAffiliate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Referral Network</h3>
                <p className="text-sm text-gray-400">Affiliate: {selectedAffiliate.name} ({selectedAffiliate.referralCode})</p>
              </div>
              <button onClick={() => setSelectedAffiliate(null)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {networkLoading ? (
                <p className="text-center text-gray-400">Loading network...</p>
              ) : networkUsers.length === 0 ? (
                <p className="text-center text-gray-400">No referred users found.</p>
              ) : (
                <table className="w-full text-left text-sm text-slate-400">
                  <thead className="bg-slate-900/50 text-xs uppercase font-medium text-slate-300">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3 text-right">Total Turnover</th>
                      <th className="p-3 text-center">Bonus Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {networkUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="p-3">
                          <div className="font-medium text-white">{u.name}</div>
                          <div className="text-xs">{u.phone}</div>
                        </td>
                        <td className="p-3 text-right font-mono text-white">
                          ৳{u.totalTurnover || 0}
                        </td>
                        <td className="p-3 text-center">
                          {u.referralBonusGiven ? (
                            <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs font-bold">Paid</span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded text-xs font-bold">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
