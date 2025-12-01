"use client";

import { Bell, Wallet } from "lucide-react";
import Image from "next/image";
import { useUser } from "@/context/UserContext";

export function Header() {
  const { balance } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="flex items-center justify-between px-4 h-16 max-w-md mx-auto">
        <div className="flex items-center space-x-2">
          <div className="relative w-10 h-10">
            <Image 
              src="/logo.png" 
              alt="Bengal Slot" 
              fill
              className="object-contain"
            />
          </div>
          <span className="font-bold text-white text-lg">Bengal Slot</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            <Wallet className="w-4 h-4 text-gold" />
            <span className="text-gold font-bold text-sm">৳ {balance.toFixed(2)}</span>
          </div>
          
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
