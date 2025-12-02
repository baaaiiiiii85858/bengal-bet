"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Rocket, Coins } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { useUser } from "@/context/UserContext";

const getNow = () => Date.now();

export function CrashGame() {
  const { balance, updateBalance, wager, user } = useUser();
  const [multiplier, setMultiplier] = useState(1.00);
  const [isPlaying, setIsPlaying] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [bet, setBet] = useState(10);
  const [cashedOut, setCashedOut] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [winRatio, setWinRatio] = useState(60);

  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(0);
  const animateRef = useRef<() => void | undefined>(undefined);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "game_settings", "crash");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setWinRatio(docSnap.data().winRatio || 60);
        }
      } catch (error) {
        console.error("Error fetching game settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const generateCrashPoint = useCallback((ratio: number) => {
    const isGood = Math.random() * 100 < ratio;
    if (isGood) {
      return 1.5 + Math.random() * (Math.random() * 10); 
    } else {
      return 1.0 + Math.random() * 0.4;
    }
  }, []);

  const animate = useCallback(() => {
    const now = getNow();
    const elapsed = (now - startTimeRef.current) / 1000;
    
    const currentMultiplier = 1 + Math.pow(elapsed, 2) * 0.1; 
    
    if (currentMultiplier >= crashPointRef.current) {
      setMultiplier(crashPointRef.current);
      setCrashed(true);
      setIsPlaying(false);
    } else {
      setMultiplier(currentMultiplier);
      if (animateRef.current) {
        requestRef.current = requestAnimationFrame(animateRef.current);
      }
    }
  }, []);

  useEffect(() => {
    animateRef.current = animate;
  }, [animate]);

  const startGame = useCallback(() => {
    if (balance < bet) {
      alert("Insufficient balance!");
      return;
    }
    updateBalance(-bet);
    wager(bet); // Deduct from turnover requirement
    setIsPlaying(true);
    setCrashed(false);
    setCashedOut(false);
    setMultiplier(1.00);
    setWinAmount(0);
    
    crashPointRef.current = generateCrashPoint(winRatio);
    startTimeRef.current = getNow();
    requestRef.current = requestAnimationFrame(animate);
  }, [balance, bet, winRatio, updateBalance, wager, generateCrashPoint, animate]);

  useEffect(() => {
    if (crashed && user) {
      addDoc(collection(db, "bets"), {
        userId: user.id,
        username: user.name,
        game: "Crash",
        amount: bet,
        result: "loss",
        payout: 0,
        createdAt: new Date().toISOString()
      }).catch(console.error);
    }
  }, [crashed, user, bet]);

  const cashOut = () => {
    if (!isPlaying || crashed || cashedOut) return;
    
    const win = bet * multiplier;
    setWinAmount(win);
    updateBalance(win);
    setCashedOut(true);
    setIsPlaying(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    // Record Win
    if (user) {
      addDoc(collection(db, "bets"), {
        userId: user.id,
        username: user.name,
        game: "Crash",
        amount: bet,
        result: "win",
        payout: win,
        createdAt: new Date().toISOString()
      }).catch(console.error);
    }
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

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
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-8 relative overflow-hidden">
        
        {/* Graph / Multiplier Display */}
        <div className="relative w-full max-w-2xl aspect-video bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden">
          {/* Background Grid */}
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-10">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="border border-white/20" />
            ))}
          </div>

          <div className="relative z-10 text-center">
            <div className={cn(
              "text-7xl font-black transition-colors font-mono",
              crashed ? "text-red-500" : cashedOut ? "text-green-500" : "text-white"
            )}>
              {multiplier.toFixed(2)}x
            </div>
            {crashed && <div className="text-red-500 font-bold mt-2 text-xl">CRASHED!</div>}
            {cashedOut && <div className="text-green-500 font-bold mt-2 text-xl">CASHED OUT! (+৳{winAmount.toFixed(2)})</div>}
          </div>

          {/* Rocket Animation (Simple) */}
          {!crashed && !cashedOut && isPlaying && (
             <Rocket className="absolute bottom-10 left-10 w-12 h-12 text-yellow-500 animate-bounce" />
          )}
        </div>

        {/* Controls */}
        <div className="w-full max-w-md space-y-4">
          <div className="flex justify-center space-x-2">
            {[10, 50, 100, 500].map((amount) => (
              <button
                key={amount}
                onClick={() => setBet(amount)}
                disabled={isPlaying}
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

          <div className="flex gap-4">
             {!isPlaying ? (
               <Button
                variant="gold"
                size="lg"
                onClick={startGame}
                className="w-full h-16 text-xl font-bold shadow-[0_0_15px_rgba(255,215,0,0.5)]"
              >
                BET ৳{bet}
              </Button>
             ) : (
               <Button
                variant="default"
                size="lg"
                onClick={cashOut}
                className="w-full h-16 text-xl font-bold bg-green-600 hover:bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
              >
                CASH OUT ৳{(bet * multiplier).toFixed(2)}
              </Button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
