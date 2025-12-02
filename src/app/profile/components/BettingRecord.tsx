"use client";

import { useState, useEffect } from "react";
import { Gamepad2 } from "lucide-react";

// Placeholder for now as we don't have a centralized bets collection yet
// In a real app, this would fetch from a 'bets' collection
export function BettingRecord() {
  return (
    <div className="text-center p-8 text-gray-500 bg-slate-800/50 rounded-xl border border-slate-700">
      <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p>No betting history found.</p>
      <p className="text-xs mt-2">Start playing games to see your history here!</p>
    </div>
  );
}
