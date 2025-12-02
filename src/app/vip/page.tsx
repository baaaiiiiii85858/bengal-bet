"use client";

import { useUser } from "@/context/UserContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Trophy, Star, Gift, Check, Lock } from "lucide-react";
import { doc, updateDoc, arrayRemove, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";

export default function VipPage() {
  const { user, vipSettings, updateBalance } = useUser();
  const [claiming, setClaiming] = useState(false);

  const currentLevelId = user?.vipLevel || 0;
  const currentTurnover = user?.totalTurnover || 0;
  
  // Find next level
  const nextLevel = vipSettings.levels
    .filter((l: any) => l.id > currentLevelId)
    .sort((a: any, b: any) => a.id - b.id)[0];

  const progressPercent = nextLevel 
    ? Math.min(100, (currentTurnover / nextLevel.turnoverRequired) * 100)
    : 100;

  const handleClaim = async (reward: any) => {
    if (claiming || !user) return;
    setClaiming(true);
    try {
      // 1. Add to balance
      await updateBalance(reward.amount);
      
      // 2. Remove from claimableRewards
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        claimableRewards: arrayRemove(reward),
        "affiliateStats.totalEarnings": increment(reward.amount) // Optional: track as earnings? Or separate? Let's just add to balance.
      });
      
      alert(`Successfully claimed ৳${reward.amount}!`);
    } catch (error) {
      console.error("Error claiming reward:", error);
      alert("Failed to claim reward.");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="p-4 space-y-6 pb-20">
          {/* Hero Section */}
          <div className="bg-linear-to-br from-yellow-600 to-yellow-800 p-6 rounded-2xl text-center relative overflow-hidden shadow-lg shadow-yellow-900/20">
            <div className="absolute top-0 left-0 w-full h-full bg-white/10 pattern-grid-lg opacity-20" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 border-2 border-white/30">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-3xl font-black text-white mb-1">VIP {currentLevelId}</h1>
              <p className="text-yellow-100 text-sm font-medium tracking-wide uppercase">Current Status</p>
              
              {/* Progress Bar */}
              {nextLevel ? (
                <div className="mt-6">
                  <div className="flex justify-between text-xs text-yellow-100 mb-2 font-medium">
                    <span>৳{currentTurnover.toLocaleString()}</span>
                    <span>Target: ৳{nextLevel.turnoverRequired.toLocaleString()}</span>
                  </div>
                  <div className="h-3 bg-black/30 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                    <div 
                      className="h-full bg-white transition-all duration-1000 ease-out relative"
                      style={{ width: `${progressPercent}%` }}
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent w-full animate-shimmer" />
                    </div>
                  </div>
                  <p className="text-xs text-yellow-100 mt-2">
                    Wager ৳{(nextLevel.turnoverRequired - currentTurnover).toLocaleString()} more to reach {nextLevel.name}
                  </p>
                </div>
              ) : (
                <div className="mt-6 text-white font-bold bg-white/20 py-2 rounded-lg backdrop-blur-sm">
                  Max Level Reached! 👑
                </div>
              )}
            </div>
          </div>

          {/* Claimable Rewards */}
          {user?.claimableRewards && user.claimableRewards.length > 0 && (
            <div className="bg-linear-to-r from-green-900/50 to-emerald-900/50 border border-green-500/30 p-4 rounded-xl animate-pulse-slow">
              <h3 className="text-green-400 font-bold flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5" /> Rewards Available!
              </h3>
              <div className="space-y-3">
                {user.claimableRewards.map((reward, idx) => (
                  <div key={idx} className="bg-black/40 p-3 rounded-lg flex justify-between items-center border border-green-500/20">
                    <div>
                      <div className="text-white font-bold">Level Up Bonus</div>
                      <div className="text-xs text-green-400">VIP {reward.level} Reached</div>
                    </div>
                    <button
                      onClick={() => handleClaim(reward)}
                      disabled={claiming}
                      className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                      {claiming ? "..." : `Claim ৳${reward.amount}`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIP Levels Chart */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" /> VIP Benefits
            </h3>
            
            <div className="space-y-3">
              {vipSettings.levels.sort((a: any, b: any) => a.id - b.id).map((level: any) => {
                const isUnlocked = currentLevelId >= level.id;
                const isNext = nextLevel?.id === level.id;
                
                return (
                  <div 
                    key={level.id} 
                    className={`relative p-4 rounded-xl border transition-all ${
                      isUnlocked 
                        ? "bg-linear-to-r from-yellow-900/20 to-yellow-800/20 border-yellow-500/30" 
                        : isNext
                          ? "bg-slate-800 border-slate-600 ring-1 ring-yellow-500/50"
                          : "bg-slate-900 border-slate-800 opacity-70"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          isUnlocked ? "bg-yellow-500 text-black" : "bg-slate-700 text-slate-400"
                        }`}>
                          {level.id}
                        </div>
                        <div>
                          <div className={`font-bold ${isUnlocked ? "text-yellow-500" : "text-white"}`}>
                            {level.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            Target: ৳{level.turnoverRequired.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-400">
                          +৳{level.levelUpBonus}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">Bonus</div>
                      </div>
                    </div>

                    {isUnlocked && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-4 h-4 text-yellow-500" />
                      </div>
                    )}
                    {!isUnlocked && !isNext && (
                      <div className="absolute top-2 right-2">
                        <Lock className="w-4 h-4 text-slate-600" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
