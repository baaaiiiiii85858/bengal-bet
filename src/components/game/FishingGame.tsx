"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, Fish, Coins } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { useUser } from "@/context/UserContext";

export function FishingGame() {
  const { balance, updateBalance, wager, user } = useUser();
  const [fishes, setFishes] = useState<{id: number, x: number, y: number, value: number, type: string}[]>(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      value: Math.random() > 0.8 ? 50 : 10,
      type: Math.random() > 0.8 ? "big" : "small"
    }));
  });
  const [bet, setBet] = useState(10);
  const [winRatio, setWinRatio] = useState(50);
  const [lastWin, setLastWin] = useState(0);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "game_settings", "fishing");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setWinRatio(docSnap.data().winRatio || 50);
        }
      } catch (error) {
        console.error("Error fetching game settings:", error);
      }
    };
    fetchSettings();
    
    // Move fishes interval
    const interval = setInterval(() => {
      setFishes(prev => prev.map(fish => ({
        ...fish,
        x: (fish.x + (Math.random() - 0.5) * 5 + 100) % 100,
        y: Math.max(10, Math.min(90, fish.y + (Math.random() - 0.5) * 5))
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const shoot = useCallback((fishId: number, fishValue: number) => {
    if (balance < bet) {
      alert("Insufficient balance!");
      return;
    }
    updateBalance(-bet);
    wager(bet); // Deduct from turnover requirement

    // Determine hit success based on winRatio
    const hitChance = winRatio; 
    const isHit = Math.random() * 100 < hitChance;

    if (isHit) {
      // Calculate win amount
      const multiplier = fishValue === 50 ? 5 : 2;
      const win = bet * multiplier;
      
      setLastWin(win);
      updateBalance(win);
      
      // Remove caught fish and spawn a new one
      setFishes(prev => prev.map(f => 
        f.id === fishId 
          ? { 
              id: Math.random(), 
              x: Math.random() * 100, 
              y: Math.random() * 80 + 10, 
              value: Math.random() > 0.8 ? 50 : 10,
              type: Math.random() > 0.8 ? "big" : "small"
            } 
          : f
      ));

      // Record Win
      if (user) {
        addDoc(collection(db, "bets"), {
          userId: user.id,
          username: user.name,
          game: "Fishing",
          amount: bet,
          result: "win",
          payout: win,
          createdAt: new Date().toISOString()
        }).catch(console.error);
      }
    } else {
      setLastWin(0);
      // Record Loss
      if (user) {
        addDoc(collection(db, "bets"), {
          userId: user.id,
          username: user.name,
          game: "Fishing",
          amount: bet,
          result: "loss",
          payout: 0,
          createdAt: new Date().toISOString()
        }).catch(console.error);
      }
    }
  }, [balance, bet, winRatio, updateBalance, wager, user]);

  return (
    <div className="flex flex-col h-screen bg-blue-950 text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-blue-900/50 border-b border-blue-800 z-20">
        <Link href="/" className="p-2 hover:bg-blue-800 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex items-center space-x-2 bg-blue-800 px-4 py-1 rounded-full">
          <Coins className="w-4 h-4 text-gold" />
          <span className="font-bold text-gold">৳ {balance.toFixed(2)}</span>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative cursor-crosshair">
        {/* Ocean Background */}
        <div className="absolute inset-0 bg-linear-to-b from-blue-600 to-blue-950 opacity-50" />
        
        {/* Fishes */}
        {fishes.map((fish) => (
          <button
            key={fish.id}
            onClick={() => shoot(fish.id, fish.value)}
            className="absolute transition-all duration-1000 ease-in-out transform hover:scale-110"
            style={{ left: `${fish.x}%`, top: `${fish.y}%` }}
          >
            <div className="relative">
              <Fish 
                className={cn(
                  "text-white drop-shadow-lg", 
                  fish.type === "big" ? "w-24 h-24 text-yellow-400" : "w-12 h-12 text-cyan-300"
                )} 
              />
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/50 px-2 rounded text-xs">
                {fish.type === "big" ? "5x" : "2x"}
              </span>
            </div>
          </button>
        ))}

        {/* Win Notification */}
        {lastWin > 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 animate-bounce">
            <div className="bg-yellow-500 text-black font-black text-4xl px-8 py-4 rounded-full shadow-lg border-4 border-white">
              + ৳{lastWin}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-blue-900/80 border-t border-blue-800 z-20">
        <div className="flex justify-center items-center gap-4">
          <span className="font-bold">BET:</span>
          {[10, 20, 50, 100].map((amount) => (
            <button
              key={amount}
              onClick={() => setBet(amount)}
              className={cn(
                "px-4 py-2 rounded-full font-bold text-sm transition-colors",
                bet === amount 
                  ? "bg-yellow-500 text-black" 
                  : "bg-blue-800 text-blue-200 hover:bg-blue-700"
              )}
            >
              ৳{amount}
            </button>
          ))}
        </div>
        <p className="text-center text-blue-300 text-xs mt-2">Click on fish to shoot! (Cost: 1 Bet)</p>
      </div>
    </div>
  );
}
