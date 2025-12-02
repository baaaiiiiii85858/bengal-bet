"use client";

import { useState } from "react";
import { Save, Users, TrendingUp } from "lucide-react";

export default function AffiliatePage() {
  const [commission, setCommission] = useState(5); // 5% default
  
  const topReferrers = [
    { id: 1, name: "Rahim", referrals: 150, earned: 5000 },
    { id: 2, name: "Karim", referrals: 120, earned: 4200 },
    { id: 3, name: "Jamal", referrals: 85, earned: 2800 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Affiliate Program</h2>
        <p className="text-gray-400">Manage referral settings and view top performers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Card */}
        <div className="lg:col-span-1">
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Commission Settings</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Referral Commission (%)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="0" 
                    max="20" 
                    value={commission}
                    onChange={(e) => setCommission(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                  <span className="text-2xl font-bold text-yellow-500 w-16 text-right">{commission}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Percentage of every deposit given to the referrer.</p>
              </div>

              <button className="w-full py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Settings
              </button>
            </div>
          </div>
        </div>

        {/* Top Referrers */}
        <div className="lg:col-span-2">
          <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Top Referrers</h3>
            <div className="space-y-4">
              {topReferrers.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-black ${
                      index === 0 ? "bg-yellow-400" : index === 1 ? "bg-gray-300" : index === 2 ? "bg-orange-400" : "bg-white/20 text-white"
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-white">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.referrals} Referrals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-500">+৳{user.earned}</p>
                    <p className="text-xs text-gray-500">Total Earned</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
