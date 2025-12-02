"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export function SignInTask() {
  const [rewards, setRewards] = useState<number[]>([10, 20, 30, 40, 50, 80, 100]);
  
  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const docSnap = await getDoc(doc(db, "settings", "rewards"));
        if (docSnap.exists() && docSnap.data().signInRewards) {
          setRewards(docSnap.data().signInRewards);
        }
      } catch (error) {
        console.error("Error fetching sign-in rewards:", error);
      }
    };
    fetchRewards();
  }, []);

  const days = rewards.map((amount, index) => ({
    day: index + 1,
    reward: amount,
    claimed: index < 2, // Mock claimed state for demo
    current: index === 2, // Mock current day
    big: index === 6
  }));

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white">7-Day Login Challenge</h3>
        <p className="text-slate-400 text-sm">Log in every day to claim rewards!</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {days.map((d) => (
          <div 
            key={d.day} 
            className={`relative p-2 rounded-xl border flex flex-col items-center justify-center aspect-square ${
              d.current 
                ? "bg-yellow-500/20 border-yellow-500" 
                : d.claimed 
                  ? "bg-green-500/20 border-green-500" 
                  : "bg-slate-800 border-slate-700 opacity-60"
            } ${d.big ? "col-span-2 aspect-auto" : ""}`}
          >
            {d.claimed && (
              <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                <Check className="w-2 h-2 text-black" />
              </div>
            )}
            <span className="text-xs text-slate-400 mb-1">Day {d.day}</span>
            <span className={`font-bold ${d.current ? "text-yellow-400" : "text-white"}`}>
              +৳{d.reward}
            </span>
          </div>
        ))}
      </div>

      <button className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-bold">
        Check In Now
      </button>
    </div>
  );
}
