"use client";

import { useState, useEffect } from "react";
import { Gift, Trophy, Star } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

interface RewardItem {
  id: string;
  title: string;
  description: string;
  amount: number;
  type: 'daily' | 'weekly' | 'one_time';
}

export function RewardCenter() {
  const [rewards, setRewards] = useState<RewardItem[]>([]);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const q = query(collection(db, "rewards"), where("active", "==", true));
        const querySnapshot = await getDocs(q);
        const rewardsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as RewardItem[];
        setRewards(rewardsData);
      } catch (error) {
        console.error("Error fetching rewards:", error);
      }
    };
    fetchRewards();
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-linear-to-r from-purple-600 to-blue-600 p-6 rounded-2xl text-center">
        <Trophy className="w-16 h-16 mx-auto text-yellow-300 mb-2" />
        <h3 className="text-2xl font-bold text-white">Level 1</h3>
        <p className="text-white/80">Upgrade to unlock more rewards!</p>
        <div className="mt-4 w-full bg-black/30 h-2 rounded-full overflow-hidden">
          <div className="bg-yellow-400 h-full w-1/3"></div>
        </div>
        <p className="text-xs text-white/60 mt-1">300/1000 XP to Level 2</p>
      </div>

      {rewards.length === 0 ? (
        <div className="text-center p-8 text-gray-500">No rewards available at the moment.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {rewards.map((reward) => (
            <div key={reward.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center flex flex-col items-center h-full">
              {reward.type === 'daily' ? (
                <Gift className="w-8 h-8 mx-auto text-pink-500 mb-2" />
              ) : (
                <Star className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
              )}
              <h4 className="font-bold text-white text-sm">{reward.title}</h4>
              <p className="text-xs text-gray-400 mb-2 line-clamp-2">{reward.description}</p>
              <div className="mt-auto">
                <span className="block text-green-400 font-bold text-sm mb-1">৳{reward.amount}</span>
                <button className="px-4 py-1 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold transition-colors">
                  Claim
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
