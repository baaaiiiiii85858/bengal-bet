"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ArrowLeft, RotateCw, Coins, Trophy } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { useUser } from "@/context/UserContext";

const SYMBOLS = ["🍒", "🍋", "🍇", "💎", "7️⃣", "🔔"];
const BET_AMOUNTS = [10, 20, 50, 100];

export function SlotMachine() {
  const { balance, updateBalance, wager, user } = useUser();
  const [reels, setReels] = useState([0, 0, 0]);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(10);
  const [win, setWin] = useState(0);
  const [autoSpin, setAutoSpin] = useState(false);
  const [winRatio, setWinRatio] = useState(70); // Default 70%

  const spinTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "game_settings", "slots");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setWinRatio(docSnap.data().winRatio || 70);
        }
      } catch (error) {
        console.error("Error fetching game settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const generateOutcome = (ratio: number) => {
    const isWin = Math.random() * 100 < ratio;
    
    if (isWin) {
      // Determine win type: 10% chance for Jackpot (3 same), 90% for Small Win (2 same)
      const isJackpot = Math.random() < 0.1;
      const symbol = Math.floor(Math.random() * SYMBOLS.length);
      
      if (isJackpot) {
        return [symbol, symbol, symbol];
      } else {
        // Ensure exactly 2 match
        const r1 = symbol;
        const r2 = symbol;
        let r3 = Math.floor(Math.random() * SYMBOLS.length);
        while (r3 === symbol) {
          r3 = Math.floor(Math.random() * SYMBOLS.length);
        }
        // Shuffle positions
        return [r1, r2, r3].sort(() => Math.random() - 0.5);
      }
    } else {
      // Force Loss: Ensure no 2 match
      const r1 = Math.floor(Math.random() * SYMBOLS.length);
      let r2 = Math.floor(Math.random() * SYMBOLS.length);
      while (r2 === r1) r2 = Math.floor(Math.random() * SYMBOLS.length);
      let r3 = Math.floor(Math.random() * SYMBOLS.length);
      while (r3 === r1 || r3 === r2) r3 = Math.floor(Math.random() * SYMBOLS.length);
      return [r1, r2, r3];
    }
  };

  const checkWin = useCallback((currentReels: number[]) => {
    const [r1, r2, r3] = currentReels;
    let result = "loss";
    let payout = 0;

    if (r1 === r2 && r2 === r3) {
      // Jackpot
      payout = bet * 10;
      result = "win";
      setWin(payout);
      updateBalance(payout);
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      // Small win
      payout = bet * 2;
      result = "win";
      setWin(payout);
      updateBalance(payout);
    }

    // Record Bet
    if (user) {
      addDoc(collection(db, "bets"), {
        userId: user.id,
        username: user.name,
        game: "Slots",
        amount: bet,
        result,
        payout,
        createdAt: new Date().toISOString()
      }).catch(console.error);
    }
  }, [bet, updateBalance, user]);

  const spin = useCallback(() => {
    if (balance < bet) {
      alert("Insufficient balance!");
      setAutoSpin(false);
      return;
    }

    setSpinning(true);
    setWin(0);
    updateBalance(-bet);
    wager(bet);

    // Mock animation duration
    setTimeout(() => {
      const newReels = generateOutcome(winRatio);
      setReels(newReels);
      setSpinning(false);
      checkWin(newReels);
    }, 1000);
  }, [balance, bet, updateBalance, checkWin, winRatio, wager]);

  useEffect(() => {
    if (autoSpin && !spinning && balance >= bet) {
      spinTimeout.current = setTimeout(spin, 1500);
    }
    return () => {
      if (spinTimeout.current) clearTimeout(spinTimeout.current);
    };
  }, [autoSpin, spinning, balance, bet, spin]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <Link href="/" className="p-2 hover:bg-slate-800 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex items-center space-x-2 bg-slate-800 px-4 py-1 rounded-full">
          <Coins className="w-4 h-4 text-gold" />
          <span className="font-bold text-gold">৳ {balance.toFixed(2)}</span>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-8">
        {/* Reels */}
        <div className="relative bg-slate-800 p-4 rounded-xl border-4 border-gold shadow-[0_0_20px_rgba(255,215,0,0.3)]">
          <div className="flex space-x-2">
            {reels.map((symbolIndex, i) => (
              <div 
                key={i} 
                className="w-20 h-24 bg-white rounded-lg flex items-center justify-center text-4xl overflow-hidden relative"
              >
                <div className={cn("transition-transform duration-100", spinning && "animate-pulse blur-sm")}>
                  {spinning ? "❓" : SYMBOLS[symbolIndex]}
                </div>
              </div>
            ))}
          </div>
          
          {/* Win Overlay */}
          {win > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg z-10 animate-in fade-in zoom-in">
              <div className="text-center">
                <Trophy className="w-12 h-12 text-gold mx-auto mb-2 animate-bounce" />
                <div className="text-3xl font-bold text-gold">BIG WIN!</div>
                <div className="text-xl text-white">৳ {win}</div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="w-full max-w-md space-y-4">
          <div className="flex justify-center space-x-2">
            {BET_AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => setBet(amount)}
                disabled={spinning}
                className={cn(
                  "px-4 py-2 rounded-full font-bold text-sm transition-colors",
                  bet === amount 
                    ? "bg-gold text-slate-900" 
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                )}
              >
                {amount}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Button
              variant={autoSpin ? "gold" : "outline"}
              onClick={() => setAutoSpin(!autoSpin)}
              className="w-16 h-16 rounded-full flex flex-col items-center justify-center text-xs gap-1"
            >
              <RotateCw className={cn("w-5 h-5", autoSpin && "animate-spin")} />
              AUTO
            </Button>

            <Button
              variant="gold"
              size="lg"
              onClick={spin}
              disabled={spinning || autoSpin}
              className="w-24 h-24 rounded-full text-xl font-bold shadow-[0_0_15px_rgba(255,215,0,0.5)] active:scale-95 transition-transform"
            >
              SPIN
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
